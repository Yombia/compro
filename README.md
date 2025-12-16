# Cara Menjalankan Aplikasi

## Prasyarat
- Node.js dan npm
- PHP 8.1+ dan Composer
- MySQL atau database lain yang dikonfigurasi di `.env`

## Backend (Laravel)
1. Masuk ke folder backend:
   ```bash
   cd BE
   ```
2. Salin file env jika belum ada:
   ```bash
   cp .env.example .env
   ```
3. Sesuaikan kredensial database di `.env`.
4. Pasang dependensi dan buat key aplikasi:
   ```bash
   composer install
   php artisan key:generate
   ```
5. Jalankan migrasi dan (opsional) seeder:
   ```bash
   php artisan migrate --seed
   ```
6. Mulai server Laravel:
   ```bash
   php artisan serve
   ```
   Server default berjalan di http://localhost:8000.

## Frontend (React + Vite)
1. Masuk ke folder frontend:
   ```bash
   cd FE
   ```
2. Pasang dependensi:
   ```bash
   npm install
   ```
3. Jika perlu, salin variabel lingkungan dari `.env.example` dan sesuaikan:
   ```bash
   cp .env.example .env
   ```
4. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
   Vite akan memberikan URL, biasanya http://localhost:5173.

## Penggunaan
- Jalankan backend dan frontend secara bersamaan.
- Akses aplikasi melalui URL Vite (frontend). Backend API tersedia di http://localhost:8000/api.
