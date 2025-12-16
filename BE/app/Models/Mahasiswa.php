<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa';

    protected $fillable = [
        'user_id',
        'nim',
        'nama',
        'semester_saat_ini',
        'jurusan',
        'kelas_id',
        'ipk',
        'total_sks',
        'interests',
        'future_focus',
        'learning_preference',
    ];

    protected $casts = [
        'interests' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function transkrip()
    {
        return $this->hasMany(Transkrip::class);
    }

    public function rencanaStudi()
    {
        return $this->hasMany(RencanaStudi::class);
    }
}
