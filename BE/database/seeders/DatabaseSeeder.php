<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use App\Models\Kelas;
use App\Models\MataKuliah;
use App\Models\RencanaStudi;
use App\Models\RencanaStudiDetail;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat Dosen - Gentildonna
        $userDosen1 = User::create([
            'name' => 'Gentildonna',
            'email' => 'gentildonna@telkomuniversity.ac.id',
            'password' => Hash::make('password123'),
            'role' => 'dosen',
        ]);

        $dosen1 = Dosen::create([
            'user_id' => $userDosen1->id,
            'nip' => '198501012010011001',
            'nama' => 'Gentildonna',
            'jurusan' => 'Elektro',
            'fakultas' => 'Fakultas Teknik Elektro',
        ]);

        // Buat Kelas
        $kelas1 = Kelas::create([
            'nama_kelas' => 'IF-45-01',
            'kode_kelas' => 'IF4501',
            'tahun_ajaran' => '2024/2025',
            'semester' => 'Ganjil',
            'dosen_id' => $dosen1->id,
        ]);

        // Buat Mata Kuliah
        $mataKuliah = [
            ['kode_mk' => 'MAT301', 'nama_mk' => 'Matriks dan Ruang Vektor', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Matematika'],
            ['kode_mk' => 'ELK102', 'nama_mk' => 'Praktikum Elektronika', 'sks' => 1, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Elektronika'],
            ['kode_mk' => 'FIS301', 'nama_mk' => 'Fisika 3A', 'sks' => 2, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Fisika'],
            ['kode_mk' => 'PEE201', 'nama_mk' => 'Pembangkit Energi Elektrik', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Energi'],
            ['kode_mk' => 'MAT101', 'nama_mk' => 'Kalkulus', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Matematika'],
            ['kode_mk' => 'IF401', 'nama_mk' => 'Basis Data', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Data Science'],
            ['kode_mk' => 'IF402', 'nama_mk' => 'Pemrograman Web', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'Web Development'],
            ['kode_mk' => 'IF403', 'nama_mk' => 'Sistem Operasi', 'sks' => 3, 'semester' => 5, 'jurusan' => 'Informatika', 'bidang_minat' => 'System'],
        ];

        $mkIds = [];
        foreach ($mataKuliah as $mk) {
            $mkIds[] = MataKuliah::create($mk)->id;
        }

        // Data Mahasiswa
        $mahasiswaData = [
            [
                'name' => 'Manhattan Cafe',
                'email' => 'manhattan.cafe@student.telkomuniversity.ac.id',
                'nim' => '1301210001',
                'semester_saat_ini' => 5,
                'jurusan' => 'Informatika',
                'ipk' => 3.89,
                'total_sks' => 102,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Rice Shower',
                'email' => 'rice.shower@student.telkomuniversity.ac.id',
                'nim' => '1301210002',
                'semester_saat_ini' => 3,
                'jurusan' => 'Sistem Informasi',
                'ipk' => 3.85,
                'total_sks' => 100,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Symboli Kris S',
                'email' => 'symboli.kriss@student.telkomuniversity.ac.id',
                'nim' => '1301210003',
                'semester_saat_ini' => 7,
                'jurusan' => 'Informatika',
                'ipk' => 3.60,
                'total_sks' => 90,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Hishi Amazon',
                'email' => 'hishi.amazon@student.telkomuniversity.ac.id',
                'nim' => '1301210004',
                'semester_saat_ini' => 5,
                'jurusan' => 'Teknik Komputer',
                'ipk' => 3.50,
                'total_sks' => 85,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Symboli Rudolf',
                'email' => 'symboli.rudolf@student.telkomuniversity.ac.id',
                'nim' => '1301210005',
                'semester_saat_ini' => 6,
                'jurusan' => 'Informatika',
                'ipk' => 3.75,
                'total_sks' => 95,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Matikanetannhauser',
                'email' => 'matikanetannhauser@student.telkomuniversity.ac.id',
                'nim' => '1301210006',
                'semester_saat_ini' => 4,
                'jurusan' => 'Sistem Informasi',
                'ipk' => 3.45,
                'total_sks' => 80,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Orfevre',
                'email' => 'orfevre@student.telkomuniversity.ac.id',
                'nim' => '1301210007',
                'semester_saat_ini' => 5,
                'jurusan' => 'Informatika',
                'ipk' => 3.92,
                'total_sks' => 105,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Stay Gold',
                'email' => 'stay.gold@student.telkomuniversity.ac.id',
                'nim' => '1301210008',
                'semester_saat_ini' => 3,
                'jurusan' => 'Teknik Komputer',
                'ipk' => 3.55,
                'total_sks' => 70,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Almond Eye',
                'email' => 'almond.eye@student.telkomuniversity.ac.id',
                'nim' => '1301210009',
                'semester_saat_ini' => 7,
                'jurusan' => 'Informatika',
                'ipk' => 3.95,
                'total_sks' => 110,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
            [
                'name' => 'Daiwa Scarlet',
                'email' => 'daiwa.scarlet@student.telkomuniversity.ac.id',
                'nim' => '1301210010',
                'semester_saat_ini' => 6,
                'jurusan' => 'Sistem Informasi',
                'ipk' => 3.70,
                'total_sks' => 92,
                'interests' => null,
                'future_focus' => null,
                'learning_preference' => null,
            ],
        ];

        // Buat Mahasiswa (TANPA Rencana Studi - biarkan kosong untuk fresh start)
        foreach ($mahasiswaData as $data) {
            $userMhs = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'mahasiswa',
            ]);

            Mahasiswa::create([
                'user_id' => $userMhs->id,
                'nim' => $data['nim'],
                'nama' => $data['name'],
                'semester_saat_ini' => $data['semester_saat_ini'],
                'jurusan' => $data['jurusan'],
                'kelas_id' => $kelas1->id,
                'ipk' => $data['ipk'],
                'total_sks' => $data['total_sks'],
                'interests' => $data['interests'],
                'future_focus' => $data['future_focus'],
                'learning_preference' => $data['learning_preference'],
            ]);
        }
    }
}
