<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;

class OpenRouterService
{
    private $statusLogger;
    private $apiKey;
    private $apiUrl;
    private $model;

    public function __construct(StatusLogger $statusLogger)
    {
        $this->statusLogger = $statusLogger;
        $this->apiKey = env('OPENROUTER_API_KEY');
        $this->apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        $this->model = env('OPENROUTER_MODEL', 'anthropic/claude-3-haiku-20240307');

        if (empty($this->apiKey)) {
            throw new \Exception("OpenRouter API Key tidak ditemukan di .env");
        }
    }

    public function getRecommendation($transcript, $availableCourses, $interests, $studentInfo, $preferences = [])
    {
        // Langkah 1: validasi dan susun prompt
        $this->statusLogger->log('Memvalidasi data mahasiswa dan mata kuliah tersedia', 1);
        
        // Susun prompt
        $prompt = $this->buildPrompt($transcript, $availableCourses, $interests, $studentInfo, $preferences);
        $this->statusLogger->log('Prompt AI berhasil dibangun (' . strlen($prompt) . ' karakter)', 1);

        // Langkah 2: kirim request ke AI
        $this->statusLogger->log('Mengirim request ke OpenRouter API (model: ' . $this->model . ')', 2);
        
        Log::info('Mengirim request ke OpenRouter API', [
            'model' => $this->model,
        ]);

        try {
            $response = Http::retry(2, 1500, function ($exception, $request) {
                Log::warning('OpenRouter request retry triggered', [
                    'error' => $exception->getMessage(),
                ]);
                $this->statusLogger->log('Mengulang koneksi ke OpenRouter...', 2);
                return true;
            })
            ->timeout(20)
            ->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ]
                ],
            ]);
        } catch (ConnectionException $e) {
            $this->statusLogger->log('Koneksi ke OpenRouter gagal: ' . $e->getMessage(), 2);
            throw new \Exception('Tidak dapat terhubung ke layanan OpenRouter: ' . $e->getMessage(), 0, $e);
        }

        $this->statusLogger->log('Response diterima dari OpenRouter AI', 2);
        sleep(1); // beri jeda agar frontend bisa polling

        Log::info('Menerima response dari OpenRouter', [
            'status_code' => $response->status(),
            'response_size' => strlen($response->body()),
        ]);

        // Periksa galat dari API
        if ($response->failed()) {
            $errorBody = $response->body();
            $statusCode = $response->status();
            
            $this->statusLogger->log('Error: Response gagal dari OpenRouter (HTTP ' . $statusCode . ')', 2);
            
            Log::error('Gagal koneksi OpenRouter', [
                'status' => $statusCode,
                'body' => $errorBody,
            ]);
            
            throw new \Exception("Gagal terhubung ke OpenRouter API (HTTP {$statusCode}): {$errorBody}");
        }

        // Langkah 3: olah respons AI
        $this->statusLogger->log('Memproses hasil rekomendasi dari AI', 3);
        sleep(1); // beri jeda agar frontend bisa polling
        
        $responseData = $response->json();
        $content = $responseData['choices'][0]['message']['content'] ?? null;

        if (empty($content)) {
            $this->statusLogger->log('Error: Content kosong dari OpenRouter', 3);
            throw new \Exception('Response dari OpenRouter kosong atau tidak valid');
        }

        $this->statusLogger->log('Hasil AI berhasil diekstrak, mulai uraikan JSON...', 3);
        
        // Uraikan JSON ke array
        $results = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $jsonError = json_last_error_msg();
            $this->statusLogger->log('Error: Gagal parse JSON - ' . $jsonError, 3);
            throw new \Exception("Format response tidak valid (JSON error): {$jsonError}");
        }

        $this->statusLogger->log('Rekomendasi berhasil diproses oleh AI', 3);
        sleep(1);

        return $results;
    }

    private function buildPrompt($transcript, $availableCourses, $interests, $studentInfo, $preferences = [])
    {
        $studentIntro = "INFORMASI MAHASISWA:\n";
        $studentIntro .= "Nama: {$studentInfo['nama']}\n";
        $studentIntro .= "NIM: {$studentInfo['nim']}\n";
        $studentIntro .= "Semester Saat Ini: {$studentInfo['semester']}\n\n";
        
        $transcriptText = "DATA TRANSKRIP MAHASISWA:\n";
        foreach ($transcript as $course) {
            $transcriptText .= "- Semester {$course['semester']}: [{$course['kode_mk']}] {$course['nama_mk']} ({$course['sks']} SKS) - Nilai: {$course['nilai']}\n";
        }

        $availableCoursesText = "\nMATA KULIAH YANG TERSEDIA SEMESTER DEPAN:\n";
        foreach ($availableCourses as $course) {
            $availableCoursesText .= "- [{$course['kode_mk']}] {$course['nama_mk']} ({$course['sks']} SKS) - Tipe: {$course['tipe']}\n";
        }

        // Susun teks preferensi
        $preferencesText = "\nPREFERENSI MAHASISWA:\n";
        $preferencesText .= "Bidang Minat: {$interests}\n";
        
        if (!empty($preferences['future_focus'])) {
            $fokusMap = [
                's2' => 'Melanjutkan S2 / Riset',
                'industri' => 'Bekerja di Industri',
                'startup' => 'Membangun Start Up Teknologi',
            ];
            $fokusLabel = $fokusMap[$preferences['future_focus']] ?? $preferences['future_focus'];
            $preferencesText .= "Fokus Setelah Lulus: {$fokusLabel}\n";
        }
        
        if (!empty($preferences['learning_preference'])) {
            $learningMap = [
                'konsep' => 'Konsep & Analisis (lebih suka mata kuliah teoritis)',
                'project' => 'Proyek & Implementasi (lebih suka mata kuliah praktis)',
                'campuran' => 'Campuran (balance antara teori dan praktek)',
            ];
            $learningLabel = $learningMap[$preferences['learning_preference']] ?? $preferences['learning_preference'];
            $preferencesText .= "Gaya Belajar: {$learningLabel}\n";
        }

        $prompt = <<<PROMPT
Anda adalah sistem rekomendasi mata kuliah untuk mahasiswa Teknik Elektro.

{$studentIntro}

{$transcriptText}

{$availableCoursesText}

{$preferencesText}

INSTRUKSI:
1. Analisis nilai transkrip mahasiswa dan identifikasi kekuatan serta kelemahan akademiknya
2. Pertimbangkan preferensi mahasiswa: bidang minat, fokus karir setelah lulus, dan gaya belajar
3. Berikan rekomendasi mata kuliah dari daftar yang tersedia yang sesuai dengan peminatan, preferensi, dan performa akademik mahasiswa
4. Berikan skor rekomendasi (1-10) untuk setiap mata kuliah, dimana 10 adalah sangat direkomendasikan
5. Berikan alasan spesifik yang mengaitkan nilai transkrip dengan peminatan dan preferensi mahasiswa
6. Urutkan rekomendasi dari skor tertinggi ke terendah

PENTING: Response Anda HARUS dalam format JSON yang ketat (strict JSON) tanpa tambahan teks apapun. Gunakan struktur berikut:

{
  "ringkasan_analisis": "Analisis singkat tentang kekuatan dan kelemahan mahasiswa berdasarkan transkrip",
  "daftar_rekomendasi": [
    {
      "kode_mk": "EL3102",
      "nama_mk": "Sistem Mikroprosesor",
      "tipe": "Pilihan Peminatan",
      "skor_rekomendasi": 9.5,
      "alasan_rekomendasi": "Sangat direkomendasikan karena mendapat nilai 'A' di 'Dasar Sistem Digital' dan sesuai dengan peminatan..."
    }
  ]
}

Berikan HANYA JSON tanpa backtick, tanpa penjelasan tambahan, dan tanpa formatting markdown.
PROMPT;

        return $prompt;
    }
}
