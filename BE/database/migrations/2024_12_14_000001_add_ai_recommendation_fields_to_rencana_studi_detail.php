<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rencana_studi_detail', function (Blueprint $table) {
            $table->text('alasan')->nullable()->after('mata_kuliah_id');
            $table->integer('tingkat_kecocokan')->nullable()->after('alasan')->comment('Tingkat kecocokan dalam persen (0-100)');
        });
    }

    public function down(): void
    {
        Schema::table('rencana_studi_detail', function (Blueprint $table) {
            $table->dropColumn(['alasan', 'tingkat_kecocokan']);
        });
    }
};
