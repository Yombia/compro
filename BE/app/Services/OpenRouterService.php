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

    public function getRecommendation(
        $transcript,
        $availableCourses,
        $interests,
        $studentInfo,
        $preferences = [],
        $constraints = []
    )
    {
        if (function_exists('set_time_limit')) {
            @set_time_limit(180);
        }

        // Langkah 1: validasi dan susun prompt
        $this->statusLogger->log('Memvalidasi data mahasiswa dan mata kuliah tersedia', 1);
        
        // Susun prompt
        $prompt = $this->buildPrompt(
            $transcript,
            $availableCourses,
            $interests,
            $studentInfo,
            $preferences,
            $constraints
        );
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
            ->timeout(75)
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
        $parseError = null;
        $results = $this->parseAiJson($content, $parseError);

        if ($results === null) {
            $errorMessage = $parseError ?? 'Syntax error';
            $this->statusLogger->log('Error: Gagal parse JSON - ' . $errorMessage, 3);
            throw new \Exception("Format response tidak valid (JSON error): {$errorMessage}");
        }

        // Normalisasi kunci hasil AI jika model memakai nama berbeda
        if (!isset($results['daftar_rekomendasi']) && isset($results['rekomendasi'])) {
            $results['daftar_rekomendasi'] = $results['rekomendasi'];
        }

        if (!isset($results['ringkasan_analisis']) && isset($results['ringkasan'])) {
            $results['ringkasan_analisis'] = $results['ringkasan'];
        }

        if (empty($results['daftar_rekomendasi'])) {
            Log::warning('AI response missing daftar_rekomendasi', [
                'preview' => substr($content, 0, 400),
            ]);
            $this->statusLogger->log('AI tidak mengembalikan daftar rekomendasi, menggunakan fallback pilihan internal', 3);
        }

        Log::info('AI content parsed', [
            'analysis_present' => isset($results['ringkasan_analisis']),
            'recommendation_count' => is_array($results['daftar_rekomendasi'] ?? null)
                ? count($results['daftar_rekomendasi'])
                : 0,
            'preview' => substr($content, 0, 300),
        ]);

        $this->statusLogger->log('Rekomendasi berhasil diproses oleh AI', 3);
        sleep(1);

        return $results;
    }

    private function parseAiJson(string $rawContent, ?string &$error = null): ?array
    {
        $error = null;
        $attemptCount = 0;
        $candidates = $this->buildJsonCandidates($rawContent);

        foreach ($candidates as $candidate) {
            if ($candidate === '') {
                continue;
            }

            $normalized = $this->normalizeJson($candidate);

            foreach ($this->buildJsonAttempts($normalized) as $payload) {
                if ($payload === '') {
                    continue;
                }

                $attemptCount++;
                $decoded = json_decode($payload, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return $decoded;
                }

                $error = json_last_error_msg();
            }
        }

        if ($error === null) {
            $error = 'Syntax error';
        }

        Log::warning('OpenRouter JSON parse failed', [
            'error' => $error,
            'candidate_count' => count($candidates),
            'attempt_count' => $attemptCount,
            'preview' => substr($this->normalizeJson($rawContent), 0, 400),
        ]);

        return null;
    }

    private function buildJsonCandidates(string $rawContent): array
    {
        $trimmed = trim($rawContent);

        if ($trimmed === '') {
            return [];
        }

        $candidates = [$trimmed];

        if (str_starts_with($trimmed, '```')) {
            $candidates[] = $this->stripCodeFence($trimmed);
        }

        $braced = $this->extractJsonEnvelope($trimmed);

        if ($braced !== null) {
            $candidates[] = $braced;
        }

        $unique = [];

        foreach ($candidates as $candidate) {
            if ($candidate === null) {
                continue;
            }

            $candidate = trim($candidate);

            if ($candidate === '') {
                continue;
            }

            if (!in_array($candidate, $unique, true)) {
                $unique[] = $candidate;
            }
        }

        return $unique;
    }

    private function stripCodeFence(string $payload): string
    {
        $withoutFence = preg_replace('/^```json\s*/i', '', $payload);
        $withoutFence = preg_replace('/^```\s*/', '', $withoutFence ?? '');
        $withoutFence = preg_replace('/```$/', '', $withoutFence ?? '');

        return trim($withoutFence ?? '');
    }

    private function extractJsonEnvelope(string $payload): ?string
    {
        $firstBrace = strpos($payload, '{');
        $lastBrace = strrpos($payload, '}');

        if ($firstBrace === false || $lastBrace === false || $firstBrace >= $lastBrace) {
            return null;
        }

        return trim(substr($payload, $firstBrace, $lastBrace - $firstBrace + 1));
    }

    private function buildJsonAttempts(string $payload): array
    {
        $attempts = [$payload];

        $withoutTrailing = $this->fixTrailingCommas($payload);
        if ($withoutTrailing !== $payload) {
            $attempts[] = $withoutTrailing;
        }

        $singleQuoted = $this->convertSingleQuotedValues($payload);
        if ($singleQuoted !== $payload) {
            $attempts[] = $singleQuoted;

            $singleQuotedClean = $this->fixTrailingCommas($singleQuoted);
            if ($singleQuotedClean !== $singleQuoted) {
                $attempts[] = $singleQuotedClean;
            }
        }

        return $this->uniqueNonEmpty($attempts);
    }

    private function normalizeJson(string $payload): string
    {
        $payload = trim($payload);

        if ($payload === '') {
            return '';
        }

        $payload = preg_replace('/^\xEF\xBB\xBF/u', '', $payload) ?? $payload;
        $payload = str_replace(["\r\n", "\r"], "\n", $payload);
        $payload = preg_replace('/[\x{FEFF}\x{200B}-\x{200D}\x{2060}\x{2028}\x{2029}]/u', '', $payload) ?? $payload;
        $payload = preg_replace('#/\*.*?\*/#s', '', $payload) ?? $payload;
        $payload = preg_replace('#^\s*//.*$#m', '', $payload) ?? $payload;

        $payload = str_replace([
            "\u{201C}", "\u{201D}", "\u{201E}", "\u{201F}",
        ], "\"", $payload);

        $payload = str_replace([
            "\u{2018}", "\u{2019}", "\u{201A}", "\u{201B}",
        ], "'", $payload);

        $payload = preg_replace('/\bTrue\b/', 'true', $payload) ?? $payload;
        $payload = preg_replace('/\bFalse\b/', 'false', $payload) ?? $payload;
        $payload = preg_replace('/\bNone\b/', 'null', $payload) ?? $payload;
        $payload = preg_replace('/\bNULL\b/', 'null', $payload) ?? $payload;

        return trim($payload);
    }

    private function fixTrailingCommas(string $payload): string
    {
        return preg_replace('/,\s*([}\]])/m', '$1', $payload) ?? $payload;
    }

    private function convertSingleQuotedValues(string $payload): string
    {
        try {
            $converted = preg_replace_callback(
                "/(?<=\{|,)\s*'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/m",
                function ($matches) {
                    $content = str_replace('"', '\\"', $matches[1]);
                    return '"' . $content . '"' . ':';
                },
                $payload
            );

            $converted = preg_replace_callback(
                "/:(\s*)'([^'\\]*(?:\\.[^'\\]*)*)'(\s*)(?=,|\}|\])/m",
                function ($matches) {
                    $content = str_replace('"', '\\"', $matches[2]);
                    return ':' . $matches[1] . '"' . $content . '"' . $matches[3];
                },
                $converted ?? $payload
            );
        } catch (\Throwable $e) {
            Log::warning('convertSingleQuotedValues regex failed', [
                'error' => $e->getMessage(),
                'payload_preview' => substr($payload, 0, 200),
            ]);
            return $payload;
        }

        return $converted ?? $payload;
    }

    private function uniqueNonEmpty(array $payloads): array
    {
        $unique = [];

        foreach ($payloads as $item) {
            $item = trim((string) $item);

            if ($item === '') {
                continue;
            }

            if (!in_array($item, $unique, true)) {
                $unique[] = $item;
            }
        }

        return $unique;
    }

    private function buildPrompt(
        $transcript,
        $availableCourses,
        $interests,
        $studentInfo,
        $preferences = [],
        $constraints = []
    )
    {
        $studentIntro = "INFORMASI MAHASISWA:\n";
        $studentIntro .= "Nama: {$studentInfo['nama']}\n";
        $studentIntro .= "NIM: {$studentInfo['nim']}\n";
        $studentIntro .= "Semester Saat Ini: {$studentInfo['semester']}\n\n";
        
        $transcriptText = "DATA TRANSKRIP MAHASISWA:\n";
        foreach ($transcript as $course) {
            $transcriptText .= "- Semester {$course['semester']}: [{$course['kode_mk']}] {$course['nama_mk']} ({$course['sks']} SKS) - Nilai: {$course['nilai']}\n";
        }

        $packages = $constraints['packages'] ?? [];
        $availableCoursesText = "";

        if (!empty($packages)) {
            $availableCoursesText .= "\nMATA KULIAH PAKET WAJIB (sudah otomatis diambil):\n";
            foreach ($packages as $course) {
                $availableCoursesText .= "- [{$course['kode_mk']}] {$course['nama_mk']} ({$course['sks']} SKS) - {$course['catatan']}\n";
            }
        } else {
            $availableCoursesText .= "\nMATA KULIAH PAKET WAJIB: Tidak ada paket wajib yang tersisa.\n";
        }

        $availableCoursesText .= "\nMATA KULIAH PILIHAN YANG TERSEDIA:\n";
        if (empty($availableCourses)) {
            $availableCoursesText .= "(Tidak ada mata kuliah pilihan yang tersedia)\n";
        } else {
            foreach ($availableCourses as $course) {
                $availableCoursesText .= "- [{$course['kode_mk']}] {$course['nama_mk']} ({$course['sks']} SKS) - Tipe: {$course['tipe']}";
                if (!empty($course['bidang_minat'])) {
                    $availableCoursesText .= " | Bidang: {$course['bidang_minat']}";
                }
                $availableCoursesText .= "\n";
            }
        }

        $constraintLines = [];
        if (!empty($constraints['max_sks'])) {
            $constraintLines[] = "Total SKS maksimal semester ini: {$constraints['max_sks']}";
        }
        if (!empty($constraints['package_sks'])) {
            $constraintLines[] = "Total SKS dari paket wajib: {$constraints['package_sks']}";
        }
        if (isset($constraints['max_additional_sks'])) {
            $constraintLines[] = "Sisa SKS yang boleh dipakai untuk mata kuliah pilihan: {$constraints['max_additional_sks']}";
        }
        if (!empty($constraints['max_electives'])) {
            $constraintLines[] = "Pilih maksimal {$constraints['max_electives']} mata kuliah pilihan";
        }
        // Force AI to stay near target semester
        if (!empty($constraints['target_semester'])) {
            $ts = (int) $constraints['target_semester'];
            $constraintLines[] = "Prioritaskan mata kuliah pilihan di semester {$ts} atau paling jauh satu tingkat di atasnya (maksimal semester " . ($ts + 1) . ")";
            $constraintLines[] = "Jangan merekomendasikan mata kuliah yang berada lebih dari dua tingkat di atas semester target";
        }
        if (!empty($constraints['notes'])) {
            $constraintLines[] = $constraints['notes'];
        }

        $constraintText = "\nBATASAN DAN ATURAN PENGAMBILAN:\n";
        if (!empty($constraintLines)) {
            foreach ($constraintLines as $line) {
                $constraintText .= "- {$line}\n";
            }
        } else {
            $constraintText .= "- Ikuti bijak batasan SKS standar fakultas dan jangan melebihi batas maksimum.\n";
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

{$constraintText}

{$preferencesText}

INSTRUKSI:
1. Analisis nilai transkrip mahasiswa dan identifikasi kekuatan serta kelemahan akademiknya
2. Pertimbangkan preferensi mahasiswa: bidang minat, fokus karir setelah lulus, dan gaya belajar
3. Paket wajib di atas sudah otomatis dipilih, jadi jangan rekomendasikan ulang mata kuliah wajib tersebut
4. Pilih opsi mata kuliah hanya dari daftar "MATA KULIAH PILIHAN YANG TERSEDIA" dan tawarkan sampai 5 opsi terbaik (prioritaskan {$constraints['max_electives']} teratas untuk diambil, sisanya sebagai alternatif cadangan)
5. Jika butuh prioritas, utamakan mata kuliah dengan relevansi paling tinggi terhadap minat dan perkembangan akademik mahasiswa
6. Berikan skor kecocokan dalam rentang 80-100; minimal skor 80 untuk semua rekomendasi dan pastikan setidaknya satu mata kuliah memiliki skor ≥ 90 sebagai rekomendasi paling kuat
7. Jika perlu skor rekomendasi terpisah (1-10), gunakan untuk mengurutkan alternatif; namun skor kecocokan tetap kunci utama
8. Tulis alasan minimal dua kalimat yang menyinggung capaian akademik (misalnya nilai mata kuliah prasyarat atau IPK), kecocokan dengan bidang minat/fokus karier, dan kompetensi yang akan diasah oleh mata kuliah tersebut
9. Urutkan rekomendasi dari skor kecocokan tertinggi ke terendah

PENTING: Response Anda HARUS dalam format JSON yang ketat (strict JSON) tanpa tambahan teks apapun. Gunakan struktur berikut:

{
  "ringkasan_analisis": "Analisis singkat tentang kekuatan dan kelemahan mahasiswa berdasarkan transkrip",
    "daftar_rekomendasi": [
    {
      "kode_mk": "EL3102",
      "nama_mk": "Sistem Mikroprosesor",
      "tipe": "Pilihan Peminatan",
            "skor_kecocokan": 92,
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
