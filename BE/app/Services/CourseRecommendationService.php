<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CourseRecommendationService
{
    private const BASE_MAX_SKS = 20;
    private const HIGH_IPK_MAX_SKS = 24;
    private const MIN_IPK_FOR_ELECTIVES = 3.0;
    private const MAX_ELECTIVE_COUNT = 2;
    // Izinkan AI menawarkan MK hingga 4 semester di atas target agar mahasiswa awal tetap mendapat opsi
    private const MAX_ADVANCE_SEMESTER_GAP = 4;

    private array $electiveCandidates = [];

    /**
     * Susun paket rekomendasi terstruktur untuk mahasiswa.
     */
    public function buildFor(Mahasiswa $mahasiswa): array
    {
        $pool = $this->prepareCoursePool($mahasiswa);

        $selectedElectives = $this->selectElectives(
            $pool['eligible_electives'],
            $mahasiswa,
            $pool['max_additional_sks']
        );

        return $this->compileResult($pool, $selectedElectives);
    }

    public function prepareCoursePool(Mahasiswa $mahasiswa): array
    {
        $targetSemester = max(1, (int) $mahasiswa->semester_saat_ini);
        $maxSks = $this->determineMaxSks($mahasiswa->ipk);
        $allowElectives = $this->shouldOfferElectives($mahasiswa, $targetSemester);

        $takenCourseCodes = $this->getCompletedCourseCodes($mahasiswa);
        $packageCourses = $this->getPackageCourses($targetSemester, $takenCourseCodes);
        $packageSks = $packageCourses->sum('sks');

        // Batasi total SKS program ke 144; gunakan sisa kuota sebagai batas atas semester ini.
        $totalTaken = (int) ($mahasiswa->total_sks ?? 0);
        $remainingDegreeQuota = max(0, 144 - $totalTaken);
        $maxSks = min($maxSks, $remainingDegreeQuota);

        $eligibleElectives = $allowElectives
            ? $this->getEligibleElectives($mahasiswa, $targetSemester, $takenCourseCodes)
            : collect();

        // Jika paket wajib kosong, izinkan memilih mata kuliah pilihan agar tetap ada rekomendasi.
        if ($packageCourses->isEmpty() && $eligibleElectives->isEmpty()) {
            $eligibleElectives = $this->getEligibleElectives($mahasiswa, $targetSemester, $takenCourseCodes);
        }

        $maxAdditionalSks = max(0, $maxSks - $packageSks);

        return [
            'target_semester' => $targetSemester,
            'max_sks' => $maxSks,
            'package_sks' => $packageSks,
            'max_additional_sks' => $maxAdditionalSks,
            'can_take_electives' => $allowElectives,
            'package_courses' => $packageCourses,
            'eligible_electives' => $eligibleElectives,
            'taken_course_codes' => $takenCourseCodes,
            'serialized_package' => $this->serializeCourses(
                $packageCourses,
                'Wajib',
                "Paket wajib semester {$targetSemester}"
            ),
            'serialized_electives' => $this->serializeCourses($eligibleElectives, 'Pilihan'),
            'target_semester' => $targetSemester,
        ];
    }

    public function finalizeWithAi(Mahasiswa $mahasiswa, array $pool, array $aiRecommendations): array
    {
        $eligible = $pool['eligible_electives'] ?? collect();
        $maxAdditional = $pool['max_additional_sks'] ?? 0;

        $aiMeta = [];
        foreach ($aiRecommendations as $index => $rec) {
            $code = strtoupper(trim($rec['kode_mk'] ?? ''));
            if (empty($code)) {
                continue;
            }

            $aiMeta[$code] = [
                'reason' => $rec['alasan_rekomendasi'] ?? $rec['alasan'] ?? null,
                'score' => $rec['skor_rekomendasi'] ?? $rec['score'] ?? null,
                'rank' => $index,
            ];
        }

        $filteredPool = $eligible->filter(function (MataKuliah $course) use ($aiMeta) {
            $code = strtoupper($course->kode_mk ?? '');
            return isset($aiMeta[$code]);
        })->values();

        $selectedElectives = $this->selectElectives(
            $filteredPool->isNotEmpty() ? $filteredPool : $eligible,
            $mahasiswa,
            $maxAdditional,
            $filteredPool->isNotEmpty() ? $aiMeta : []
        );

        return $this->compileResult($pool, $selectedElectives);
    }

    public function getMaxElectiveCount(): int
    {
        return self::MAX_ELECTIVE_COUNT;
    }

    private function determineMaxSks(?float $ipk): int
    {
        if ($ipk !== null && $ipk >= self::MIN_IPK_FOR_ELECTIVES) {
            return self::HIGH_IPK_MAX_SKS;
        }

        return self::BASE_MAX_SKS;
    }

    private function shouldOfferElectives(Mahasiswa $mahasiswa, int $targetSemester): bool
    {
        return $mahasiswa->ipk !== null
            && $mahasiswa->ipk >= self::MIN_IPK_FOR_ELECTIVES
            && $targetSemester >= 2;
    }

    private function getCompletedCourseCodes(Mahasiswa $mahasiswa): array
    {
        $takenFromPlans = $mahasiswa->rencanaStudi()
            ->where('status', 'Disetujui')
            ->with('details.mataKuliah')
            ->get()
            ->flatMap(function ($plan) {
                return $plan->details->map(function ($detail) {
                    return $detail->mataKuliah?->kode_mk;
                })->filter();
            })
            ->filter()
            ->unique()
            ->values()
            ->all();

        $takenFromTranscript = $mahasiswa->transkrip()
            ->pluck('kode_mk')
            ->filter()
            ->unique()
            ->values()
            ->all();

        return array_values(array_unique(array_merge($takenFromPlans, $takenFromTranscript)));
    }

    private function getPackageCourses(int $targetSemester, array $taken): Collection
    {
        return MataKuliah::where('semester', $targetSemester)
            ->where('bidang_minat', 'Wajib')
            ->get()
            ->filter(function (MataKuliah $course) use ($taken) {
                return !in_array($course->kode_mk, $taken, true);
            })
            ->values();
    }

    private function getEligibleElectives(Mahasiswa $mahasiswa, int $targetSemester, array $taken): Collection
    {
        return MataKuliah::where(function ($query) {
                $query->whereNull('bidang_minat')->orWhere('bidang_minat', '!=', 'Wajib');
            })
            ->get()
            ->filter(function (MataKuliah $course) use ($taken, $targetSemester) {
                if (in_array($course->kode_mk, $taken, true)) {
                    return false;
                }

                if ($this->isPracticum($course->nama_mk)) {
                    return false;
                }

                if ($course->semester && $course->semester < 2) {
                    return false;
                }

                // Semester 1 tidak boleh ambil atas
                if ($targetSemester <= 1 && $course->semester && $course->semester > 1) {
                    return false;
                }

                return true;
            })
            ->values();
    }

    private function isPracticum(?string $name): bool
    {
        if (!$name) {
            return false;
        }

        $lower = Str::lower($name);

        return Str::contains($lower, ['praktikum', 'laboratorium', 'lab.']);
    }

    private function selectElectives(
        Collection $pool,
        Mahasiswa $mahasiswa,
        int $maxAdditionalSks,
        array $aiMeta = []
    ): Collection
    {
        $this->electiveCandidates = [];

        if ($pool->isEmpty() || $maxAdditionalSks <= 0) {
            return collect();
        }

        $scored = $pool->map(function (MataKuliah $course) use ($mahasiswa, $aiMeta) {
            $score = $this->scoreElective($course, $mahasiswa);
            $matchedInterests = $this->matchInterests($course, $mahasiswa->interests ?? []);

            $code = strtoupper($course->kode_mk ?? '');
            $meta = $aiMeta[$code] ?? null;

            if ($meta) {
                $parsedAiScore = $this->parseAiScore($meta['score'] ?? null);

                if ($parsedAiScore !== null) {
                    $score = max($score, $parsedAiScore);
                } else {
                    $rank = isset($meta['rank']) ? (int) $meta['rank'] : 0;
                    $rankScore = max(0, 95 - ($rank * 7));
                    $score = max($score, $rankScore);
                }
            }

            $reasonParts = [];
            if (!empty($matchedInterests)) {
                $reasonParts[] = 'Sesuai minat: ' . implode(', ', $matchedInterests);
            }
            if ($mahasiswa->future_focus) {
                $reasonParts[] = 'Relevan dengan fokus ' . $mahasiswa->future_focus;
            }
            if ($meta && !empty($meta['reason'])) {
                $reasonParts[] = 'Catatan AI: ' . $meta['reason'];
            }

            if (empty($reasonParts)) {
                $reasonParts[] = 'Mata kuliah pilihan pendukung kompetensi';
            }

            // Jika semua sinyal nol, beri skor dasar sederhana agar tidak seragam.
            if ($score <= 0) {
                $score = 35
                    + max(0, 6 - abs(((int) $course->semester) - (int) $mahasiswa->semester_saat_ini)) * 2
                    - ((int) $course->sks * 1.5);
                $score = max(5, min(95, $score));
            }

            return [
                'type' => 'pilihan',
                'course' => $course,
                'score' => $score,
                'alasan' => implode('. ', $reasonParts),
                'ai_rank' => isset($meta['rank']) ? (int) $meta['rank'] : PHP_INT_MAX,
            ];
        });

        $scored = $scored
            ->sort(function ($a, $b) {
                if ($a['score'] === $b['score']) {
                    return ($a['ai_rank'] ?? PHP_INT_MAX) <=> ($b['ai_rank'] ?? PHP_INT_MAX);
                }

                return $b['score'] <=> $a['score'];
            })
            ->values();

        if ($scored->isEmpty()) {
            return collect();
        }

        if ($scored->first()['score'] <= 0) {
            $scored = $scored->sortBy('course.nama_mk')->values();
        }

        $candidateCount = max(self::MAX_ELECTIVE_COUNT * 2, 5);
        $this->electiveCandidates = $scored
            ->take($candidateCount)
            ->map(function (array $entry) {
                /** @var MataKuliah $course */
                $course = $entry['course'];

                return [
                    'kode_mk' => $course->kode_mk,
                    'nama_mk' => $course->nama_mk,
                    'sks' => (int) $course->sks,
                    'semester' => (int) $course->semester,
                    'bidang_minat' => $course->bidang_minat,
                    'alasan' => $entry['alasan'],
                    'score' => min(100, max(0, (int) round($entry['score']))),
                ];
            })
            ->values()
            ->all();

        $selected = collect();
        $usedSks = 0;

        foreach ($scored as $entry) {
            /** @var MataKuliah $course */
            $course = $entry['course'];
            $courseSks = (int) $course->sks;

            if ($courseSks <= 0) {
                continue;
            }

            if ($usedSks + $courseSks > $maxAdditionalSks) {
                continue;
            }

            $selected->push([
                'type' => $entry['type'],
                'course' => $course,
                'alasan' => $entry['alasan'],
                'score' => min(100, max(0, (int) round($entry['score']))),
            ]);

            $usedSks += $courseSks;

            if ($selected->count() >= self::MAX_ELECTIVE_COUNT) {
                break;
            }
        }

        return $selected;
    }

    private function compileResult(array $pool, Collection $selectedElectives): array
    {
        /** @var Collection $packageCourses */
        $packageCourses = $pool['package_courses'];
        $targetSemester = $pool['target_semester'];

        $recommendations = $packageCourses->map(function (MataKuliah $course) use ($targetSemester) {
            return [
                'type' => 'wajib',
                'course' => $course,
                'alasan' => "Mata kuliah paket semester {$targetSemester}",
                'score' => null,
            ];
        })->values();

        $recommendations = $recommendations->concat($selectedElectives)->values();

        $selectedElectiveCodes = $recommendations
            ->filter(function (array $entry) {
                return $entry['type'] === 'pilihan';
            })
            ->map(function (array $entry) {
                /** @var MataKuliah $course */
                $course = $entry['course'];
                return strtoupper($course->kode_mk ?? '');
            })
            ->filter()
            ->values()
            ->all();

        $packageSummary = collect($pool['serialized_package'] ?? [])
            ->map(function (array $item) {
                $item['selected'] = true;
                return $item;
            })
            ->values()
            ->all();

        $electiveSummary = collect($pool['serialized_electives'] ?? [])
            ->map(function (array $item) use ($selectedElectiveCodes) {
                $code = strtoupper($item['kode_mk'] ?? '');
                $item['selected'] = in_array($code, $selectedElectiveCodes, true);
                return $item;
            })
            ->values()
            ->all();

        $highlightedElectives = $recommendations
            ->filter(function (array $entry) {
                return $entry['type'] === 'pilihan';
            })
            ->map(function (array $entry) {
                /** @var MataKuliah $course */
                $course = $entry['course'];

                return [
                    'kode_mk' => $course->kode_mk,
                    'nama_mk' => $course->nama_mk,
                    'sks' => (int) $course->sks,
                    'semester' => (int) $course->semester,
                    'bidang_minat' => $course->bidang_minat,
                    'alasan' => $entry['alasan'],
                    'score' => $entry['score'],
                ];
            })
            ->values()
            ->all();

        $totalSks = $recommendations->reduce(function ($carry, $entry) {
            /** @var MataKuliah $course */
            $course = $entry['course'];
            return $carry + (int) $course->sks;
        }, 0);

        return [
            'target_semester' => $pool['target_semester'],
            'max_sks' => $pool['max_sks'],
            'package_sks' => $pool['package_sks'],
            'max_additional_sks' => $pool['max_additional_sks'] ?? 0,
            'total_sks' => $totalSks,
            'can_take_electives' => $pool['can_take_electives'],
            'serialized_package' => $packageSummary,
            'serialized_electives' => $electiveSummary,
            'highlighted_electives' => $highlightedElectives,
            'suggested_electives' => $this->electiveCandidates,
            'recommendations' => $recommendations->map(function (array $entry) {
                /** @var MataKuliah $course */
                $course = $entry['course'];

                return [
                    'kode_mk' => $course->kode_mk,
                    'nama_mk' => $course->nama_mk,
                    'sks' => (int) $course->sks,
                    'semester' => (int) $course->semester,
                    'bidang_minat' => $course->bidang_minat,
                    'type' => $entry['type'],
                    'alasan' => $entry['alasan'],
                    'score' => $entry['type'] === 'wajib' ? null : $entry['score'],
                    'mata_kuliah_id' => $course->id,
                ];
            })->values()->all(),
        ];
    }

    private function scoreElective(MataKuliah $course, Mahasiswa $mahasiswa): float
    {
        $score = 0.0;
        $name = Str::lower($course->nama_mk ?? '');
        $interestMatches = $this->matchInterests($course, $mahasiswa->interests ?? []);

        if (!empty($interestMatches)) {
            $score += 40 + (count($interestMatches) * 5);
        }

        if ($mahasiswa->future_focus) {
            $score += $this->scoreFutureFocus($name, $mahasiswa->future_focus);
        }

        if ($mahasiswa->learning_preference) {
            $score += $this->scoreLearningPreference($name, $mahasiswa->learning_preference);
        }

        // Tambahan kecil jika mata kuliah berasal dari semester target atau satu tingkat di atas
        if ($course->semester) {
            $gap = (int) $course->semester - (int) $mahasiswa->semester_saat_ini;
            if ($gap === 0) {
                $score += 5;
            } elseif ($gap === 1) {
                $score += 3;
            }
        }

        return min(100, $score);
    }

    private function matchInterests(MataKuliah $course, array $interests): array
    {
        if (empty($interests)) {
            return [];
        }

        $name = Str::lower($course->nama_mk ?? '');
        $field = Str::lower($course->bidang_minat ?? '');

        $keywordsMap = $this->interestKeywords();
        $matched = [];

        foreach ($interests as $interest) {
            $slug = Str::lower($interest);
            $keywords = $keywordsMap[$slug] ?? [$slug];

            foreach ($keywords as $keyword) {
                if (Str::contains($name, $keyword) || Str::contains($field, $keyword)) {
                    $matched[] = $interest;
                    break;
                }
            }
        }

        return array_values(array_unique($matched));
    }

    private function scoreFutureFocus(string $courseName, string $focus): float
    {
        $focus = Str::lower($focus);

        if ($focus === 's2') {
            if (Str::contains($courseName, ['riset', 'penelitian', 'metode', 'teori'])) {
                return 20;
            }
        }

        if ($focus === 'industri') {
            if (Str::contains($courseName, ['industri', 'manajemen', 'proyek', 'produksi'])) {
                return 18;
            }
        }

        if ($focus === 'startup') {
            if (Str::contains($courseName, ['wirausaha', 'entrepreneur', 'startup', 'inovasi'])) {
                return 18;
            }
        }

        return 10; // bonus kecil walaupun tidak match spesifik
    }

    private function scoreLearningPreference(string $courseName, string $preference): float
    {
        $preference = Str::lower($preference);

        if ($preference === 'konsep') {
            if (Str::contains($courseName, ['teori', 'analisis', 'sistem'])) {
                return 10;
            }
        }

        if ($preference === 'project') {
            if (Str::contains($courseName, ['proyek', 'pengembangan', 'implementasi'])) {
                return 10;
            }
        }

        if ($preference === 'campuran') {
            return 8;
        }

        return 5;
    }

    private function interestKeywords(): array
    {
        return [
            'iot' => ['iot', 'internet of things', 'embedded', 'tertanam', 'sensor', 'telemetri'],
            'robotics' => ['robot', 'aktuator', 'robotika', 'kendali', 'otomasi'],
            'programming' => ['program', 'pemrograman', 'perangkat lunak', 'aplikasi', 'algoritma', 'software'],
            'networking' => ['network', 'jaringan', 'telekomunikasi', 'komunikasi', 'wireless'],
            'power system' => ['energi', 'power', 'tenaga', 'listrik', 'grid'],
            'power systems' => ['energi', 'power', 'tenaga', 'listrik', 'grid'],
            'power-system' => ['energi', 'power', 'tenaga', 'listrik', 'grid'],
        ];
    }

    private function parseAiScore($value): ?float
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed === '') {
                return null;
            }

            $normalized = rtrim($trimmed, '%');

            if (!is_numeric($normalized)) {
                return null;
            }

            $number = (float) $normalized;
        } elseif (is_numeric($value)) {
            $number = (float) $value;
        } else {
            return null;
        }

        if ($number <= 1) {
            $number *= 100;
        } elseif ($number <= 10) {
            $number *= 10;
        }

        return max(0.0, min(100.0, $number));
    }

    private function serializeCourses(Collection $courses, string $type, ?string $defaultNote = null): array
    {
        return $courses->map(function (MataKuliah $course) use ($type, $defaultNote) {
            return [
                'kode_mk' => $course->kode_mk,
                'nama_mk' => $course->nama_mk,
                'sks' => (int) $course->sks,
                'semester' => (int) $course->semester,
                'tipe' => $type,
                'bidang_minat' => $course->bidang_minat,
                'catatan' => $defaultNote,
                'selected' => $type === 'Wajib',
            ];
        })->values()->all();
    }
}
