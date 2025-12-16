<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Dosen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Endpoint login.
     * POST /api/login
     */
    public function login(Request $request)
    {
        // Validasi input
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower($request->email);
        
        // Tentukan role berdasarkan email
        $role = 'mahasiswa';
        if (str_contains($email, '@student.telkomuniversity.ac.id')) {
            $role = 'mahasiswa';
        } elseif (str_contains($email, '@telkomuniversity.ac.id')) {
            $role = 'dosen';
        } else {
            throw ValidationException::withMessages([
                'email' => ['Email harus menggunakan domain Telkom University.'],
            ]);
        }

        // Cari user berdasarkan email
        $user = User::where('email', $email)->first();

        // Validasi kredensial
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password yang Anda masukkan salah.'],
            ]);
        }

        // Buat token untuk autentikasi API
        $token = $user->createToken('api-token')->plainTextToken;

        // Ambil data mahasiswa atau dosen
        $additionalData = null;
        if ($user->role === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
            if ($mahasiswa) {
                $additionalData = [
                    'id' => $mahasiswa->id,
                    'nim' => $mahasiswa->nim,
                    'nama' => $mahasiswa->nama,
                    'semester_saat_ini' => $mahasiswa->semester_saat_ini,
                    'jurusan' => $mahasiswa->jurusan,
                ];
            }
        } elseif ($user->role === 'dosen') {
            $dosen = Dosen::where('user_id', $user->id)->first();
            if ($dosen) {
                $additionalData = [
                    'id' => $dosen->id,
                    'nip' => $dosen->nip,
                    'nama' => $dosen->nama,
                    'jurusan' => $dosen->jurusan,
                ];
            }
        }

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'data' => $additionalData,
            'token' => $token,
        ], 200);
    }

    /**
     * Endpoint logout.
     * POST /api/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout berhasil',
        ], 200);
    }

    /**
     * Mendapatkan data pengguna yang sedang login.
     * GET /api/me
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        $additionalData = null;
        if ($user->role === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();
            if ($mahasiswa) {
                $additionalData = [
                    'id' => $mahasiswa->id,
                    'nim' => $mahasiswa->nim,
                    'nama' => $mahasiswa->nama,
                    'semester_saat_ini' => $mahasiswa->semester_saat_ini,
                    'jurusan' => $mahasiswa->jurusan,
                ];
            }
        } elseif ($user->role === 'dosen') {
            $dosen = Dosen::where('user_id', $user->id)->first();
            if ($dosen) {
                $additionalData = [
                    'id' => $dosen->id,
                    'nip' => $dosen->nip,
                    'nama' => $dosen->nama,
                    'jurusan' => $dosen->jurusan,
                ];
            }
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'data' => $additionalData,
        ], 200);
    }
}
