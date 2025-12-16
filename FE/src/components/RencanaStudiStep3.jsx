// src/components/RencanaStudiStep3.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { usePlanStore } from "../store/usePlanStore";
import { api } from "../api/api";

import robotImg from "../assets/robot.png";
import tandaTanyaImg from "../assets/tandatanya.png";

export default function RencanaStudiStep3() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { currentPlan } = usePlanStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Submit ke backend saat component mount
  useEffect(() => {
    const submitToBackend = async () => {
      try {
        setIsSubmitting(true);
        setError(null);

        console.log('=== DEBUG STEP 3 SUBMIT ===');
        console.log('currentPlan:', currentPlan);

        // Validasi: pastikan data tidak kosong
        if (!currentPlan.interests || currentPlan.interests.length === 0) {
          throw new Error('Pilih minimal 1 bidang minat');
        }
        if (!currentPlan.futureFocus) {
          throw new Error('Pilih fokus setelah lulus');
        }
        if (!currentPlan.learningPreference) {
          throw new Error('Pilih gaya belajar');
        }

        // Prepare data sesuai backend API
        const submitData = {
          interests: currentPlan.interests,
          future_focus: currentPlan.futureFocus,
          learning_preference: currentPlan.learningPreference,
        };

        console.log('submitData:', submitData);

        const response = await api.mahasiswa.submitRencanaStudi(submitData);
        console.log('Submit response:', response);
        
        setSubmitSuccess(true);
        // Auto redirect ke step 4 setelah 1.5 detik
        setTimeout(() => {
          navigate("/rencana-studi/step-4");
        }, 1500);
      } catch (err) {
        console.error("Error submitting rencana studi:", err);
        setError(err.message || "Gagal submit rencana studi");
      } finally {
        setIsSubmitting(false);
      }
    };

    submitToBackend();
  }, [currentPlan, navigate]);

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // Display message based on state
  const getMessage = () => {
    if (error) {
      return `Error: ${error}`;
    }
    if (submitSuccess) {
      return "Pengajuan berhasil! Menunggu dosen untuk generate rekomendasi...";
    }
    if (isSubmitting) {
      return "Sedang mengirim pengajuan rencana studi...";
    }
    return "Memproses...";
  };

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF]
                 text-slate-900
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* ===== SIDEBAR (disamain dengan Dashboard / Step 1-2, Rencana Studi AKTIF) ===== */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          {/* Logo + menu */}
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-5 text-sm font-semibold">
              {/* Beranda (non-aktif) */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>

              {/* Rencana Studi (AKTIF) */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Rencana Studi</span>
              </button>

              {/* Riwayat (non-aktif) */}
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Riwayat</span>
              </button>

              {/* Profil (non-aktif) */}
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Profil</span>
              </button>
            </nav>
          </div>

          {/* Bawah: Keluar + toggle tema */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-medium text-slate-100/80 hover:text-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-100/40 text-sm bg-white/5">
                ⤺
              </span>
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"
              }
              className="h-12 w-12 rounded-full border-[3px] border-white bg-[#FACC15] shadow-[0_18px_45px_rgba(0,0,0,0.55)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
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
            {isSubmitting && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FACC15]"></div>
              </div>
            )}

            {submitSuccess && (
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
              </div>
            )}

            {error && (
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
              </div>
            )}

            <p className="text-center text-sm md:text-base font-semibold">
              {getMessage()}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
