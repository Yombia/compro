<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class StatusLogger
{
    private $sessionId;
    private $startTime;
    private $logFile;
    
    public function __construct($sessionId)
    {
        $this->sessionId = $sessionId;
        $this->startTime = microtime(true);
        $this->logFile = 'logs/recommendation_' . date('Y-m-d') . '.txt';
    }
    
    public function log($message, $step = null)
    {
        $elapsed = round((microtime(true) - $this->startTime) * 1000, 2); // durasi dalam ms
        $timestamp = now()->format('Y-m-d H:i:s');
        
        $logs = Cache::get("status_log_{$this->sessionId}", []);
        $logs[] = [
            'time' => now()->format('H:i:s'),
            'elapsed' => $elapsed,
            'message' => $message,
            'step' => $step,
        ];
        Cache::put("status_log_{$this->sessionId}", $logs, 300); // simpan 5 menit

        // Simpan juga ke berkas log
        $logLine = "[{$timestamp}] [{$elapsed}ms] {$message}\n";
        try {
            Storage::append($this->logFile, $logLine);
        } catch (\Exception $e) {
            // Abaikan jika gagal menulis log ke berkas
        }
    }
    
    public function getLogs()
    {
        return Cache::get("status_log_{$this->sessionId}", []);
    }
    
    public function clear()
    {
        Cache::forget("status_log_{$this->sessionId}");
    }
    
    public function resetTimer()
    {
        $this->startTime = microtime(true);
    }
}
