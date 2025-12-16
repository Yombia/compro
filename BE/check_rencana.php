<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "=== CEK RENCANA STUDI ===\n\n";

    $count = DB::table('rencana_studi')->count();
    echo "Total: $count\n\n";

    if ($count > 0) {
        $data = DB::table('rencana_studi')
            ->join('mahasiswa', 'rencana_studi.mahasiswa_id', '=', 'mahasiswa.id')
            ->select('rencana_studi.*', 'mahasiswa.nama', 'mahasiswa.nim')
            ->orderBy('rencana_studi.id', 'desc')
            ->get();

        foreach($data as $d) {
            echo "ID: {$d->id}\n";
            echo "Mahasiswa: {$d->nama} ({$d->nim})\n";
            echo "Status: {$d->status}\n";
            echo "Tanggal: {$d->created_at}\n";
            echo "Catatan: {$d->catatan}\n";
            echo "---\n";
        }
    }

    echo "\n=== CEK MAHASISWA PREFERENCES ===\n\n";
    $mhs = DB::table('mahasiswa')
        ->select('id', 'nama', 'nim', 'interests', 'future_focus', 'learning_preference')
        ->limit(5)
        ->get();

    foreach($mhs as $m) {
        echo "ID: {$m->id}, {$m->nama}\n";
        echo "  Interests: {$m->interests}\n";
        echo "  Future Focus: {$m->future_focus}\n";
        echo "  Learning Pref: {$m->learning_preference}\n";
        echo "---\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
