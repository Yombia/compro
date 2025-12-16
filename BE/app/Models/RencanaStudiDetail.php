<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RencanaStudiDetail extends Model
{
    use HasFactory;

    protected $table = 'rencana_studi_detail';

    protected $fillable = [
        'rencana_studi_id',
        'mata_kuliah_id',
        'alasan',
        'tingkat_kecocokan',
    ];

    public function rencanaStudi()
    {
        return $this->belongsTo(RencanaStudi::class);
    }

    public function mataKuliah()
    {
        return $this->belongsTo(MataKuliah::class);
    }
}
