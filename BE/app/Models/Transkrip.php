<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transkrip extends Model
{
    use HasFactory;

    protected $table = 'transkrip';

    protected $fillable = [
        'mahasiswa_id',
        'semester',
        'kode_mk',
        'nama_mk',
        'sks',
        'nilai',
    ];

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class);
    }
}
