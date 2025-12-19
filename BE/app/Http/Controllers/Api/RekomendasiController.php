<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\MataKuliah;
use App\Models\Transkrip;
use App\Models\RencanaStudi;
use App\Models\RencanaStudiDetail;
use App\Services\StatusLogger;
use App\Services\OpenRouterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
                'total_sks' => (int) $mahasiswa->total_sks,
                'interests' => $mahasiswa->interests ?? [],
                'future_focus' => $mahasiswa->future_focus,
                'learning_preference' => $mahasiswa->learning_preference,
            ],
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

        // Buat ID sesi unik
        $sessionId = uniqid('rec_', true);

        // Siapkan logger status
        $statusLogger = new StatusLogger($sessionId);
        $statusLogger->clear();
        $statusLogger->log('Proses dimulai', 0);

        try {
            // Ambil data transkrip
            $transkripData = Transkrip::where('mahasiswa_id', $mahasiswa->id)
                ->get()
                ->map(function ($t) {
                    return [
                        'semester' => $t->semester,
                        'kode_mk' => $t->kode_mk,
                        'nama_mk' => $t->nama_mk,
                        'sks' => (int) $t->sks,
                        'nilai' => $t->nilai,
                    ];
                })->toArray();

            // Ambil daftar mata kuliah
            $availableCourses = MataKuliah::all()->map(function ($c) {
                return [
                    'kode_mk' => $c->kode_mk,
                    'nama_mk' => $c->nama_mk,
                    'sks' => (int) $c->sks,
                    'semester' => $c->semester,
                    'tipe' => 'Pilihan', // tipe bawaan
                ];
            })->toArray();

            $interests = implode(', ', $request->input('interests'));
            
            $studentInfo = [
                'nama' => $mahasiswa->nama,
                'nim' => $mahasiswa->nim,
                'semester' => $mahasiswa->semester_saat_ini,
            ];

            $statusLogger->log('Membangun prompt untuk AI', 1);

            // Jalankan layanan OpenRouter
            $openRouterService = new OpenRouterService($statusLogger);
            $results = $openRouterService->getRecommendation(
                $transkripData,
                $availableCourses,
                $interests,
                $studentInfo
            );

            $statusLogger->log('Proses selesai - Rekomendasi berhasil dibuat', 5);

            // Simpan ulang minat dan preferensi mahasiswa
            $mahasiswa->update([
                'interests' => $request->input('interests'),
                'future_focus' => $request->input('future_focus'),
                'learning_preference' => $request->input('learning_preference'),
            ]);

            return response()->json([
                'message' => 'Recommendation generated successfully',
                'session_id' => $sessionId,
                'student' => $studentInfo,
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
            'completed' => count($logs) >= 6, // total 6 langkah
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
                    return [
                        'id' => $rs->id,
                        'status_rencana' => $rs->status,
                        'created_at' => $rs->created_at,
                        'tanggal_pengajuan' => $rs->tanggal_pengajuan,
                        'catatan' => $rs->catatan,
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
}
