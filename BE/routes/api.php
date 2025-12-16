<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DosenController;
use App\Http\Controllers\Api\RekomendasiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes untuk frontend React
| CORS dikonfigurasi untuk menerima request dari http://localhost:5173
|
*/

// Public routes (tidak perlu autentikasi)
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (perlu autentikasi token)
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth endpoints
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dosen endpoints
    Route::prefix('dosen')->group(function () {
        Route::get('/profile', [DosenController::class, 'getProfile']);
        Route::get('/dashboard', [DosenController::class, 'getDashboard']);
        Route::get('/mahasiswa', [DosenController::class, 'getMahasiswa']);
        Route::get('/mata-kuliah', [DosenController::class, 'getAllMataKuliah']);
        Route::get('/rencana-studi/{id}', [DosenController::class, 'getDetailRencanaStudi']);
        Route::post('/rencana-studi/{id}/generate', [DosenController::class, 'generateRekomendasi']);
        Route::get('/recommendation/status/{sessionId}', [DosenController::class, 'getRecommendationStatus']);
        Route::put('/rencana-studi/{id}/update-mata-kuliah', [DosenController::class, 'updateMataKuliah']);
        Route::post('/rencana-studi/{id}/setujui', [DosenController::class, 'setujuiRencanaStudi']);
        Route::post('/rencana-studi/{id}/tolak', [DosenController::class, 'tolakRencanaStudi']);
        Route::get('/riwayat', [DosenController::class, 'getRiwayat']);
    });
    
    // Mahasiswa endpoints
    Route::prefix('mahasiswa')->group(function () {
        Route::get('/profile', [RekomendasiController::class, 'getProfile']);
        Route::post('/recommendation/generate', [RekomendasiController::class, 'generateRecommendation']);
        Route::post('/recommendation/submit', [RekomendasiController::class, 'submitRencanaStudi']);
        Route::get('/recommendation/status/{sessionId}', [RekomendasiController::class, 'getStatus']);
        Route::get('/riwayat', [RekomendasiController::class, 'getRiwayat']);
    });
});

// Health check endpoint (public)
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Compro Recommendation System API is running',
        'timestamp' => now()->toISOString(),
    ]);
});

