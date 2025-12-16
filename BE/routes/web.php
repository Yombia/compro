<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Smart Academic Planner API',
        'version' => '1.0.0',
        'documentation' => '/api/health',
    ]);
});
