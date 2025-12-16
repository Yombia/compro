<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "=== CEK DATABASE RENCANA STUDI ===\n\n";

    // Count total
    $count = DB::table('rencana_studi')->count();
    echo "Total RencanaStudi: $count\n\n";

    // Get latest
    $latest = DB::table('rencana_studi')
        ->join('mahasiswa', 'rencana_studi.mahasiswa_id', '=', 'mahasiswa.id')
        ->select('rencana_studi.*', 'mahasiswa.nama', 'mahasiswa.nim')
        ->orderBy('rencana_studi.created_at', 'desc')
        ->limit(5)
        ->get();

    echo "Latest RencanaStudi:\n";
    foreach($latest as $rs) {
        echo "- ID: {$rs->id}, Mahasiswa: {$rs->nama} ({$rs->nim}), Status: {$rs->status}, Tanggal: {$rs->created_at}\n";
    }

    echo "\n=== CEK MAHASISWA ===\n\n";
    $mahasiswa = DB::table('mahasiswa')->select('id', 'nama', 'nim', 'interests')->limit(3)->get();
    foreach($mahasiswa as $m) {
        echo "- ID: {$m->id}, Nama: {$m->nama}, NIM: {$m->nim}, Interests: {$m->interests}\n";
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
