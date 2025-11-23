// Import file yang SUDAH ADA (sesuai screenshot kamu)
import logoRed from '../assets/FTEred.png';
import logoWhite from '../assets/FTEwhite.png';
import frameBulat from '../assets/framebulat.png';

// --- BAGIAN INI HARUS KAMU SESUAIKAN ---
// Kalau kamu belum punya file ini di folder assets, dia akan pakai gambar sementara (placeholder)
// Jika sudah ada, ganti import-nya. Contoh: import hero3d from '../assets/hero-image.png';
const heroPlaceholder = "https://placehold.co/500x500/transparent/white?text=Ganti+Hero+3D"; 
const targetPlaceholder = "https://placehold.co/400x400/transparent/blue?text=Ganti+Target+3D";

export const ASSETS = {
  // Logo dinamis
  logoLight: logoRed,       // Dipakai saat Light Mode (Background Putih)
  logoDark: logoWhite,      // Dipakai saat Dark Mode (Background Gelap)
  
  // Background Hero
  heroBg: frameBulat,       
  
  // Ilustrasi Utama (GANTI DENGAN FILE ASLIMU NANTI)
  heroImage: heroPlaceholder, // Ganti dengan import hero3d
  target: targetPlaceholder,  // Ganti dengan import target3d
  
  // Ikon Misi (GANTI DENGAN FILE ASLIMU)
  iconFTE: "https://placehold.co/100x100/transparent/blue?text=FTE",
  iconKeunggulan1: "https://placehold.co/100x100/transparent/blue?text=Rekomen",
  iconKeunggulan2: "https://placehold.co/100x100/transparent/blue?text=Panduan",
  iconKeunggulan3: "https://placehold.co/100x100/transparent/blue?text=Grafik",

  // Ilustrasi Cara Kerja (GANTI DENGAN FILE ASLIMU)
  step1: "https://placehold.co/300x300/transparent/blue?text=Input+Nilai",
  step2: "https://placehold.co/300x300/transparent/blue?text=Analisis",
  step3: "https://placehold.co/300x300/transparent/blue?text=Terima+Hasil",
  
  // Dekorasi Tambahan
  cloud: "https://placehold.co/200x100/transparent/white?text=Cloud", 
  login: "https://placehold.co/400x400/transparent/blue?text=Login+Ilus",
};