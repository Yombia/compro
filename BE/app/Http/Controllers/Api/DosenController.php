<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\RencanaStudi;
use App\Models\RencanaStudiDetail;
use App\Models\MataKuliah;
use App\Models\Kelas;
use App\Services\CourseRecommendationService;
use App\Services\OpenRouterService;
use App\Services\StatusLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DosenController extends Controller
{
    /**
     * Ambil profil dosen.
     * GET /api/dosen/profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $dosen = Dosen::with('user')->where('user_id', $user->id)->first();

        if (!$dosen) {
            return response()->json([
                'message' => 'Data dosen tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nip' => $dosen->nip,
                'jurusan' => $dosen->jurusan,
                'fakultas' => $dosen->fakultas,
                'email' => $dosen->user?->email,
            ],
        ], 200);
    }

    /**
     * Ambil data dashboard dosen.
     * GET /api/dosen/dashboard
     */
    public function getDashboard(Request $request)
    {
        $user = $request->user();
        
        // Cari data dosen
        $dosen = Dosen::where('user_id', $user->id)->first();
        
        if (!$dosen) {
            return response()->json([
                'message' => 'Data dosen tidak ditemukan',
            ], 404);
        }

        // Ambil kelas yang diampu dosen
        $kelasList = Kelas::where('dosen_id', $dosen->id)->get();
        
        return response()->json([
            'dosen' => [
                'id' => $dosen->id,
                'nama' => $dosen->nama,
                'nip' => $dosen->nip,
                'jurusan' => $dosen->jurusan,
            ],
            'kelas' => $kelasList->map(function($kelas) {
                return [
                    'id' => $kelas->id,
                    'nama_kelas' => $kelas->nama_kelas,
                    'kode_kelas' => $kelas->kode_kelas,
                    'tahun_ajaran' => $kelas->tahun_ajaran,
                    'semester' => $kelas->semester,
                    'jumlah_mahasiswa' => $kelas->mahasiswa()->count(),
                ];
            }),
        ], 200);
    }

    /**
     * Ambil daftar mahasiswa di kelas dosen.
     * GET /api/dosen/mahasiswa
     */
    public function getMahasiswa(Request $request)
    {
        $user = $request->user();
        
        // Cari data dosen
        $dosen = Dosen::where('user_id', $user->id)->first();
        
        if (!$dosen) {
            return response()->json([
                'message' => 'Data dosen tidak ditemukan',
            ], 404);
        }

        // Ambil semua mahasiswa di kelas yang diampu dosen
        $kelasIds = Kelas::where('dosen_id', $dosen->id)->pluck('id');
        
        $mahasiswaList = Mahasiswa::whereIn('kelas_id', $kelasIds)
            ->with(['rencanaStudi.details.mataKuliah'])
            ->get();

        $result = $mahasiswaList->map(function($mhs) {
            // Ambil rencana studi terbaru berdasarkan tanggal pengajuan
            $latestPlan = $mhs->rencanaStudi
                ->sortByDesc(function ($plan) {
                    return $plan->tanggal_pengajuan ?? $plan->created_at;
                })
                ->first();

            $planSemester = null;

            if ($latestPlan) {
                $planSemester = $latestPlan->details
                    ->map(function ($detail) {
                        return $detail->mataKuliah?->semester;
                    })
                    ->filter()
                    ->max();
            }

            $activePlan = null;

            if ($latestPlan) {
                if ($planSemester !== null) {
                    $activePlan = $planSemester >= (int) $mhs->semester_saat_ini
                        ? $latestPlan
                        : null;
                } else {
                    // Rencana studi belum memiliki detail (umumnya status Pending/Tertunda)
                    $activePlan = $latestPlan;
                }
            }
            
            return [
                'id' => $mhs->id,
                'name' => $mhs->nama,
                'nim' => $mhs->nim,
                'semester_saat_ini' => (int) $mhs->semester_saat_ini,
                'submissionDate' => $activePlan ? $activePlan->tanggal_pengajuan->format('d/m/Y') : null,
                'status' => $activePlan ? $activePlan->status : 'Belum Ada',
                'ipk' => (float) $mhs->ipk,
                'totalSks' => (int) $mhs->total_sks,
                'interests' => $mhs->interests ?? [],
                'futureFocus' => $mhs->future_focus,
                'learningPreference' => $mhs->learning_preference,
                'rencana_studi_id' => $activePlan ? $activePlan->id : null,
                'target_semester' => $activePlan
                    ? ($planSemester !== null ? (int) $planSemester : (int) $mhs->semester_saat_ini)
                    : null,
            ];
        });

        return response()->json([
            'students' => $result,
        ], 200);
    }

    /**
     * Ambil detail rencana studi mahasiswa.
     * GET /api/dosen/rencana-studi/{id}
     */
    public function getDetailRencanaStudi(Request $request, $id)
    {
        $rencanaStudi = RencanaStudi::with(['mahasiswa', 'details.mataKuliah'])->find($id);
        
        if (!$rencanaStudi) {
            return response()->json([
                'message' => 'Rencana studi tidak ditemukan',
            ], 404);
        }

        $mhs = $rencanaStudi->mahasiswa;

        // Hitung batas SKS untuk konteks review agar FE bisa membatasi perubahan
        $courseService = new CourseRecommendationService();
        $pool = $courseService->prepareCoursePool($mhs);
        
        $mataKuliahList = $rencanaStudi->details->map(function($detail) {
            $mataKuliah = $detail->mataKuliah;

            return [
                'kode_mk' => $mataKuliah?->kode_mk,
                'nama' => $mataKuliah?->nama_mk,
                'sks' => (int) ($mataKuliah?->sks ?? 0),
                'bidang_minat' => $mataKuliah?->bidang_minat,
                'semester' => $mataKuliah?->semester,
                'alasan' => $detail->alasan,
                'tingkat_kecocokan' => $detail->tingkat_kecocokan,
            ];
        });

        $totalSks = $mataKuliahList->reduce(function ($total, $mataKuliah) {
            return $total + (int) ($mataKuliah['sks'] ?? 0);
        }, 0);

        $targetSemester = $mataKuliahList
            ->pluck('semester')
            ->filter()
            ->max();

        // Jangan loncat semester: pakai semester mahasiswa sebagai default/override
        $currentSemester = $mhs->semester_saat_ini ? (int) $mhs->semester_saat_ini : null;
        if ($targetSemester === null || ($currentSemester !== null && $targetSemester > $currentSemester)) {
            $targetSemester = $currentSemester;
        }

        return response()->json([
            'rencana_studi' => [
                'id' => $rencanaStudi->id,
                'mahasiswa' => [
                    'nama' => $mhs->nama,
                    'nim' => $mhs->nim,
                    'prodi' => $mhs->jurusan,
                    'ipk' => (float) $mhs->ipk,
                ],
                'tanggal_pengajuan' => $rencanaStudi->tanggal_pengajuan->format('d/m/Y'),
                'status' => $rencanaStudi->status,
                'jumlah_mk' => $rencanaStudi->details->count(),
                'total_sks' => $totalSks,
                'max_sks' => $pool['max_sks'] ?? null,
                'package_sks' => $pool['package_sks'] ?? null,
                'max_additional_sks' => $pool['max_additional_sks'] ?? null,
                'can_take_electives' => $pool['can_take_electives'] ?? null,
                'mata_kuliah' => $mataKuliahList,
                'catatan' => $rencanaStudi->catatan,
                'target_semester' => $targetSemester,
            ],
        ], 200);
    }

    /**
     * Bangun rekomendasi AI untuk rencana studi.
     * POST /api/dosen/rencana-studi/{id}/generate
     */
    public function generateRekomendasi(Request $request, $id)
    {
        $rencanaStudi = RencanaStudi::with('mahasiswa')->find($id);

        if (!$rencanaStudi) {
            return response()->json([
                'message' => 'Rencana studi tidak ditemukan',
            ], 404);
        }

        if ($rencanaStudi->details()->count() > 0) {
            return response()->json([
                'message' => 'Rencana studi sudah memiliki rekomendasi mata kuliah',
            ], 400);
        }

        $sessionId = (string) Str::uuid();
        $statusLogger = new StatusLogger($sessionId);

        try {
            $result = $this->runRecommendationPipeline($rencanaStudi, $statusLogger, true);
        } catch (\RuntimeException $runtimeException) {
            return response()->json([
                'message' => $runtimeException->getMessage(),
            ], 422);
        } catch (\Throwable $throwable) {
            Log::error('Gagal menghasilkan rekomendasi AI', [
                'plan_id' => $rencanaStudi->id,
                'error' => $throwable->getMessage(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat membangun rekomendasi',
            ], 500);
        }

        Log::info('AI recommendation summary', [
            'plan_id' => $rencanaStudi->id,
            'ai_failed' => $result['ai_failed'] ?? null,
            'ai_error' => $result['ai_error'] ?? null,
            'ai_rekomendasi_count' => isset($result['summary']['ai_rekomendasi'])
                ? count($result['summary']['ai_rekomendasi'])
                : 0,
            'total_recommendations' => isset($result['summary']['recommendations'])
                ? count($result['summary']['recommendations'])
                : 0,
        ]);

        $statusLogger->log('Finalisasi rekomendasi dan menyiapkan penyimpanan', 4);

        $this->persistRecommendationDetails($rencanaStudi, $result['summary']);

        $statusLogger->log('Rekomendasi tersimpan dan siap direview dosen', 5);

        $mahasiswa = $rencanaStudi->mahasiswa;
        $rencanaStudi->status = 'Tertunda';
        $rencanaStudi->catatan = $this->buildRecommendationNote($result['summary'], $mahasiswa->semester_saat_ini);
        $rencanaStudi->save();

        return response()->json([
            'message' => 'Rekomendasi berhasil disusun',
            'session_id' => $sessionId,
            'summary' => $result['summary'],
            'ringkasan_analisis' => $result['summary']['ringkasan_analisis'] ?? null,
            'status_logs' => $statusLogger->getLogs(),
            'ai_fallback' => $result['ai_failed'] ?? false,
            'ai_error' => $result['ai_error'] ?? null,
        ], 200);
    }

    /**
     * Ambil status rekomendasi (untuk polling selama proses AI).
     * GET /api/dosen/recommendation/status/{sessionId}
     */
    public function getRecommendationStatus($sessionId)
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
     * Menyetujui rencana studi.
     * POST /api/dosen/rencana-studi/{id}/setujui
     */
    public function setujuiRencanaStudi(Request $request, $id)
    {
        $rencanaStudi = RencanaStudi::find($id);
        
        if (!$rencanaStudi) {
            return response()->json([
                'message' => 'Rencana studi tidak ditemukan',
            ], 404);
        }

        // Periksa apakah rekomendasi mata kuliah sudah ada
        // Jika belum ada, bangun rekomendasi AI terlebih dahulu
        if ($rencanaStudi->details()->count() === 0) {
            $sessionId = (string) Str::uuid();
            $statusLogger = new StatusLogger($sessionId);

            try {
                $result = $this->runRecommendationPipeline($rencanaStudi, $statusLogger, true);
            } catch (\RuntimeException $runtimeException) {
                return response()->json([
                    'message' => $runtimeException->getMessage(),
                ], 422);
            } catch (\Throwable $throwable) {
                Log::error('Gagal membangun rekomendasi saat persetujuan', [
                    'plan_id' => $rencanaStudi->id,
                    'error' => $throwable->getMessage(),
                ]);

                return response()->json([
                    'message' => 'Terjadi kesalahan saat menyiapkan rekomendasi',
                ], 500);
            }

            Log::info('AI recommendation summary (approval path)', [
                'plan_id' => $rencanaStudi->id,
                'ai_failed' => $result['ai_failed'] ?? null,
                'ai_error' => $result['ai_error'] ?? null,
                'ai_rekomendasi_count' => isset($result['summary']['ai_rekomendasi'])
                    ? count($result['summary']['ai_rekomendasi'])
                    : 0,
                'total_recommendations' => isset($result['summary']['recommendations'])
                    ? count($result['summary']['recommendations'])
                    : 0,
            ]);

            $statusLogger->log('Finalisasi rekomendasi dan menyiapkan penyimpanan', 4);
            $this->persistRecommendationDetails($rencanaStudi, $result['summary']);
            $statusLogger->log('Rekomendasi tersimpan dan siap direview dosen', 5);

            if (!$request->filled('catatan')) {
                $rencanaStudi->catatan = $this->buildRecommendationNote(
                    $result['summary'],
                    $rencanaStudi->mahasiswa->semester_saat_ini
                );
            }
        }

        $rencanaStudi->status = 'Disetujui';
        if ($request->filled('catatan')) {
            $rencanaStudi->catatan = $request->input('catatan');
        }
        $rencanaStudi->save();

        return response()->json([
            'message' => 'Rencana studi berhasil disetujui',
            'rencana_studi' => [
                'id' => $rencanaStudi->id,
                'status' => $rencanaStudi->status,
            ],
        ], 200);
    }

    /**
     * Menolak rencana studi.
     * POST /api/dosen/rencana-studi/{id}/tolak
     */
    public function tolakRencanaStudi(Request $request, $id)
    {
        $rencanaStudi = RencanaStudi::find($id);
        
        if (!$rencanaStudi) {
            return response()->json([
                'message' => 'Rencana studi tidak ditemukan',
            ], 404);
        }

        $rencanaStudi->status = 'Ditolak';
        $rencanaStudi->catatan = $request->input('catatan', null);
        $rencanaStudi->save();

        return response()->json([
            'message' => 'Rencana studi berhasil ditolak',
            'rencana_studi' => [
                'id' => $rencanaStudi->id,
                'status' => $rencanaStudi->status,
            ],
        ], 200);
    }

    /**
     * Ambil riwayat rencana studi yang sudah disetujui.
     * GET /api/dosen/riwayat
     */
    public function getRiwayat(Request $request)
    {
        $user = $request->user();
        
        // Cari data dosen
        $dosen = Dosen::where('user_id', $user->id)->first();
        
        if (!$dosen) {
            return response()->json([
                'message' => 'Data dosen tidak ditemukan',
            ], 404);
        }

        // Ambil seluruh rencana studi dari kelas yang diampu dosen
        $kelasIds = Kelas::where('dosen_id', $dosen->id)->pluck('id');

        $riwayatList = RencanaStudi::whereIn('kelas_id', $kelasIds)
            ->with(['mahasiswa', 'details.mataKuliah', 'kelas'])
            ->orderBy('created_at', 'desc')
            ->get();

        $result = $riwayatList->map(function ($rencana) {
            $mahasiswa = $rencana->mahasiswa;

            $targetSemester = $rencana->details->reduce(function ($carry, $detail) {
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
                'id' => $rencana->id,
                'status_rencana' => $rencana->status,
                'created_at' => $rencana->created_at,
                'tanggal_pengajuan' => $rencana->tanggal_pengajuan,
                'catatan' => $rencana->catatan,
                'target_semester' => $targetSemester,
                'mahasiswa' => $mahasiswa ? [
                    'nama' => $mahasiswa->nama,
                    'nim' => $mahasiswa->nim,
                    'prodi' => $mahasiswa->jurusan,
                    'ipk' => (float) $mahasiswa->ipk,
                    'total_sks' => (int) $mahasiswa->total_sks,
                    'interests' => $mahasiswa->interests,
                    'future_focus' => $mahasiswa->future_focus,
                    'learning_preference' => $mahasiswa->learning_preference,
                ] : null,
                'kelas' => $rencana->kelas ? [
                    'id' => $rencana->kelas->id,
                    'nama_kelas' => $rencana->kelas->nama_kelas,
                    'kode_kelas' => $rencana->kelas->kode_kelas,
                    'semester' => $rencana->kelas->semester,
                    'tahun_ajaran' => $rencana->kelas->tahun_ajaran,
                ] : null,
                'total_sks' => $rencana->details->reduce(function ($total, $detail) {
                    return $total + (int) ($detail->mataKuliah?->sks ?? 0);
                }, 0),
                'mata_kuliah' => $rencana->details->map(function ($detail) {
                    $mataKuliah = $detail->mataKuliah;

                    return [
                        'kode_mk' => $mataKuliah?->kode_mk,
                        'nama_mata_kuliah' => $mataKuliah?->nama_mk,
                        'sks' => (int) ($mataKuliah?->sks ?? 0),
                        'semester' => $mataKuliah?->semester,
                        'bidang_minat' => $mataKuliah?->bidang_minat,
                        'alasan' => $detail->alasan,
                        'tingkat_kecocokan' => $detail->tingkat_kecocokan,
                    ];
                })->values(),
            ];
        })->values();

        return response()->json([
            'riwayat' => $result,
        ], 200);
    }

    /**
     * Ambil semua mata kuliah.
     * GET /api/dosen/mata-kuliah
     */
    public function getAllMataKuliah(Request $request)
    {
        $mataKuliahList = MataKuliah::all()->map(function($mk) {
            return [
                'id' => $mk->id,
                'kode_mk' => $mk->kode_mk,
                'nama_mk' => $mk->nama_mk,
                'sks' => (int) $mk->sks,
                'semester' => $mk->semester,
                'bidang_minat' => $mk->bidang_minat,
            ];
        });

        return response()->json([
            'mata_kuliah' => $mataKuliahList,
        ], 200);
    }

    /**
     * Perbarui mata kuliah hasil rekomendasi AI.
     * PUT /api/dosen/rencana-studi/{id}/update-mata-kuliah
     */
    public function updateMataKuliah(Request $request, $id)
    {
        $validated = $request->validate([
            'mata_kuliah' => 'required|array',
            'mata_kuliah.*.kode_mk' => 'required|string',
            'mata_kuliah.*.alasan' => 'nullable|string',
            'mata_kuliah.*.tingkat_kecocokan' => 'nullable|integer|min:0|max:100',
            'catatan' => 'nullable|string',
        ]);

        $rencanaStudi = RencanaStudi::find($id);
        
        if (!$rencanaStudi) {
            return response()->json([
                'message' => 'Rencana studi tidak ditemukan',
            ], 404);
        }

        // Hapus mata kuliah lama
        RencanaStudiDetail::where('rencana_studi_id', $id)->delete();

        // Tambahkan mata kuliah baru
        foreach ($validated['mata_kuliah'] as $mk) {
            $mataKuliah = MataKuliah::where('kode_mk', $mk['kode_mk'])->first();
            
            if ($mataKuliah) {
                RencanaStudiDetail::create([
                    'rencana_studi_id' => $id,
                    'mata_kuliah_id' => $mataKuliah->id,
                    'alasan' => $mk['alasan'] ?? null,
                    'tingkat_kecocokan' => isset($mk['tingkat_kecocokan'])
                        ? (int) $mk['tingkat_kecocokan']
                        : null,
                ]);
            }
        }

        // Perbarui catatan jika ada
        if (isset($validated['catatan'])) {
            $rencanaStudi->catatan = $validated['catatan'];
            $rencanaStudi->save();
        }

        return response()->json([
            'message' => 'Mata kuliah berhasil diupdate',
        ], 200);
    }

    private function runRecommendationPipeline(RencanaStudi $rencanaStudi, StatusLogger $statusLogger, bool $allowAi): array
    {
        $mahasiswa = $rencanaStudi->mahasiswa;

        if (!$mahasiswa) {
            throw new \RuntimeException('Data mahasiswa tidak ditemukan untuk rencana studi ini');
        }

        $statusLogger->log('Mengumpulkan paket dan mata kuliah eligible', 1);
        $service = new CourseRecommendationService();
        $pool = $service->prepareCoursePool($mahasiswa);

        $packageCount = $pool['package_courses']->count();
        $eligibleCount = $pool['eligible_electives']->count();

        if ($packageCount === 0 && $eligibleCount === 0) {
            throw new \RuntimeException('Tidak ada mata kuliah yang dapat direkomendasikan untuk semester ini');
        }

        $shouldCallAi = $allowAi
            && ($pool['can_take_electives'] ?? false)
            && ($pool['max_additional_sks'] ?? 0) > 0
            && $eligibleCount > 0;

        $aiFailed = false;
        $aiError = null;
        $summary = null;

        if ($shouldCallAi) {
            $statusLogger->log('Menyiapkan konteks transkrip dan preferensi mahasiswa', 1);

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
                'target_semester' => $pool['target_semester'] ?? $mahasiswa->semester_saat_ini,
                'notes' => 'Prioritaskan mata kuliah pilihan di semester target atau paling tinggi satu tingkat di atasnya, dan jangan melebihi batas SKS.',
            ];

            $statusLogger->log('Meminta rekomendasi mata kuliah pilihan dari AI', 2);
            $openRouter = new OpenRouterService($statusLogger);
            $maxAiAttempts = 3;

            for ($attempt = 1; $attempt <= $maxAiAttempts; $attempt++) {
                try {
                    $statusLogger->log("Menghubungi AI (percobaan {$attempt} dari {$maxAiAttempts})", 2);

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
                    $aiFailed = false;
                    break;
                } catch (\Throwable $throwable) {
                    $aiFailed = true;
                    $aiError = $throwable->getMessage();

                    Log::warning('OpenRouter attempt failed', [
                        'plan_id' => $rencanaStudi->id,
                        'attempt' => $attempt,
                        'max_attempts' => $maxAiAttempts,
                        'error' => $throwable->getMessage(),
                    ]);

                    if ($attempt < $maxAiAttempts) {
                        $statusLogger->log(
                            "Percobaan AI ke-{$attempt} gagal (" . ($throwable->getMessage() ?? 'unknown') . "), mencoba ulang...",
                            2
                        );
                        usleep(500000); // jeda singkat 0.5 detik sebelum mencoba ulang
                        continue;
                    }
                }
            }

            if ($aiFailed || empty($summary['ai_rekomendasi'] ?? [])) {
                $statusLogger->log('AI belum mengembalikan rekomendasi, hentikan proses', 3);
                throw new \RuntimeException('AI belum mengembalikan rekomendasi, silakan coba lagi nanti');
            }
        } else {
            $statusLogger->log('Menggunakan paket wajib dan seleksi internal', 1);
            $summary = $service->finalizeWithAi($mahasiswa, $pool, []);
            $summary['ringkasan_analisis'] = null;
            $summary['ai_rekomendasi'] = [];
        }

        if (empty($summary['recommendations'])) {
            throw new \RuntimeException('Tidak ada mata kuliah yang dapat direkomendasikan untuk semester ini');
        }

        $statusLogger->log('Rekomendasi akhir berhasil disusun', 3);

        return [
            'summary' => $summary,
            'ai_failed' => $aiFailed,
            'ai_error' => $aiError,
        ];
    }

    private function persistRecommendationDetails(RencanaStudi $rencanaStudi, array $summary): void
    {
        RencanaStudiDetail::where('rencana_studi_id', $rencanaStudi->id)->delete();

        foreach ($summary['recommendations'] as $item) {
            $courseType = $item['type'] ?? 'wajib';

            if ($courseType !== 'wajib') {
                continue;
            }

            $mataKuliahId = $item['mata_kuliah_id'] ?? null;

            if (!$mataKuliahId) {
                Log::warning('Recommendation missing mata_kuliah_id saat menyimpan detail', $item);
                continue;
            }

            RencanaStudiDetail::create([
                'rencana_studi_id' => $rencanaStudi->id,
                'mata_kuliah_id' => $mataKuliahId,
                'alasan' => $item['alasan'] ?? null,
                'tingkat_kecocokan' => $item['score'] ?? null,
            ]);
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

    private function buildRecommendationNote(array $recommendation, int $semesterSaatIni): string
    {
        $targetSemester = $recommendation['target_semester'] ?? $semesterSaatIni;
        $packageSks = $recommendation['package_sks'] ?? 0;
        $totalSks = $recommendation['total_sks'] ?? $packageSks;
        $recommendations = collect($recommendation['recommendations'] ?? []);
        $electiveCount = $recommendations->where('type', 'pilihan')->count();
        $mandatorySks = $recommendations
            ->where('type', 'wajib')
            ->reduce(function ($carry, $entry) {
                return $carry + (int) ($entry['sks'] ?? 0);
            }, 0);

        $note = "Paket wajib semester {$targetSemester} berjumlah {$mandatorySks} SKS.";

        if ($electiveCount > 0) {
            $note .= " AI menyarankan {$electiveCount} mata kuliah pilihan untuk dipertimbangkan.";
        }

        if (!empty($recommendation['max_additional_sks'])) {
            $note .= ' Sisa kuota mata kuliah pilihan: ' . (int) $recommendation['max_additional_sks'] . ' SKS.';
        }

        if (!empty($recommendation['ringkasan_analisis'])) {
            $note .= ' Ringkasan analisis AI: ' . $recommendation['ringkasan_analisis'];
        }

        return $note;
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
