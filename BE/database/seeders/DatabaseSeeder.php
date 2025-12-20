<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;
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
            'nama_kelas' => 'EL-51-01',
            'kode_kelas' => 'EL5101',
            'tahun_ajaran' => '2024/2025',
            'semester' => 'Ganjil',
            'dosen_id' => $dosen1->id,
        ]);

        // Buat Mata Kuliah
        $mataKuliahWajib = [
            1 => [
                ['kode' => 'EL101', 'nama' => 'Kalkulus 1', 'sks' => 3],
                ['kode' => 'EL102', 'nama' => 'Fisika 1A', 'sks' => 3],
                ['kode' => 'EL103', 'nama' => 'Praktikum Fisika 1', 'sks' => 1],
                ['kode' => 'EL104', 'nama' => 'Algoritma dan Pemrograman', 'sks' => 3],
                ['kode' => 'EL105', 'nama' => 'Praktikum Algoritma dan Pemrograman', 'sks' => 1],
                ['kode' => 'EL106', 'nama' => 'Pengantar Rekayasa dan Desain', 'sks' => 3],
                ['kode' => 'EL107', 'nama' => 'Matematika Diskret', 'sks' => 3],
                ['kode' => 'EL108', 'nama' => 'Internalisasi Budaya dan Pembentukan Karakter', 'sks' => 1],
            ],
            2 => [
                ['kode' => 'EL201', 'nama' => 'Kalkulus 2', 'sks' => 3],
                ['kode' => 'EL202', 'nama' => 'Fisika 2A', 'sks' => 3],
                ['kode' => 'EL203', 'nama' => 'Praktikum Fisika 2', 'sks' => 1],
                ['kode' => 'EL204', 'nama' => 'Aljabar Linier', 'sks' => 3],
                ['kode' => 'EL205', 'nama' => 'Variabel Kompleks', 'sks' => 3],
                ['kode' => 'EL206', 'nama' => 'Rangkaian Listrik 1', 'sks' => 3],
                ['kode' => 'EL207', 'nama' => 'Teknik Digital', 'sks' => 3],
            ],
            3 => [
                ['kode' => 'EL301', 'nama' => 'Probabilitas dan Statistika', 'sks' => 3],
                ['kode' => 'EL302', 'nama' => 'Persamaan Diferensial', 'sks' => 3],
                ['kode' => 'EL303', 'nama' => 'Elektromagnetika', 'sks' => 3],
                ['kode' => 'EL304', 'nama' => 'Rangkaian Listrik 2', 'sks' => 3],
                ['kode' => 'EL305', 'nama' => 'Praktikum Rangkaian Listrik', 'sks' => 1],
                ['kode' => 'EL306', 'nama' => 'Dasar-Dasar Mikrokomputer', 'sks' => 3],
                ['kode' => 'EL307', 'nama' => 'Praktikum Teknik Digital & Mikrokomputer', 'sks' => 1],
                ['kode' => 'EL308', 'nama' => 'Fisika 3A', 'sks' => 2],
            ],
            4 => [
                ['kode' => 'EL401', 'nama' => 'Elektronika 1', 'sks' => 3],
                ['kode' => 'EL402', 'nama' => 'Praktikum Elektronika', 'sks' => 1],
                ['kode' => 'EL403', 'nama' => 'Sensor dan Aktuator', 'sks' => 3],
                ['kode' => 'EL404', 'nama' => 'Sistem Kendali', 'sks' => 3],
                ['kode' => 'EL405', 'nama' => 'Praktikum Sistem Sensor & Kendali', 'sks' => 1],
                ['kode' => 'EL406', 'nama' => 'Sistem Telekomunikasi', 'sks' => 3],
                ['kode' => 'EL407', 'nama' => 'Sinyal dan Sistem Waktu Kontinu', 'sks' => 3],
                ['kode' => 'EL408', 'nama' => 'Teknik Pengukuran dan Akuisisi Data', 'sks' => 3],
            ],
            5 => [
                ['kode' => 'EL501', 'nama' => 'Elektronika 2', 'sks' => 3],
                ['kode' => 'EL502', 'nama' => 'Sinyal dan Sistem Waktu Diskret', 'sks' => 3],
                ['kode' => 'EL503', 'nama' => 'Otomatisasi Industri', 'sks' => 3],
                ['kode' => 'EL504', 'nama' => 'Sistem IoT', 'sks' => 3],
                ['kode' => 'EL505', 'nama' => 'Praktikum Sinyal Diskret Otomatisasi & IoT', 'sks' => 1],
                ['kode' => 'EL506', 'nama' => 'Kecerdasan Buatan', 'sks' => 3],
                ['kode' => 'EL507', 'nama' => 'Sistem Tenaga', 'sks' => 2],
                ['kode' => 'EL508', 'nama' => 'Sistem Tertanam', 'sks' => 2],
            ],
            6 => [
                ['kode' => 'EL601', 'nama' => 'Robotika', 'sks' => 3],
                ['kode' => 'EL602', 'nama' => 'Proyek Perancangan Terintegrasi', 'sks' => 5],
                ['kode' => 'EL603', 'nama' => 'Kerja Praktik / KKN', 'sks' => 2],
                ['kode' => 'EL604', 'nama' => 'Manajemen Proyek', 'sks' => 3],
                ['kode' => 'EL605', 'nama' => 'Literasi Data', 'sks' => 2],
                ['kode' => 'EL606', 'nama' => 'Literasi Manusia', 'sks' => 2],
                ['kode' => 'EL607', 'nama' => 'Pancasila', 'sks' => 2],
            ],
            7 => [
                ['kode' => 'EL701', 'nama' => 'Metode Penelitian dan Pengembangan Produk', 'sks' => 2],
                ['kode' => 'EL702', 'nama' => 'Studium Generale', 'sks' => 2],
                ['kode' => 'EL703', 'nama' => 'Ekonomi Kelayakan dan Perencanaan Bisnis', 'sks' => 2],
                ['kode' => 'EL704', 'nama' => 'Kewarganegaraan', 'sks' => 2],
                ['kode' => 'EL705', 'nama' => 'Bahasa Indonesia', 'sks' => 2],
                ['kode' => 'EL706', 'nama' => 'Agama (Islam/Kristen/Katolik/Hindu/Buddha)', 'sks' => 2],
                ['kode' => 'EL707', 'nama' => 'Bahasa Inggris', 'sks' => 2],
                ['kode' => 'EL708', 'nama' => 'Kewirausahaan', 'sks' => 2],
            ],
            8 => [
                ['kode' => 'EL801', 'nama' => 'Tugas Akhir', 'sks' => 4],
            ],
        ];

        $mataKuliahPilihan = [
            'Electronics & IC Design' => [
                ['kode' => 'EL-EICD-01', 'nama' => 'Perancangan Produk Elektronika', 'sks' => 3],
                ['kode' => 'EL-EICD-02', 'nama' => 'Teknologi Pemrosesan Semikonduktor', 'sks' => 3],
                ['kode' => 'EL-EICD-03', 'nama' => 'Desain IC Digital', 'sks' => 3],
                ['kode' => 'EL-EICD-04', 'nama' => 'Desain SoC dan FPGA', 'sks' => 3],
                ['kode' => 'EL-EICD-05', 'nama' => 'Desain IC Analog', 'sks' => 3],
                ['kode' => 'EL-EICD-06', 'nama' => 'Desain IC Back-end dan Verifikasi', 'sks' => 3],
                ['kode' => 'EL-EICD-07', 'nama' => 'Paket IC dan Desain PCB', 'sks' => 3],
                ['kode' => 'EL-EICD-08', 'nama' => 'Integritas Sinyal pada PCB', 'sks' => 3],
                ['kode' => 'EL-EICD-09', 'nama' => 'Pengenalan VLSI', 'sks' => 3],
                ['kode' => 'EL-EICD-10', 'nama' => 'Elektronika Indra Pembau', 'sks' => 3],
            ],
            'Embedded Systems & Biomedics' => [
                ['kode' => 'EL-ESB-01', 'nama' => 'Sensor Wearable: Desain dan Pembuatan Prototipe', 'sks' => 3],
                ['kode' => 'EL-ESB-02', 'nama' => 'Mekanika Gaya Berjalan Robot', 'sks' => 3],
                ['kode' => 'EL-ESB-03', 'nama' => 'Teknologi Rekayasa Elektromedis', 'sks' => 3],
                ['kode' => 'EL-ESB-04', 'nama' => 'Sistem Telemetri', 'sks' => 3],
                ['kode' => 'EL-ESB-05', 'nama' => 'Komunikasi Cahaya Tampak', 'sks' => 3],
                ['kode' => 'EL-ESB-06', 'nama' => 'Pengembangan Aplikasi Perangkat Seluler', 'sks' => 3],
                ['kode' => 'EL-ESB-07', 'nama' => 'Visi Komputer', 'sks' => 3],
                ['kode' => 'EL-ESB-08', 'nama' => 'Metaverse & Digital Twin', 'sks' => 3],
                ['kode' => 'EL-ESB-09', 'nama' => 'Penginderaan dan Pengolahan Sinyal Cerdas', 'sks' => 3],
                ['kode' => 'EL-ESB-10', 'nama' => 'Pembelajaran Mesin dan Aplikasi', 'sks' => 3],
                ['kode' => 'EL-ESB-11', 'nama' => 'Pembelajaran Dalam dan Aplikasi', 'sks' => 3],
            ],
            'Control Systems' => [
                ['kode' => 'EL-CS-01', 'nama' => 'Sistem Kendali Lanjut', 'sks' => 3],
                ['kode' => 'EL-CS-02', 'nama' => 'Sistem Kendali Digital', 'sks' => 3],
                ['kode' => 'EL-CS-03', 'nama' => 'Sistem Kendali Kereta Api', 'sks' => 3],
                ['kode' => 'EL-CS-04', 'nama' => 'Kendali Konverter Daya', 'sks' => 3],
                ['kode' => 'EL-CS-05', 'nama' => 'Sistem Kendali untuk Robotik', 'sks' => 3],
            ],
            'Electrical Power & Smart Grid' => [
                ['kode' => 'EL-EPSG-01', 'nama' => 'Sistem Energi Elektrik Cerdas', 'sks' => 3],
                ['kode' => 'EL-EPSG-02', 'nama' => 'Pembangkitan Energi Elektrik', 'sks' => 3],
                ['kode' => 'EL-EPSG-03', 'nama' => 'Transmisi Daya Elektrik', 'sks' => 3],
                ['kode' => 'EL-EPSG-04', 'nama' => 'Ekonomi dan Bisnis Energi Elektrik', 'sks' => 3],
                ['kode' => 'EL-EPSG-05', 'nama' => 'Energi Terbarukan dan Pengembangan Berkelanjutan', 'sks' => 3],
                ['kode' => 'EL-EPSG-06', 'nama' => 'Elektronika Daya', 'sks' => 3],
                ['kode' => 'EL-EPSG-07', 'nama' => 'Transfer Daya Nirkabel', 'sks' => 3],
                ['kode' => 'EL-EPSG-08', 'nama' => 'Konversi Kendaraan Listrik', 'sks' => 3],
            ],
        ];

        $mataKuliahRecords = [];
        $mataKuliahBySemester = [];

        foreach ($mataKuliahWajib as $semester => $courses) {
            foreach ($courses as $course) {
                $record = [
                    'kode_mk' => $course['kode'],
                    'nama_mk' => $course['nama'],
                    'sks' => $course['sks'],
                    'semester' => $semester,
                    'jurusan' => 'Teknik Elektro',
                    'bidang_minat' => 'Wajib',
                ];

                $mataKuliahRecords[] = $record;
                $mataKuliahBySemester[$semester][] = $record;
            }
        }

        foreach ($mataKuliahPilihan as $bidangMinat => $courses) {
            foreach ($courses as $course) {
                $mataKuliahRecords[] = [
                    'kode_mk' => $course['kode'],
                    'nama_mk' => $course['nama'],
                    'sks' => $course['sks'],
                    'semester' => 7,
                    'jurusan' => 'Teknik Elektro',
                    'bidang_minat' => $bidangMinat,
                ];
            }
        }

        $mataKuliahModelsBySemester = [];

        foreach ($mataKuliahRecords as $mk) {
            $mataKuliah = MataKuliah::create($mk);

            if ($mk['bidang_minat'] === 'Wajib') {
                $semester = $mk['semester'];
                $mataKuliahModelsBySemester[$semester][] = $mataKuliah;
            }
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
            [
                'name' => 'Yesi Sukmawati',
                'email' => 'yesisukmawati@student.telkomuniversity.ac.id',
                'nim' => '1301223031',
                'semester_saat_ini' => 5,
                'jurusan' => 'Teknik Elektro',
                'ipk' => 3.68,
                'total_sks' => 96,
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

            $mahasiswa = Mahasiswa::create([
                'user_id' => $userMhs->id,
                'nim' => $data['nim'],
                'nama' => $data['name'],
                'semester_saat_ini' => $data['semester_saat_ini'],
                'jurusan' => 'Teknik Elektro',
                'kelas_id' => $kelas1->id,
                'ipk' => $data['ipk'],
                'total_sks' => $data['total_sks'],
                'interests' => $data['interests'],
                'future_focus' => $data['future_focus'],
                'learning_preference' => $data['learning_preference'],
            ]);

            $semesterSaatIni = (int) $data['semester_saat_ini'];
            $mataKuliahSemester = $mataKuliahModelsBySemester[$semesterSaatIni] ?? [];

            for ($semester = 1; $semester < $semesterSaatIni; $semester++) {
                $mataKuliahSebelumnya = $mataKuliahModelsBySemester[$semester] ?? [];

                if (count($mataKuliahSebelumnya) === 0) {
                    continue;
                }

                // Brute force tanggal sesuai tahun ajaran: tentukan tahun ajaran aktif lalu mundur per 2 semester
                $now = Carbon::now();
                $currentYearStart = $now->month >= 8 ? $now->year : $now->year - 1; // Ganjil mulai Agustus
                $activeYearIndex = (int) ceil($semesterSaatIni / 2); // indeks tahun ajaran saat ini
                $semesterYearIndex = (int) ceil($semester / 2); // indeks tahun ajaran untuk semester ini
                $yearOffset = $activeYearIndex - $semesterYearIndex; // selisih tahun ajaran
                $yearStart = $currentYearStart - $yearOffset; // tahun ajaran yang sesuai
                $preferredMonth = $semester % 2 === 1 ? 8 : 2; // Ganjil: Agustus (yearStart), Genap: Februari (yearStart+1)
                $yearForDate = $preferredMonth === 8 ? $yearStart : $yearStart + 1;

                $tanggalPengajuan = Carbon::create(
                    $yearForDate,
                    $preferredMonth,
                    10,
                    9,
                    0,
                    0
                )->addDays($semester); // beda beberapa hari agar unik

                $rencanaStudi = RencanaStudi::create([
                    'mahasiswa_id' => $mahasiswa->id,
                    'kelas_id' => $kelas1->id,
                    'tanggal_pengajuan' => $tanggalPengajuan,
                    'status' => 'Disetujui',
                    'catatan' => 'Rencana studi semester ' . $semester . ' (history)',
                ]);

                foreach ($mataKuliahSebelumnya as $mataKuliah) {
                    RencanaStudiDetail::create([
                        'rencana_studi_id' => $rencanaStudi->id,
                        'mata_kuliah_id' => $mataKuliah->id,
                        'alasan' => null,
                        'tingkat_kecocokan' => null,
                    ]);
                }
            }
        }
    }
}
