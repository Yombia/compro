<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->foreignId('kelas_id')->nullable()->after('jurusan')->constrained('kelas')->onDelete('set null');
            $table->decimal('ipk', 3, 2)->default(0.00)->after('kelas_id');
            $table->integer('total_sks')->default(0)->after('ipk');
            $table->json('interests')->nullable()->after('total_sks');
            $table->string('future_focus')->nullable()->after('interests');
            $table->string('learning_preference')->nullable()->after('future_focus');
        });
    }

    public function down(): void
    {
        Schema::table('mahasiswa', function (Blueprint $table) {
            $table->dropForeign(['kelas_id']);
            $table->dropColumn(['kelas_id', 'ipk', 'total_sks', 'interests', 'future_focus', 'learning_preference']);
        });
    }
};
