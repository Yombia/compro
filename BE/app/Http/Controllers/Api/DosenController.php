<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dosen;
use App\Models\Mahasiswa;
use App\Models\RencanaStudi;
use App\Models\RencanaStudiDetail;
use App\Models\MataKuliah;
use App\Models\Transkrip;
use App\Models\Kelas;
use App\Services\StatusLogger;
use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
            ->with(['rencanaStudi' => function($query) {
                $query->latest()->first();
            }])
            ->get();

        $result = $mahasiswaList->map(function($mhs) {
            // Ambil rencana studi terbaru
            $rencanaStudi = $mhs->rencanaStudi()->latest()->first();
            
            return [
                'id' => $mhs->id,
                'name' => $mhs->nama,
                'nim' => $mhs->nim,
                'submissionDate' => $rencanaStudi ? $rencanaStudi->tanggal_pengajuan->format('d/m/Y') : null,
                'status' => $rencanaStudi ? $rencanaStudi->status : 'Belum Ada',
                'ipk' => (float) $mhs->ipk,
                'totalSks' => $mhs->total_sks,
                'interests' => $mhs->interests ?? [],
                'futureFocus' => $mhs->future_focus,
                'learningPreference' => $mhs->learning_preference,
                'rencana_studi_id' => $rencanaStudi ? $rencanaStudi->id : null,
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
        
        $mataKuliahList = $rencanaStudi->details->map(function($detail) {
            return [
                'kode_mk' => $detail->mataKuliah->kode_mk,
                'nama' => $detail->mataKuliah->nama_mk,
                'sks' => $detail->mataKuliah->sks,
                'bidang_minat' => $detail->mataKuliah->bidang_minat,
                'alasan' => $detail->alasan,
                'tingkat_kecocokan' => $detail->tingkat_kecocokan,
            ];
        });

        $totalSks = $mataKuliahList->sum('sks');

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
                'mata_kuliah' => $mataKuliahList,
                'catatan' => $rencanaStudi->catatan,
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

        // Periksa apakah sudah ada mata kuliah
        if ($rencanaStudi->details()->count() > 0) {
            return response()->json([
                'message' => 'Rencana studi sudah memiliki rekomendasi mata kuliah',
            ], 400);
        }

        $mahasiswa = $rencanaStudi->mahasiswa;

        // Buat ID sesi unik
        $sessionId = uniqid('rec_', true);
        
        // Siapkan logger status
        $statusLogger = new StatusLogger($sessionId);
        $statusLogger->clear();
        $statusLogger->log('Memulai proses generate rekomendasi', 0);

        try {
            // Langkah 1: kumpulkan data
            $statusLogger->log('Mengumpulkan data transkrip mahasiswa', 1);
            sleep(1); // beri jeda agar frontend bisa polling
            
            // Ambil data transkrip
            $transkripData = Transkrip::where('mahasiswa_id', $mahasiswa->id)
                ->get()
                ->map(function ($t) {
                    return [
                        'semester' => $t->semester,
                        'kode_mk' => $t->kode_mk,
                        'nama_mk' => $t->nama_mk,
                        'sks' => $t->sks,
                        'nilai' => $t->nilai,
                    ];
                })->toArray();

            // Ambil daftar mata kuliah
            $availableCourses = MataKuliah::all()->map(function ($c) {
                return [
                    'kode_mk' => $c->kode_mk,
                    'nama_mk' => $c->nama_mk,
                    'sks' => $c->sks,
                    'semester' => $c->semester,
                    'tipe' => 'Pilihan',
                ];
            })->toArray();

            $interests = implode(', ', $mahasiswa->interests ?? []);
            
            $studentInfo = [
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'semester' => $mahasiswa->semester_saat_ini,
            ];

            $preferences = [
                'future_focus' => $mahasiswa->future_focus,
                'learning_preference' => $mahasiswa->learning_preference,
            ];

            $statusLogger->log('Data mahasiswa berhasil dikumpulkan', 1);
            sleep(1); // beri jeda agar frontend bisa polling

            // Langkah 2-3: proses AI lewat OpenRouterService
            // Jalankan layanan OpenRouter
            $openRouterService = new OpenRouterService($statusLogger);
            $results = $openRouterService->getRecommendation(
                $transkripData,
                $availableCourses,
                $interests,
                $studentInfo,
                $preferences
            );

            // Langkah 4: simpan ke database
            $statusLogger->log('Menyimpan hasil rekomendasi ke database', 4);

            // Simpan rekomendasi mata kuliah ke rencana studi
            if (isset($results['daftar_rekomendasi']) && is_array($results['daftar_rekomendasi'])) {
                foreach ($results['daftar_rekomendasi'] as $mk) {
                    // Catat data untuk debugging
                    Log::info('Saving mata kuliah recommendation', [
                        'kode_mk' => $mk['kode_mk'] ?? 'N/A',
                        'nama_mk' => $mk['nama_mk'] ?? 'N/A',
                        'skor_rekomendasi' => $mk['skor_rekomendasi'] ?? 'N/A',
                        'alasan_rekomendasi' => $mk['alasan_rekomendasi'] ?? 'N/A',
                        'all_keys' => array_keys($mk),
                    ]);
                    
                    // Cari atau buat data mata kuliah
                    $mataKuliah = MataKuliah::where('kode_mk', $mk['kode_mk'])->first();
                    
                    if (!$mataKuliah) {
                        $mataKuliah = MataKuliah::create([
                            'kode_mk' => $mk['kode_mk'],
                            'nama_mk' => $mk['nama_mk'],
                            'sks' => $mk['sks'] ?? 3,
                            'semester' => $mahasiswa->semester_saat_ini + 1,
                            'jurusan' => $mahasiswa->jurusan,
                        ]);
                    }

                    RencanaStudiDetail::create([
                        'rencana_studi_id' => $rencanaStudi->id,
                        'mata_kuliah_id' => $mataKuliah->id,
                        'alasan' => $mk['alasan_rekomendasi'] ?? $mk['alasan'] ?? null,
                        'tingkat_kecocokan' => isset($mk['skor_rekomendasi']) 
                            ? (int) ($mk['skor_rekomendasi'] * 10) 
                            : ($mk['tingkat_kecocokan'] ?? null),
                    ]);
                }

                // Ubah status menjadi Tertunda (menunggu persetujuan)
                $rencanaStudi->status = 'Tertunda';
                $rencanaStudi->catatan = 'Rekomendasi AI telah di-generate, menunggu persetujuan dosen';
                $rencanaStudi->save();
                
                $statusLogger->log('Hasil berhasil disimpan ke database', 4);
                sleep(1); // beri jeda agar frontend bisa polling
            }

            // Langkah 5: selesai
            $statusLogger->log('Proses selesai - Rekomendasi siap direview', 5);

            return response()->json([
                'message' => 'Recommendation generated successfully',
                'session_id' => $sessionId,
                'results' => $results,
                'status_logs' => $statusLogger->getLogs(),
            ], 200);

        } catch (\Exception $e) {
            Log::error('Exception during recommendation generation', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $statusLogger->log('Error: ' . $e->getMessage(), 5);

            return response()->json([
                'message' => 'Failed to generate recommendation',
                'error' => $e->getMessage(),
                'status_logs' => $statusLogger->getLogs(),
            ], 500);
        }
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
            'completed' => count($logs) >= 6,
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
            $mahasiswa = $rencanaStudi->mahasiswa;

            // Buat ID sesi unik
            $sessionId = uniqid('rec_', true);
            
            // Siapkan logger status
            $statusLogger = new StatusLogger($sessionId);
            $statusLogger->clear();
            $statusLogger->log('Memulai proses generate rekomendasi', 0);

            try {
                // Ambil data transkrip
                $transkripData = Transkrip::where('mahasiswa_id', $mahasiswa->id)
                    ->get()
                    ->map(function ($t) {
                        return [
                            'semester' => $t->semester,
                            'kode_mk' => $t->kode_mk,
                            'nama_mk' => $t->nama_mk,
                            'sks' => $t->sks,
                            'nilai' => $t->nilai,
                        ];
                    })->toArray();

                // Ambil daftar mata kuliah
                $availableCourses = MataKuliah::all()->map(function ($c) {
                    return [
                        'kode_mk' => $c->kode_mk,
                        'nama_mk' => $c->nama_mk,
                        'sks' => $c->sks,
                        'semester' => $c->semester,
                        'tipe' => 'Pilihan',
                    ];
                })->toArray();

                $interests = implode(', ', $mahasiswa->interests ?? []);
                
                $studentInfo = [
                    'nama' => $mahasiswa->nama,
                    'nim' => $mahasiswa->nim,
                    'semester' => $mahasiswa->semester_saat_ini,
                ];

                $preferences = [
                    'future_focus' => $mahasiswa->future_focus,
                    'learning_preference' => $mahasiswa->learning_preference,
                ];

                // Jalankan layanan OpenRouter
                $openRouterService = new OpenRouterService($statusLogger);
                $results = $openRouterService->getRecommendation(
                    $transkripData,
                    $availableCourses,
                    $interests,
                    $studentInfo,
                    $preferences
                );

                // Simpan rekomendasi mata kuliah ke rencana studi
                if (isset($results['daftar_rekomendasi']) && is_array($results['daftar_rekomendasi'])) {
                    foreach ($results['daftar_rekomendasi'] as $mk) {
                        // Catat data untuk debugging
                        Log::info('Saving mata kuliah recommendation', [
                            'kode_mk' => $mk['kode_mk'] ?? 'N/A',
                            'nama_mk' => $mk['nama_mk'] ?? 'N/A',
                            'skor_rekomendasi' => $mk['skor_rekomendasi'] ?? 'N/A',
                            'alasan_rekomendasi' => $mk['alasan_rekomendasi'] ?? 'N/A',
                            'all_keys' => array_keys($mk),
                        ]);
                        
                        // Cari atau buat data mata kuliah
                        $mataKuliah = MataKuliah::where('kode_mk', $mk['kode_mk'])->first();
                        
                        if (!$mataKuliah) {
                            $mataKuliah = MataKuliah::create([
                                'kode_mk' => $mk['kode_mk'],
                                'nama_mk' => $mk['nama_mk'],
                                'sks' => $mk['sks'] ?? 3,
                                'semester' => $mahasiswa->semester_saat_ini + 1,
                                'jurusan' => $mahasiswa->jurusan,
                            ]);
                        }

                        RencanaStudiDetail::create([
                            'rencana_studi_id' => $rencanaStudi->id,
                            'mata_kuliah_id' => $mataKuliah->id,
                            'alasan' => $mk['alasan_rekomendasi'] ?? $mk['alasan'] ?? null,
                            'tingkat_kecocokan' => isset($mk['skor_rekomendasi']) 
                                ? (int) ($mk['skor_rekomendasi'] * 10) 
                                : ($mk['tingkat_kecocokan'] ?? null),
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to generate AI recommendations during approval', [
                    'error' => $e->getMessage(),
                    'rencana_studi_id' => $id,
                ]);
                
                return response()->json([
                    'message' => 'Gagal generate rekomendasi AI: ' . $e->getMessage(),
                ], 500);
            }
        }

        $rencanaStudi->status = 'Disetujui';
        $rencanaStudi->catatan = $request->input('catatan', null);
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

            return [
                'id' => $rencana->id,
                'status_rencana' => $rencana->status,
                'created_at' => $rencana->created_at,
                'tanggal_pengajuan' => $rencana->tanggal_pengajuan,
                'catatan' => $rencana->catatan,
                'mahasiswa' => $mahasiswa ? [
                    'nama' => $mahasiswa->nama,
                    'nim' => $mahasiswa->nim,
                    'prodi' => $mahasiswa->jurusan,
                    'ipk' => (float) $mahasiswa->ipk,
                    'total_sks' => $mahasiswa->total_sks,
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
                'mata_kuliah' => $rencana->details->map(function ($detail) {
                    $mataKuliah = $detail->mataKuliah;

                    return [
                        'kode_mk' => $mataKuliah?->kode_mk,
                        'nama_mata_kuliah' => $mataKuliah?->nama_mk,
                        'sks' => $mataKuliah?->sks,
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
                'sks' => $mk->sks,
                'semester' => $mk->semester,
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
}
