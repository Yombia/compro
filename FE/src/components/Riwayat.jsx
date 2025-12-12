// src/components/Riwayat.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { usePlanStore } from "../store/usePlanStore";

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { submissions } = usePlanStore();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const [activeDetail, setActiveDetail] = useState(null);

  // sort terbaru di atas
  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const statusConfig = {
    pending: {
      label: "Pending",
      badgeClass: "bg-[#FACC15] text-slate-900",
    },
    delayed: {
      label: "Tertunda",
      badgeClass: "bg-[#F97316] text-slate-900",
    },
    approved: {
      label: "Disetujui",
      badgeClass: "bg-emerald-400 text-slate-900",
    },
    rejected: {
      label: "Ditolak",
      badgeClass: "bg-rose-400 text-slate-900",
    },
  };

  const fokusMap = {
    s2: "Melanjutkan S2 / Riset",
    industri: "Bekerja di Industri",
    startup: "Membangun Start Up Teknologi",
  };

  const belajarMap = {
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
      {/* SIDEBAR – sama seperti dashboard & rencana studi, RIWAYAT aktif */}
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
              {/* Beranda */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>

              {/* Rencana Studi */}
              <button
                type="button"
                onClick={() => navigate("/rencana-studi")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Rencana Studi</span>
              </button>

              {/* Riwayat (AKTIF) */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Riwayat</span>
              </button>

              {/* Profil */}
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

      {/* KONTEN RIWAYAT PENGAJUAN */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Riwayat Pengajuan
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
            Lihat status pengajuan rencana studi kamu.
          </p>
        </header>

        {/* Wrapper besar */}
        <div
          className="rounded-[32px] bg-[#020617] bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a]
                     text-white shadow-[0_18px_40px_rgba(15,23,42,0.85)]
                     border border-slate-800/70 px-5 py-6 md:px-8 md:py-8"
        >
          {sortedSubmissions.length === 0 ? (
            <div className="py-10 text-center text-sm md:text-base text-slate-300">
              Belum ada pengajuan rencana studi.
              <br />
              Silakan buat rencana studi terlebih dahulu di menu{" "}
              <span
                className="font-semibold text-[#FACC15] cursor-pointer underline underline-offset-2"
                onClick={() => navigate("/rencana-studi")}
              >
                Rencana Studi
              </span>
              .
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSubmissions.map((sub) => {
                const statusInfo =
                  statusConfig[sub.status] ?? statusConfig.pending;

                const interestText =
                  sub.interests && sub.interests.length
                    ? sub.interests.join(", ")
                    : "-";

                return (
                  <div
                    key={sub.id}
                    className="rounded-2xl bg-slate-900/70 px-5 py-4 md:px-6 md:py-5
                               flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    {/* Kiri: info pengajuan */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-sm md:text-base">
                          {sub.title ?? "Pengajuan Rencana Studi"}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-slate-900/70" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300">
                        Tanggal: {sub.dateLabel ?? "-"}
                      </p>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">
                        Minat: {interestText}
                      </p>
                    </div>

                    {/* Kanan: tombol detail – buka modal */}
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveDetail(sub)}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300/60
                                   px-4 py-2 text-xs md:text-sm font-semibold text-slate-100
                                   hover:bg-slate-100/10 transition"
                      >
                        <span className="text-sm">👁️</span>
                        <span>Lihat Detail</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL DETAIL */}
        {activeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-3xl bg-[#020617] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-700 px-6 py-6 md:px-8 md:py-7">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold mb-1">
                    Detail Pengajuan Rencana Studi
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300">
                    Tanggal pengajuan: {activeDetail.dateLabel ?? "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDetail(null)}
                  className="ml-3 text-slate-400 hover:text-white text-xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Isi detail */}
              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">IPK Saat Pengajuan</span>
                  <span className="font-semibold">
                    {activeDetail.ipk ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Total SKS Rencana</span>
                  <span className="font-semibold">
                    {activeDetail.totalSks ?? "-"} SKS
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Minat Utama</span>
                  <span className="font-semibold text-right">
                    {activeDetail.interests && activeDetail.interests.length
                      ? activeDetail.interests.join(", ")
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Fokus Setelah Lulus</span>
                  <span className="font-semibold text-right">
                    {fokusMap[activeDetail.futureFocus] ?? "-"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-300">Gaya Belajar</span>
                  <span className="font-semibold text-right">
                    {belajarMap[activeDetail.learningPreference] ?? "-"}
                  </span>
                </div>
              </div>

              <p className="mt-5 text-[11px] md:text-xs text-slate-400">
                Rencana studi ini disusun berdasarkan data IPK, total SKS, dan
                preferensi minat yang kamu isi pada formulir rencana studi.
              </p>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveDetail(null)}
                  className="rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                             px-7 py-2.5 text-xs md:text-sm font-semibold text-slate-900
                             shadow-[0_12px_30px_rgba(248,181,0,0.65)] hover:brightness-105 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
