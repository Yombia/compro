// src/components/Beranda.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- ASSETS ---
import heroFrame from "../assets/framebulat.png";
import heroClock from "../assets/jam.png";
import heroList from "../assets/list.png";
import iconComputer from "../assets/computer-with-blue-yellow 1.png";
import iconChart from "../assets/bartchart-blue-yellow 1.png";
import iconTarget from "../assets/target-dart-blue-yellow 1.png";
import iconPeople from "../assets/orang.png";
import iconGift from "../assets/hadiah.png";
import cornerDecor from "../assets/Untitled design (16) 1.png";

// --- NEW ASSET FOR BOTTOM FRAME ---
import frameBawah from "../assets/FrameBawah.png";

import { useAuthStore } from "../store/useAuthStore";

export default function Beranda() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleMulaiTracking = () => {
    if (isAuthenticated) {
      navigate("/rencana-studi");
    } else {
      setShowLoginAlert(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main
        className="relative flex-grow bg-gradient-to-b from-[#021D4A] via-[#0A4EC0] to-[#E6F4FF] text-slate-900
                  dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
      >
        {/* ================= HERO SECTION (AMAN - TIDAK DIUBAH SAMA SEKALI) ================= */}
        <section className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -left-24 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl dark:bg-sky-500/10" />
            <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-400/40 blur-3xl dark:bg-blue-400/15" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <div className="grid gap-10 md:grid-cols-2 items-center">
              {/* LEFT TEXT */}
              <div>
                <p className="inline-flex rounded-full bg-white/10 dark:bg-slate-800/60 px-4 py-1 text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] text-sky-100 border border-white/20 dark:border-slate-600 mb-4">
                  FTE TELKOM UNIVERSITY · ACADEMIC PLANNER
                </p>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-3">
                  Smart Academic
                  <br />
                  <span className="relative inline-block mt-1">
                    <span className="relative z-10">Planner</span>
                    <span className="absolute -bottom-1 left-0 h-2 w-full bg-sky-300/90 rounded-full -z-0 dark:bg-[#FDBA4D]" />
                  </span>
                </h1>

                <p className="text-base md:text-lg text-sky-100/90 max-w-xl mb-6">
                  Siap bantu masa studi kuliahmu! Menentukan rencana studi terbaik
                  berdasarkan nilai akademik, minat, dan target kelulusan.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleMulaiTracking}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#0052FF] to-[#00B2FF] px-7 py-2.5 text-sm md:text-base font-semibold text-white shadow-xl shadow-blue-500/40 hover:brightness-110 transition
                              dark:from-[#FACC15] dark:to-[#FB923C] dark:shadow-[0_18px_40px_rgba(248,181,0,0.45)]"
                  >
                    Mulai Tracking
                    <span className="ml-2 text-lg">→</span>
                  </button>
                  <p className="text-xs md:text-sm text-sky-100/80">
                    Tidak perlu bingung lagi memilih mata kuliah setiap semester.
                  </p>
                </div>
              </div>

              {/* RIGHT ILLUSTRATION (VERSI FINAL YANG SUDAH OK) */}
              <div className="relative flex justify-center md:justify-end">
                <div className="relative w-[340px] h-[340px] md:w-[460px] md:h-[460px]">
                  <img
                    src={heroFrame}
                    alt="Smart planner"
                    className="absolute inset-0 w-full h-full object-contain z-10"
                  />
                  {/* JAM (Clock) - BESAR & MEPET */}
                  <img
                    src={heroClock}
                    alt="Clock"
                    className="absolute -left-2 bottom-8 md:-left-4 md:bottom-16 w-48 md:w-80 drop-shadow-[0_22px_48px_rgba(0,0,0,0.5)] z-20"
                  />
                  {/* NOTE (Checklist) - BESAR & MEPET */}
                  <img
                    src={heroList}
                    alt="Checklist"
                    className="absolute -right-2 top-4 md:-right-4 md:top-10 w-48 md:w-80 drop-shadow-[0_22px_48px_rgba(0,0,0,0.5)] z-20"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION: MISI / FTE / KEUNGGULAN (AMAN) ================= */}
        <section className="-mt-6 md:-mt-10 pb-12 md:pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            {/* row 1 */}
            <div className="grid gap-4 md:grid-cols-4 text-sm">
              <div className="relative bg-[#E7F2FF]/90 rounded-[32px] shadow-[0_18px_40px_rgba(0,62,150,0.18)] p-6 md:p-7 border border-sky-100 col-span-2 dark:bg-slate-800/90 dark:border-slate-700/80">
                <h3 className="font-semibold text-[#1552B8] dark:text-sky-300 mb-2 text-base md:text-lg">Misi Kami</h3>
                <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Smart Academic Planner adalah sistem rekomendasi berbasis data yang membantu mahasiswa menentukan mata kuliah terbaik untuk semester berikutnya.
                </p>
              </div>
              <div className="relative bg-[#E7F2FF]/90 rounded-[32px] shadow-[0_18px_40px_rgba(0,62,150,0.18)] p-6 md:p-7 border border-sky-100 dark:bg-slate-800/90 dark:border-slate-700/80">
                <h3 className="font-semibold text-[#1552B8] dark:text-sky-300 mb-2 text-base md:text-lg">Fakultas Teknik Elektro</h3>
                <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  FTE Telkom University berfokus pada pendidikan dan penelitian berbasis teknologi.
                </p>
                <img src={iconComputer} alt="" className="absolute bottom-3 right-4 w-12 md:w-14 opacity-80" />
              </div>
              <div className="relative bg-[#E7F2FF]/90 rounded-[32px] shadow-[0_18px_40px_rgba(0,62,150,0.18)] p-6 md:p-7 border border-sky-100 dark:bg-slate-800/90 dark:border-slate-700/80">
                <h3 className="font-semibold text-[#1552B8] dark:text-sky-300 mb-2 text-base md:text-lg">Keunggulan</h3>
                <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Rekomendasi otomatis, menganalisis nilai dan minat.
                </p>
                <img src={iconTarget} alt="" className="absolute bottom-3 right-4 w-12 md:w-14 opacity-80" />
              </div>
            </div>
            {/* row 2 */}
            <div className="grid gap-4 mt-4 md:grid-cols-4 text-sm">
              <div className="relative bg-[#E7F2FF]/90 rounded-[32px] shadow-[0_18px_40px_rgba(0,62,150,0.18)] p-6 md:p-7 border border-sky-100 md:col-span-2 dark:bg-slate-800/90 dark:border-slate-700/80">
                <h3 className="font-semibold text-[#1552B8] dark:text-sky-300 mb-2 text-base md:text-lg">Keunggulan</h3>
                <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Panduan akademik yang memberikan tips dan arahan dalam memilih mata kuliah.
                </p>
              </div>
              <div className="relative bg-[#E7F2FF]/90 rounded-[32px] shadow-[0_18px_40px_rgba(0,62,150,0.18)] p-6 md:p-7 border border-sky-100 md:col-span-2 dark:bg-slate-800/90 dark:border-slate-700/80">
                <h3 className="font-semibold text-[#1552B8] dark:text-sky-300 mb-2 text-base md:text-lg">Keunggulan</h3>
                <p className="text-[13px] md:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  Visualisasi performa menampilkan grafik perkembangan nilai akademik.
                </p>
                <img src={iconChart} alt="" className="absolute bottom-3 right-4 w-14 md:w-16 opacity-80" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION: KETAHUI CARA KERJA KAMI (DIPERBAIKI: RAPI KEMBALI) ================= */}
        <section
          className="relative pt-16 md:pt-20 px-4 bg-gradient-to-b from-[#E6F4FF] to-white
                    dark:from-[#020617] dark:to-[#020617]"
        >
          <div className="max-w-6xl mx-auto">
            {/* Banner judul */}
            <div className="mx-auto max-w-xl bg-[#2777FF] rounded-[32px] py-3 md:py-4 px-6 shadow-[0_18px_40px_rgba(39,119,255,0.55)] text-center border border-blue-300/40 dark:border-blue-500/70 mb-12 relative z-10">
              <h2 className="text-lg md:text-2xl font-bold tracking-wide text-white">
                Ketahui Cara Kerja Kami
              </h2>
            </div>

            {/* Layout Cards: Segitiga Rapi */}
            <div className="flex flex-col items-center gap-8">
              
              {/* BARIS 1: DUA KARTU DI ATAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* CARD 1 */}
                <div
                  className="relative bg-white rounded-[32px] border border-blue-200 shadow-[0_16px_40px_rgba(39,119,255,0.15)] px-6 py-10 flex flex-col items-center text-center
                            dark:bg-[#071427] dark:border-sky-700/70 hover:shadow-lg transition-shadow duration-300 z-10"
                >
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -left-4 w-10 h-10" />
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -right-4 w-10 h-10 rotate-90" />

                  {/* GAMBAR UKURAN NORMAL, TIDAK RAKSASA */}
                  <img
                    src={heroList}
                    alt="Isi data nilai dan minat"
                    className="h-40 md:h-48 w-full object-contain mb-6 drop-shadow-lg"
                  />
                  
                  <h3 className="text-xl md:text-2xl font-bold text-[#1F4ACB] dark:text-sky-300 mb-3">
                    Isi Data Nilai dan Minat
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-200">
                    Mahasiswa menginput data nilai akademik dari semester sebelumnya serta memilih bidang minat.
                  </p>
                </div>

                {/* CARD 2 */}
                <div
                  className="relative bg-white rounded-[32px] border border-blue-200 shadow-[0_16px_40px_rgba(39,119,255,0.15)] px-6 py-10 flex flex-col items-center text-center
                            dark:bg-[#071427] dark:border-sky-700/70 hover:shadow-lg transition-shadow duration-300 z-10"
                >
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -left-4 w-10 h-10" />
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -right-4 w-10 h-10 rotate-90" />

                  <img
                    src={iconPeople}
                    alt="Sistem menganalisis"
                    className="h-40 md:h-48 w-full object-contain mb-6 drop-shadow-lg"
                  />

                  <h3 className="text-xl md:text-2xl font-bold text-[#1F4ACB] dark:text-sky-300 mb-3">
                    Sistem Menganalisis
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-200">
                    Sistem memproses data nilai dan minat menggunakan algoritma cerdas untuk mengenali pola kemampuan.
                  </p>
                </div>
              </div>

              {/* BARIS 2: SATU KARTU DI BAWAH (TENGAH) */}
              <div className="w-full md:w-[calc(50%-1.5rem)]"> 
                {/* CARD 3 - TANPA NEGATIVE MARGIN YANG MERUSAK */}
                <div
                  className="relative bg-white rounded-[32px] border border-blue-200 shadow-[0_20px_50px_rgba(39,119,255,0.25)] px-6 py-10 flex flex-col items-center text-center
                            dark:bg-[#071427] dark:border-sky-700/70 hover:shadow-xl transition-shadow duration-300"
                >
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -left-4 w-10 h-10" />
                  <img src={cornerDecor} alt="" className="hidden md:block absolute -top-4 -right-4 w-10 h-10 rotate-90" />

                  <img
                    src={iconGift}
                    alt="Terima rencana studi"
                    className="h-40 md:h-48 w-full object-contain mb-6 drop-shadow-lg"
                  />

                  <h3 className="text-xl md:text-2xl font-bold text-[#1F4ACB] dark:text-sky-300 mb-3">
                    Terima Rencana Studimu!
                  </h3>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-200">
                    Hasil analisis ditampilkan dalam bentuk rekomendasi mata kuliah yang paling sesuai.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* FRAME BAWAH */}
          <div className="w-full mt-16 md:mt-24">
            <img 
              src={frameBawah} 
              alt="Footer Frame" 
              className="w-full h-auto object-cover block"
            />
          </div>
        </section>

        {/* OVERLAY LOGIN */}
        {showLoginAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-3xl bg-white/90 rounded-3xl shadow-2xl px-6 py-10 text-center">
              <div className="mx-auto mb-6 flex items-center justify-center h-24 w-24 rounded-full border-[6px] border-amber-400 text-6xl text-amber-500 bg-amber-50">!</div>
              <p className="text-xl md:text-3xl font-semibold text-slate-800 mb-6">Silahkan Masuk Terlebih Dahulu!</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm md:text-base font-semibold text-white hover:bg-sky-600 transition-colors">Pergi ke Halaman Masuk</Link>
                <button type="button" onClick={() => setShowLoginAlert(false)} className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm md:text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Tutup</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}