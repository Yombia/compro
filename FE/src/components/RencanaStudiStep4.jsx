// src/components/RencanaStudiStep4.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { usePlanStore } from "../store/usePlanStore";

export default function RencanaStudiStep4() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // ambil data dari store
  const { currentPlan } = usePlanStore();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const handleViewRiwayat = () => {
    navigate("/riwayat");
  };

  const interests = currentPlan?.interests ?? [];
  const futureFocus = currentPlan?.futureFocus;
  const learningPreference = currentPlan?.learningPreference;

  const fokusBelajarMap = {
    s2: "Melanjutkan S2 / Riset",
    industri: "Bekerja di Industri",
    startup: "Membangun Start Up Teknologi",
  };

  const gayaBelajarMap = {
    konsep: "Konsep & Analisis",
    project: "Proyek & Implementasi",
    campuran: "Campuran",
  };

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF]
                 text-slate-900
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* === SIDEBAR (Rencana Studi aktif) === */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Rencana Studi</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Riwayat</span>
              </button>

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

      {/* === KONTEN STEP 4 === */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Waktunya Racik Jalur Kuliah Terbaik!
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
            Ini adalah rencana studi rekomendasi yang sudah disesuaikan dengan
            minat dan performa akademik kamu.
          </p>
        </header>

        {/* Step indicator */}
        <div className="mb-6">
          <p className="text-sm md:text-base font-semibold">
            Step 4 dari 4 -{" "}
            <span className="text-[#FACC15]">Rencana Studi Akhir</span>
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-full bg-[#FACC15]" />
            </div>
            <div className="flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-[#FACC15]" />
              <span className="h-4 w-4 rounded-full bg-[#FACC15]" />
              <span className="h-4 w-4 rounded-full bg-[#FACC15]" />
              <span className="h-4 w-4 rounded-full bg-[#FACC15] ring-2 ring-offset-2 ring-offset-[#0A4EC0] dark:ring-offset-[#020617] ring-white" />
            </div>
          </div>
        </div>

        {/* Kartu Success Message */}
        <div
          className="rounded-[32px] bg-[#0B3B91] text-white shadow-2xl border border-blue-300/40
                     dark:bg-[#020A26] dark:border-blue-500/40 px-8 py-12
                     flex flex-col items-center justify-center gap-6"
        >
          {/* Success icon */}
          <div className="text-8xl">✅</div>

          {/* Success message */}
          <div className="text-center space-y-3 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold">
              Pengajuan Rencana Studi Berhasil!
            </h2>
            <p className="text-sm md:text-base text-blue-100">
              Rencana studi kamu sudah berhasil diajukan. Sekarang menunggu dosen untuk
              generate rekomendasi mata kuliah berdasarkan minat dan preferensi kamu.
            </p>
          </div>

          {/* Info ringkas */}
          <div className="rounded-2xl bg-white/10 p-6 w-full max-w-lg">
            <h3 className="text-sm font-semibold mb-4 text-[#FACC15]">
              Data yang Telah Diajukan
            </h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li className="flex justify-between">
                <span className="text-blue-100">Bidang Minat:</span>
                <span className="font-semibold">
                  {interests.length > 0 ? interests.join(", ") : "Belum dipilih"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-blue-100">Fokus Setelah Lulus:</span>
                <span className="font-semibold">
                  {fokusBelajarMap[futureFocus] || "Belum ditentukan"}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-blue-100">Gaya Belajar:</span>
                <span className="font-semibold">
                  {gayaBelajarMap[learningPreference] || "Belum ditentukan"}
                </span>
              </li>
            </ul>
          </div>

          {/* Status info */}
          <div className="rounded-2xl bg-[#FACC15]/20 border border-[#FACC15]/40 p-4 w-full max-w-lg">
            <p className="text-xs md:text-sm text-center">
              <span className="font-semibold text-[#FACC15]">Status:</span>{" "}
              <span className="text-white">Menunggu Dosen Generate Rekomendasi</span>
            </p>
          </div>
        </div>

        {/* Tombol lihat riwayat */}
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleViewRiwayat}
            className="rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                       px-10 py-3 text-sm md:text-base font-semibold text-slate-900
                       shadow-[0_14px_36px_rgba(248,181,0,0.6)] hover:brightness-105 transition"
          >
            Lihat Riwayat Pengajuan
          </button>
        </div>
      </section>
    </main>
  );
}
