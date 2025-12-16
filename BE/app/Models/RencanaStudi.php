<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RencanaStudi extends Model
{
    use HasFactory;

    protected $table = 'rencana_studi';

    protected $fillable = [
        'mahasiswa_id',
        'kelas_id',
        'tanggal_pengajuan',
        'status',
        'catatan',
    ];

    protected $casts = [
        'tanggal_pengajuan' => 'datetime',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function details()
    {
        return $this->hasMany(RencanaStudiDetail::class);
    }

    // Alias untuk details (untuk konsistensi nama)
    public function mataKuliah()
    {
        return $this->hasMany(RencanaStudiDetail::class);
    }
}
