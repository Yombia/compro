<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasFactory;

    protected $table = 'kelas';

    protected $fillable = [
        'nama_kelas',
        'kode_kelas',
        'tahun_ajaran',
        'semester',
        'dosen_id',
    ];

    public function dosen()
    {
        return $this->belongsTo(Dosen::class);
    }

    public function mahasiswa()
    {
        return $this->hasMany(Mahasiswa::class);
    }

    public function rencanaStudi()
    {
        return $this->hasMany(RencanaStudi::class);
    }
}
