<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Transkrip;
use App\Models\RencanaStudi;
use App\Models\RencanaStudiDetail;
use App\Services\CourseRecommendationService;
use App\Services\OpenRouterService;
use App\Services\StatusLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RekomendasiController extends Controller
{
    /**
     * Ambil profil mahasiswa yang sedang login.
     * GET /api/mahasiswa/profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
            ], 404);
        }

        // Cek rencana studi yang sudah disetujui pada semester saat ini
        $approvedCurrent = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'Disetujui')
            ->with('details.mataKuliah')
            ->get()
            ->first(function ($plan) use ($mahasiswa) {
                $targetSemester = $plan->details->reduce(function ($carry, $detail) {
                    $semester = $detail->mataKuliah?->semester;
                    if ($semester === null) {
                        return $carry;
                    }

                    if ($carry === null) {
                        return (int) $semester;
                    }

                    return max($carry, (int) $semester);
                }, null);

                return $targetSemester === null
                    ? true
                    : ((int) $targetSemester === (int) $mahasiswa->semester_saat_ini);
            });

        $recommendationService = new CourseRecommendationService();
        $coursePool = $recommendationService->prepareCoursePool($mahasiswa);

        // Cari rencana studi disetujui pada semester berjalan
        $approvedPlan = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'Disetujui')
            ->with('details.mataKuliah')
            ->orderByDesc('updated_at')
            ->first();

        $approvedPlanSks = 0;
        $approvedPlanSemester = $mahasiswa->semester_saat_ini;

        if ($approvedPlan) {
            $approvedPlanSks = $approvedPlan->details->reduce(function ($carry, $detail) {
                return $carry + (int) ($detail->mataKuliah?->sks ?? 0);
            }, 0);

            $approvedPlanSemester = $approvedPlan->details->reduce(function ($carry, $detail) {
                $semester = $detail->mataKuliah?->semester;
                if ($semester === null) {
                    return $carry;
                }

                if ($carry === null) {
                    return (int) $semester;
                }

                return max($carry, (int) $semester);
            }, null) ?? $mahasiswa->semester_saat_ini;
        }

        $hasApprovedPlanCurrentSemester = $approvedPlan
            && ((int) $approvedPlanSemester === (int) $mahasiswa->semester_saat_ini);

        $openPlan = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('status', ['Pending', 'Tertunda'])
            ->with('details.mataKuliah')
            ->orderByDesc('updated_at')
            ->orderByDesc('created_at')
            ->first();

        $openPlanSemester = null;

        if ($openPlan) {
            $openPlanSemester = $openPlan->details->reduce(function ($carry, $detail) {
                $semester = $detail->mataKuliah?->semester;
                if ($semester === null) {
                    return $carry;
                }

                if ($carry === null) {
                    return (int) $semester;
                }

                return max($carry, (int) $semester);
            }, null);

            if ($openPlanSemester === null) {
                $openPlanSemester = (int) $mahasiswa->semester_saat_ini;
            }
        }

        $maxSksSemester = $coursePool['max_sks'] ?? null;
        $remainingSksSemester = $maxSksSemester !== null
            ? ($hasApprovedPlanCurrentSemester
                ? max(0, (int) $maxSksSemester - (int) $approvedPlanSks)
                : (int) $maxSksSemester)
            : null;

        $preferenceOptions = [
            'interests' => [
                ['value' => 'IoT', 'label' => 'IoT & Embedded Systems'],
                ['value' => 'Robotics', 'label' => 'Robotika & Otomasi'],
                ['value' => 'Programming', 'label' => 'Software Engineering & Programming'],
                ['value' => 'Networking', 'label' => 'Telekomunikasi & Jaringan'],
                ['value' => 'Power System', 'label' => 'Sistem Tenaga & Energi'],
            ],
            'future_focus' => [
                ['value' => 's2', 'label' => 'S2 / Penelitian Lanjut'],
                ['value' => 'industri', 'label' => 'Karir Profesional di Industri'],
                ['value' => 'startup', 'label' => 'Bangun Startup / Wirausaha Teknologi'],
            ],
            'learning_preferences' => [
                ['value' => 'konsep', 'label' => 'Fokus pada Konsep & Analisis'],
                ['value' => 'project', 'label' => 'Berbasis Proyek & Implementasi'],
                ['value' => 'campuran', 'label' => 'Campuran (Teori & Praktik)'],
            ],
        ];

        // Hitung SKS semester ini dari transkrip
        $sksSemesterIni = Transkrip::where('mahasiswa_id', $mahasiswa->id)
            ->where('semester', $mahasiswa->semester_saat_ini)
            ->sum('sks');

        return response()->json([
            'mahasiswa' => [
                'id' => $mahasiswa->id,
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'ipk' => (float) $mahasiswa->ipk,
                'semester_saat_ini' => $mahasiswa->semester_saat_ini,
                'sks_semester_ini' => $sksSemesterIni,
                'sks_di_rencana_disetujui' => $approvedPlanSks,
                'remaining_sks_semester' => $remainingSksSemester,
                'total_sks' => (int) $mahasiswa->total_sks,
                'interests' => $mahasiswa->interests ?? [],
                'future_focus' => $mahasiswa->future_focus,
                'learning_preference' => $mahasiswa->learning_preference,
                'jurusan' => $mahasiswa->jurusan,
                'max_sks_semester' => $coursePool['max_sks'] ?? null,
                'sks_paket_wajib' => $coursePool['package_sks'] ?? 0,
                'sks_pilihan_maksimal' => $coursePool['max_additional_sks'] ?? 0,
                'can_take_electives' => $coursePool['can_take_electives'] ?? false,
                'has_approved_plan_current_semester' => $hasApprovedPlanCurrentSemester,
                'has_open_plan' => (bool) $openPlan,
                'open_plan_status' => $openPlan?->status,
                'open_plan_id' => $openPlan?->id,
                'open_plan_target_semester' => $openPlanSemester,
            ],
            'preference_options' => $preferenceOptions,
        ], 200);
    }

    /**
     * Buat rekomendasi mata kuliah lewat AI.
     * POST /api/mahasiswa/recommendation/generate
     */
    public function generateRecommendation(Request $request)
    {
        $request->validate([
            'interests' => 'required|array|min:1',
            'interests.*' => 'string',
            'future_focus' => 'nullable|string',
            'learning_preference' => 'nullable|string',
        ]);

        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
            ], 404);
        }
        $mahasiswa->update([
            'interests' => $request->input('interests'),
            'future_focus' => $request->input('future_focus'),
            'learning_preference' => $request->input('learning_preference'),
        ]);

        $mahasiswa->refresh();

        $sessionId = (string) Str::uuid();
        $statusLogger = new StatusLogger($sessionId);
        $statusLogger->log('Menyiapkan rekomendasi mata kuliah personal', 1);

        $service = new CourseRecommendationService();
        $pool = $service->prepareCoursePool($mahasiswa);

        $packageCount = $pool['package_courses']->count();
        $eligibleCount = $pool['eligible_electives']->count();

        if ($packageCount === 0 && $eligibleCount === 0) {
            return response()->json([
                'message' => 'Tidak ada mata kuliah yang dapat direkomendasikan untuk semester ini',
                'summary' => [
                    'recommendations' => [],
                ],
            ], 422);
        }

        $shouldCallAi = ($pool['can_take_electives'] ?? false)
            && ($pool['max_additional_sks'] ?? 0) > 0
            && $eligibleCount > 0;

        $aiFailed = false;
        $aiError = null;
        $summary = null;

        if ($shouldCallAi) {
            $statusLogger->log('Mengumpulkan riwayat nilai dan preferensi mahasiswa', 1);

            $transcript = $this->formatTranscriptData($mahasiswa);
            $interests = $this->formatInterests($mahasiswa->interests ?? []);
            $studentInfo = [
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'semester' => (int) $mahasiswa->semester_saat_ini,
            ];
            $preferences = [
                'future_focus' => $mahasiswa->future_focus,
                'learning_preference' => $mahasiswa->learning_preference,
            ];
            $constraints = [
                'max_sks' => $pool['max_sks'],
                'package_sks' => $pool['package_sks'],
                'max_additional_sks' => $pool['max_additional_sks'],
                'max_electives' => $service->getMaxElectiveCount(),
                'packages' => $pool['serialized_package'] ?? [],
                'notes' => 'Pilih mata kuliah pilihan yang paling relevan tanpa melebihi batas SKS.',
            ];

            try {
                $statusLogger->log('Meminta saran mata kuliah pilihan dari AI', 2);
                $openRouter = new OpenRouterService($statusLogger);
                $aiResult = $openRouter->getRecommendation(
                    $transcript,
                    $pool['serialized_electives'] ?? [],
                    $interests,
                    $studentInfo,
                    $preferences,
                    $constraints
                );

                $summary = $service->finalizeWithAi(
                    $mahasiswa,
                    $pool,
                    $aiResult['daftar_rekomendasi'] ?? []
                );
                $summary['ringkasan_analisis'] = $aiResult['ringkasan_analisis'] ?? null;
                $summary['ai_rekomendasi'] = $aiResult['daftar_rekomendasi'] ?? [];
            } catch (\Throwable $throwable) {
                $aiFailed = true;
                $aiError = $throwable->getMessage();

                Log::warning('OpenRouter gagal untuk mahasiswa', [
                    'student_id' => $mahasiswa->id,
                    'error' => $throwable->getMessage(),
                ]);
            }

            if ($aiFailed || empty($summary['ai_rekomendasi'] ?? [])) {
                $statusLogger->log('AI belum mengembalikan rekomendasi, hentikan proses', 3);
                return response()->json([
                    'message' => 'AI belum mengembalikan rekomendasi, silakan coba lagi nanti',
                    'ai_error' => $aiError,
                ], 502);
            }
        } else {
            $statusLogger->log('Menggunakan paket wajib dan seleksi internal', 1);
            $summary = $service->finalizeWithAi($mahasiswa, $pool, []);
            $summary['ringkasan_analisis'] = null;
            $summary['ai_rekomendasi'] = [];
        }

        if (empty($summary['recommendations'])) {
            return response()->json([
                'message' => 'Tidak ada mata kuliah yang dapat direkomendasikan untuk semester ini',
                'summary' => $summary,
            ], 422);
        }

        $statusLogger->log('Rekomendasi akhir berhasil disusun', 3);

        return response()->json([
            'message' => 'Rekomendasi berhasil dibuat',
            'session_id' => $sessionId,
            'summary' => $summary,
            'ringkasan_analisis' => $summary['ringkasan_analisis'] ?? null,
            'status_logs' => $statusLogger->getLogs(),
            'ai_fallback' => $aiFailed,
            'ai_error' => $aiError,
        ], 200);
    }

    /**
     * Ajukan rencana studi tanpa mata kuliah.
     * POST /api/mahasiswa/recommendation/submit
     */
    public function submitRencanaStudi(Request $request)
    {
        $request->validate([
            'interests' => 'required|array|min:1',
            'future_focus' => 'required|string',
            'learning_preference' => 'required|string',
        ]);

        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
            ], 404);
        }

        $openPlan = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
            ->whereIn('status', ['Pending', 'Tertunda'])
            ->orderByDesc('updated_at')
            ->orderByDesc('created_at')
            ->first();

        if ($openPlan) {
            return response()->json([
                'message' => 'Masih ada pengajuan rencana studi yang belum selesai diproses (' . $openPlan->status . '). Tunggu sampai proses selesai sebelum mengajukan lagi.',
                'existing_plan_id' => $openPlan->id,
                'existing_plan_status' => $openPlan->status,
            ], 409);
        }

        $approvedCurrent = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
            ->where('status', 'Disetujui')
            ->with('details.mataKuliah')
            ->get()
            ->first(function ($plan) use ($mahasiswa) {
                $targetSemester = $plan->details->reduce(function ($carry, $detail) {
                    $semester = $detail->mataKuliah?->semester;
                    if ($semester === null) {
                        return $carry;
                    }

                    if ($carry === null) {
                        return (int) $semester;
                    }

                    return max($carry, (int) $semester);
                }, null);

                return $targetSemester === null
                    ? true
                    : ((int) $targetSemester === (int) $mahasiswa->semester_saat_ini);
            });

        if ($approvedCurrent) {
            return response()->json([
                'message' => 'Rencana studi semester ini sudah disetujui. Tidak dapat mengajukan lagi.',
            ], 409);
        }

        try {
            // Simpan ulang preferensi mahasiswa
            $mahasiswa->update([
                'interests' => $request->input('interests'),
                'future_focus' => $request->input('future_focus'),
                'learning_preference' => $request->input('learning_preference'),
            ]);

            // Buat rencana studi tanpa mata kuliah (dosen yang akan mengisi)
            $rencanaStudi = RencanaStudi::create([
                'mahasiswa_id' => $mahasiswa->id,
                'kelas_id' => $mahasiswa->kelas_id,
                'tanggal_pengajuan' => now(),
                'status' => 'Pending',
                'catatan' => 'Menunggu dosen untuk generate rekomendasi mata kuliah',
            ]);

            return response()->json([
                'message' => 'Rencana studi berhasil diajukan. Menunggu dosen untuk generate rekomendasi.',
                'rencana_studi' => [
                    'id' => $rencanaStudi->id,
                    'status' => $rencanaStudi->status,
                    'tanggal_pengajuan' => $rencanaStudi->tanggal_pengajuan,
                ],
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error submitting rencana studi', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Gagal mengajukan rencana studi',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Ambil status rekomendasi (untuk polling selama proses AI).
     * GET /api/mahasiswa/recommendation/status/{sessionId}
     */
    public function getStatus($sessionId)
    {
        $statusLogger = new StatusLogger($sessionId);
        $logs = $statusLogger->getLogs();

        return response()->json([
            'session_id' => $sessionId,
            'logs' => $logs,
            'completed' => $this->isSessionCompleted($logs),
        ], 200);
    }

    /**
     * Ambil riwayat rencana studi mahasiswa.
     * GET /api/mahasiswa/riwayat
     */
    public function getRiwayat(Request $request)
    {
        $user = $request->user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

        if (!$mahasiswa) {
            return response()->json([
                'message' => 'Data mahasiswa tidak ditemukan',
            ], 404);
        }

        try {
            $riwayat = RencanaStudi::where('mahasiswa_id', $mahasiswa->id)
                ->with(['details.mataKuliah', 'kelas.dosen'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($rs) use ($mahasiswa) {
                    $targetSemester = $rs->details->reduce(function ($carry, $detail) {
                        $semester = $detail->mataKuliah?->semester;
                        if ($semester === null) {
                            return $carry;
                        }

                        if ($carry === null) {
                            return (int) $semester;
                        }

                        return max($carry, (int) $semester);
                    }, null);

                    return [
                        'id' => $rs->id,
                        'status_rencana' => $rs->status,
                        'created_at' => $rs->created_at,
                        'tanggal_pengajuan' => $rs->tanggal_pengajuan,
                        'catatan' => $rs->catatan,
                        'target_semester' => $targetSemester,
                        'dosen' => $rs->kelas && $rs->kelas->dosen ? [
                            'nama' => $rs->kelas->dosen->nama,
                            'nip' => $rs->kelas->dosen->nip,
                        ] : null,
                        'mahasiswa' => [
                            'nama' => $mahasiswa->nama,
                            'nim' => $mahasiswa->nim,
                            'prodi' => $mahasiswa->jurusan,
                            'ipk' => (float) $mahasiswa->ipk,
                            'total_sks' => (int) $mahasiswa->total_sks,
                            'interests' => $mahasiswa->interests,
                            'future_focus' => $mahasiswa->future_focus,
                            'learning_preference' => $mahasiswa->learning_preference,
                        ],
                        'total_sks' => $rs->details->reduce(function ($total, $detail) {
                            return $total + (int) ($detail->mataKuliah?->sks ?? 0);
                        }, 0),
                        'mata_kuliah' => $rs->details->map(function ($detail) {
                            $mk = $detail->mataKuliah;
                            return [
                                'kode_mk' => $mk?->kode_mk,
                                'nama_mata_kuliah' => $mk?->nama_mk,
                                'sks' => (int) ($mk?->sks ?? 0),
                                'semester' => $mk?->semester,
                                'bidang_minat' => $mk?->bidang_minat ?? null,
                                'alasan' => $detail->alasan,
                                'tingkat_kecocokan' => $detail->tingkat_kecocokan,
                            ];
                        }),
                    ];
                });

            return response()->json([
                'message' => 'Riwayat berhasil diambil',
                'data' => $riwayat,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error getting riwayat', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Gagal mengambil riwayat',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function formatTranscriptData(Mahasiswa $mahasiswa): array
    {
        return $mahasiswa->transkrip()
            ->orderBy('semester')
            ->get(['semester', 'kode_mk', 'nama_mk', 'sks', 'nilai'])
            ->map(function ($row) {
                return [
                    'semester' => (int) ($row->semester ?? 0),
                    'kode_mk' => $row->kode_mk,
                    'nama_mk' => $row->nama_mk,
                    'sks' => (int) ($row->sks ?? 0),
                    'nilai' => $row->nilai,
                ];
            })
            ->values()
            ->all();
    }

    private function formatInterests($interests): string
    {
        if (empty($interests)) {
            return 'Tidak ada minat yang tercatat';
        }

        if (is_array($interests)) {
            return implode(', ', $interests);
        }

        return (string) $interests;
    }

    private function isSessionCompleted(array $logs): bool
    {
        if (empty($logs)) {
            return false;
        }

        foreach ($logs as $log) {
            $message = $log['message'] ?? '';
            if (is_string($message) && str_contains($message, 'Rekomendasi akhir berhasil disusun')) {
                return true;
            }
        }

        return false;
    }
}
