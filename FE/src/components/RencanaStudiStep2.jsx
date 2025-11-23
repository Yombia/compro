// src/components/RencanaStudiStep2.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function RencanaStudiStep2() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // === STATE UNTUK STEP 2 ===
  const INTEREST_OPTIONS = ["IoT", "Robotics", "Programming", "Networking", "Power System"];
  const [selectedInterests, setSelectedInterests] = useState(["IoT", "Robotics", "Programming"]); // default seperti figma

  const [futureFocus, setFutureFocus] = useState("startup"); // "s2", "industri", "startup"
  const [learningPreference, setLearningPreference] = useState("project"); // "konsep", "project", "campuran"

  const toggleInterest = (option) => {
    setSelectedInterests((prev) => {
      if (prev.includes(option)) {
        // kalau sudah dipilih, klik lagi untuk unselect
        return prev.filter((item) => item !== option);
      }
      // batasi maksimal 3
      if (prev.length >= 3) return prev;
      return [...prev, option];
    });
  };

  const handleNext = () => {
    // nanti di sini bisa kirim data ke backend atau navigate ke step 3
    console.log({
      selectedInterests,
      futureFocus,
      learningPreference,
    });
    // contoh nanti:
    // navigate("/rencana-studi/3");
  };

  // helper class chip minat
  const chipClass = (active) =>
    [
      "px-5 py-2 rounded-full text-sm font-semibold border flex items-center gap-2",
      active
        ? "bg-[#FACC15] border-[#FACC15] text-slate-900 shadow-[0_6px_18px_rgba(248,181,0,0.55)]"
        : "bg-transparent border-white/40 text-white hover:bg-white/10",
    ].join(" ");

  // helper class radio
  const radioWrapperClass = "flex items-center gap-3 text-sm md:text-base text-white";

  const radioCircleClass = (active) =>
    [
      "h-4 w-4 rounded-full border-2 flex items-center justify-center",
      active ? "border-[#FACC15]" : "border-white/60",
    ].join(" ");

  const radioDotClass =
    "h-2.5 w-2.5 rounded-full bg-[#FACC15]";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#0A4EC0] via-[#7AB6FF] to-[#E6F4FF]
                 text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* === SIDEBAR – SAMA DENGAN STEP 1, RENCANA STUDI AKTIF === */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] dark:bg-[#0B1F4B] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-4 text-sm font-medium">
              {/* Beranda */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Beranda</span>
              </button>

              {/* Rencana Studi (aktif) */}
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] bg-[#214A9A] px-4 py-3 shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Rencana Studi</span>
              </button>

              {/* Riwayat */}
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Riwayat</span>
              </button>

              {/* Profil */}
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          {/* Bawah: Keluar + toggle tema */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-100/90 hover:text-white flex items-center gap-2"
            >
              <span className="text-lg">↩</span>
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"}
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* === KONTEN STEP 2 === */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Judul besar */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Waktunya Racik Jalur Kuliah Terbaik!
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-800 dark:text-slate-300">
            Bikin pilihan mata kuliah yang paling pas buat perjalananmu.
          </p>
        </header>

        {/* KARTU BIRU STEP 2 */}
        <div className="rounded-[32px] bg-[#0B3B91] text-white shadow-2xl border border-blue-300/50 px-8 py-8 md:px-10 md:py-9">
          {/* Step bar */}
          <div className="mb-7">
            <p className="text-sm md:text-base font-semibold mb-3">
              Step <span className="text-[#FACC15]">2</span> dari 3 - Data Akademik
            </p>

            {/* Progress line */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 rounded-full bg-blue-800 relative overflow-hidden">
                {/* 2/3 progress */}
                <div className="absolute inset-y-0 left-0 w-2/3 bg-[#FACC15]" />
              </div>

              {/* Bulatan step */}
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-[#FACC15] border-2 border-white shadow-md" />
                <span className="h-4 w-4 rounded-full bg-[#FACC15] border-2 border-white shadow-md" />
                <span className="h-4 w-4 rounded-full bg-blue-300/70 border-2 border-white/60" />
              </div>
            </div>
          </div>

          {/* Program studi + IPK + SKS */}
          <div className="space-y-6">
            {/* Program studi */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Program Studi</p>
              <input
                type="text"
                value="S1 TEKNIK ELEKTRO"
                readOnly
                className="w-full rounded-lg bg-white text-slate-900 px-4 py-3 text-sm md:text-base shadow-inner focus:outline-none"
              />
            </div>

            {/* IPK / SKS / Total SKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">IPK</p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                  3.89
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">SKS</p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                  24
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  TOTAL SKS
                </p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                  102
                </div>
              </div>
            </div>

            {/* Bidang yang diminati */}
            <div className="space-y-3 pt-2">
              <p className="text-sm md:text-base font-semibold">
                Bidang yang Diminati (Maksimal 3)
              </p>
              <div className="flex flex-wrap gap-3">
                {INTEREST_OPTIONS.map((opt) => {
                  const active = selectedInterests.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleInterest(opt)}
                      className={chipClass(active)}
                    >
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-slate-900" />
                      )}
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fokus setelah lulus */}
            <div className="space-y-3 pt-4">
              <p className="text-sm md:text-base font-semibold">
                Apa fokus Kamu setelah lulus?
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setFutureFocus("s2")}
                  className={radioWrapperClass}
                >
                  <span className={radioCircleClass(futureFocus === "s2")}>
                    {futureFocus === "s2" && <span className={radioDotClass} />}
                  </span>
                  <span>Melanjutkan S2/Riset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFutureFocus("industri")}
                  className={radioWrapperClass}
                >
                  <span className={radioCircleClass(futureFocus === "industri")}>
                    {futureFocus === "industri" && (
                      <span className={radioDotClass} />
                    )}
                  </span>
                  <span>Bekerja di Industri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFutureFocus("startup")}
                  className={radioWrapperClass}
                >
                  <span className={radioCircleClass(futureFocus === "startup")}>
                    {futureFocus === "startup" && (
                      <span className={radioDotClass} />
                    )}
                  </span>
                  <span>Membangun Start Up Teknologi</span>
                </button>
              </div>
            </div>

            {/* Gaya belajar */}
            <div className="space-y-3 pt-4">
              <p className="text-sm md:text-base font-semibold">
                Kamu lebih nyaman belajar dengan pendekatan seperti apa?
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setLearningPreference("konsep")}
                  className={radioWrapperClass}
                >
                  <span
                    className={radioCircleClass(learningPreference === "konsep")}
                  >
                    {learningPreference === "konsep" && (
                      <span className={radioDotClass} />
                    )}
                  </span>
                  <span>Konsep dan Analisis</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLearningPreference("project")}
                  className={radioWrapperClass}
                >
                  <span
                    className={radioCircleClass(learningPreference === "project")}
                  >
                    {learningPreference === "project" && (
                      <span className={radioDotClass} />
                    )}
                  </span>
                  <span>Proyek dan Implementasi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLearningPreference("campuran")}
                  className={radioWrapperClass}
                >
                  <span
                    className={radioCircleClass(
                      learningPreference === "campuran"
                    )}
                  >
                    {learningPreference === "campuran" && (
                      <span className={radioDotClass} />
                    )}
                  </span>
                  <span>Campuran</span>
                </button>
              </div>
            </div>

            {/* Teks info bawah */}
            <p className="mt-6 text-xs md:text-sm text-[#FACC15]">
              Informasi ini akan membantu sistem merekomendasikan rencana studi
              yang paling sesuai dengan arah dan minat kamu!
            </p>
          </div>
        </div>

        {/* Tombol Selanjutnya di kanan bawah */}
        <div className="mt-8 flex justify-end">
          <button
                type="button"
                onClick={() => navigate("/rencana-studi/step-3")}
                className="mt-4 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                            px-10 py-3 text-sm md:text-base font-semibold text-slate-900
                            shadow-[0_14px_36px_rgba(248,181,0,0.6)] hover:brightness-105 transition"
                >
                Selanjutnya
            </button>
        </div>
      </section>
    </main>
  );
}
