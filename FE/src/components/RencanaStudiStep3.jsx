// src/components/RencanaStudiStep3.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

import robotImg from "../assets/robot.png";
import tandaTanyaImg from "../assets/tandatanya.png";

export default function RencanaStudiStep3() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [progress, setProgress] = useState(0);

  // animasi progress dari 0 -> 100
  useEffect(() => {
    const totalDuration = 5000; // 5 detik
    const intervalMs = 100;
    const step = 100 / (totalDuration / intervalMs); // naik sedikit²

    const id = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(id);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, []);

  const isComplete = progress >= 100;

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const handleNext = () => {
    // path ini nanti kita isi dengan page hasil rekomendasi
    navigate("/rencana-studi/step-4");
  };

  const menuButtonBase =
    "w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#0A4EC0] via-[#7AB6FF] to-[#E6F4FF]
                 text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* ===== SIDEBAR (sama dengan step 2) ===== */}
      <aside className="w-64 flex flex-col">
        <div className="flex-1 mx-4 my-6 rounded-[32px] bg-[#0D3B9A] text-white flex flex-col shadow-2xl dark:bg-[#0B1F4B]">
          {/* Logo + menu */}
          <div className="pt-8 px-6 pb-4">
            <div className="mb-10">
              <p className="text-sm font-semibold leading-tight">
                Smart Academic
              </p>
              <p className="text-sm font-semibold leading-tight">Planner</p>
            </div>

            <nav className="space-y-3">
              {/* Beranda */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Beranda</span>
              </button>

              {/* Rencana Studi – aktif */}
              <button
                type="button"
                className={`${menuButtonBase} bg-[#1E4AAE] shadow-md`}
              >
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="font-semibold">Rencana Studi</span>
              </button>

              {/* Riwayat */}
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Riwayat</span>
              </button>

              {/* Profil */}
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          {/* Bawah: Keluar + toggle tema */}
          <div className="mt-auto px-6 pb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-100/90 hover:text-white"
            >
              Keluar Akun
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"
              }
              className="h-10 w-10 rounded-full bg-[#FACC15] shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== KONTEN STEP 3 ===== */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Judul sama seperti step 2 */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Waktunya Racik Jalur Kuliah Terbaik!
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
            Bikin pilihan mata kuliah yang paling pas buat perjalananmu.
          </p>
        </header>

        {/* Kartu besar loading rekomendasi */}
        <div
          className="mt-6 rounded-[32px]
                     bg-[#0B3B91] text-white
                     shadow-2xl border border-blue-300/40
                     dark:bg-[#020A26] dark:border-blue-500/40
                     px-6 md:px-10 py-10
                     flex flex-col items-center justify-center gap-10"
        >
          {/* Robot + tanda tanya */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={robotImg}
                alt="Bot rekomendasi studi"
                className="w-40 md:w-52 lg:w-60 drop-shadow-[0_18px_40px_rgba(0,0,0,0.6)]"
              />
              <img
                src={tandaTanyaImg}
                alt="Tanda tanya"
                className="w-14 md:w-16 lg:w-20 absolute -top-8 -right-8 md:-right-10"
              />
            </div>
          </div>

          {/* Progress bar + teks */}
          <div className="w-full max-w-3xl space-y-4">
            <div className="h-4 rounded-full bg-slate-300/60 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full
                           bg-gradient-to-r from-[#FACC15] to-[#F97316]
                           transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-center text-sm md:text-base font-semibold">
              {isComplete
                ? "Rekomendasi sudah siap, lanjut cek hasilnya yuk!"
                : "Sabar ya sistem sedang memberikan studi yang cocok buat kamu"}
            </p>
          </div>

          {/* Tombol Selanjutnya – muncul kalau progress sudah 100% */}
          {isComplete && (
            <button
              type="button"
              onClick={handleNext}
              className="mt-2 rounded-full bg-white text-[#0B3B91]
                         px-8 py-2.5 text-sm md:text-base font-semibold
                         shadow-[0_10px_26px_rgba(15,23,42,0.45)]
                         hover:bg-slate-100 transition"
            >
              Selanjutnya
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
