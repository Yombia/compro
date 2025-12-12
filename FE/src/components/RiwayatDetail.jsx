// src/components/RiwayatDetail.jsx
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { usePlanStore } from "../store/usePlanStore";

export default function RiwayatDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { submissions = [] } = usePlanStore();

  const submission = submissions.find((s) => s.id === id);

  const handleLogout = () => {
    logout?.();
    navigate("/login");
  };

  // ========= KALAU DATA NGGAK KETEMU =========
  if (!submission) {
    return (
      <main
        className="min-h-screen flex
                   bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF]
                   text-slate-900
                   dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
      >
        {/* SIDEBAR SINGKAT */}
        <aside className="w-72 flex flex-col px-4">
          <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
            <div>
              <div className="mb-10">
                <p className="text-lg font-bold leading-tight">Smart Academic</p>
                <p className="text-lg font-bold leading-tight text-[#FACC15]">
                  Planner
                </p>
              </div>
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

        {/* KONTEN NOT FOUND */}
        <section className="flex-1 px-10 py-8 flex items-center justify-center">
          <div className="max-w-xl text-center">
            <h1 className="text-2xl font-bold mb-3">
              Data pengajuan tidak ditemukan
            </h1>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mb-6">
              Coba kembali ke halaman Riwayat lalu buka detail pengajuan dari
              sana.
            </p>
            <button
              type="button"
              onClick={() => navigate("/riwayat")}
              className="rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                         px-8 py-3 text-sm md:text-base font-semibold text-slate-900
                         shadow-[0_14px_36px_rgba(248,181,0,0.6)] hover:brightness-105 transition"
            >
              Kembali ke Riwayat
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ========= KALAU DATA ADA =========

  const statusMap = {
    pending: {
      label: "Tertunda",
      chipClass:
        "inline-flex items-center gap-2 rounded-full bg-[#FACC15] text-slate-900 px-4 py-1 text-xs font-semibold",
    },
    approved: {
      label: "Disetujui",
      chipClass:
        "inline-flex items-center gap-2 rounded-full bg-emerald-400 text-slate-900 px-4 py-1 text-xs font-semibold",
    },
    rejected: {
      label: "Ditolak",
      chipClass:
        "inline-flex items-center gap-2 rounded-full bg-rose-500 text-white px-4 py-1 text-xs font-semibold",
    },
  };

  const statusCfg = statusMap[submission.status] || statusMap.pending;

  const fokusBelajarMap = {
    s2: "Melanjutkan S2 / Riset",
    industri: "Bekerja di Industri",
    startup: "Membangun Start Up Teknologi",
  };

  const gayaBelajarMap = {
    konsep: "Konsep & Analisis",
    project: "Proyek dan Implementasi",
    campuran: "Campuran",
  };

  const ipk = submission.ipk ?? 3.89;
  const sks = submission.sks ?? 24;
  const totalSks = submission.totalSks ?? 102;
  const interests = submission.interests ?? [];
  const fokusBelajar = fokusBelajarMap[submission.futureFocus] ?? "-";
  const gayaBelajar = gayaBelajarMap[submission.learningPreference] ?? "-";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#4C9DFF] via-[#8FC4FF] to-[#CBE5FF]
                 text-slate-50
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]"
    >
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>
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

      {/* KONTEN DETAIL */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/riwayat")}
          className="mb-3 inline-flex items-center gap-2 text-sm md:text-base text-slate-100/90 hover:text-white"
        >
          <span className="text-lg">←</span>
          <span>Kembali ke Riwayat</span>
        </button>

        {/* Judul */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug text-white drop-shadow">
            Hasil Rencana Studi
          </h1>
        </header>

        {/* KARTU STATUS PENGAJUAN */}
        <div className="rounded-[28px] bg-[#071C3B] text-white px-6 py-5 md:px-8 md:py-6 shadow-[0_18px_40px_rgba(15,23,42,0.8)] mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm md:text-base font-semibold">
              Status Pengajuan
            </p>
            <p className="mt-2 text-xs md:text-sm text-slate-200">
              Tanggal Pengajuan
            </p>
            <p className="text-sm md:text-base font-semibold">
              {submission.dateLabel ?? "-"}
            </p>
          </div>

          <div>
            <span className={statusCfg.chipClass}>
              <span className="h-2 w-2 rounded-full bg-current" />
              <span>{statusCfg.label}</span>
            </span>
          </div>
        </div>

        {/* KARTU DATA PENGAJUAN ANDA */}
        <div className="rounded-[28px] bg-[#071C3B] text-white px-6 py-6 md:px-8 md:py-7 shadow-[0_18px_40px_rgba(15,23,42,0.85)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold">
              Data Pengajuan Anda
            </h2>
            <span className="rounded-full border border-slate-500 px-3 py-1 text-[10px] md:text-xs uppercase tracking-wide text-slate-300">
              Read Only
            </span>
          </div>

          {/* IPK / SKS / TOTAL SKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-[#0B244C] px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                IPK
              </p>
              <p className="mt-2 text-2xl md:text-3xl font-bold">{ipk}</p>
            </div>
            <div className="rounded-2xl bg-[#0B244C] px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                SKS
              </p>
              <p className="mt-2 text-2xl md:text-3xl font-bold">{sks}</p>
            </div>
            <div className="rounded-2xl bg-[#0B244C] px-5 py-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Total SKS
              </p>
              <p className="mt-2 text-2xl md:text-3xl font-bold">{totalSks}</p>
            </div>
          </div>

          {/* Bidang minat + fokus + gaya belajar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">
                Bidang Minat
              </p>
              <div className="flex flex-wrap gap-2">
                {interests.length === 0 ? (
                  <span className="text-slate-300 text-xs">
                    Belum ada minat yang dipilih
                  </span>
                ) : (
                  interests.map((m) => (
                    <span
                      key={m}
                      className="px-4 py-1.5 rounded-full bg-blue-600/70 text-xs font-semibold"
                    >
                      {m}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wide text-slate-300 mb-1">
                  Fokus Setelah Lulus
                </p>
                <p className="text-sm md:text-base font-semibold">
                  {fokusBelajar}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">
                Pendekatan Belajar
              </p>
              <p className="text-sm md:text-base font-semibold">
                {gayaBelajar}
              </p>
            </div>
          </div>

          <p className="mt-6 text-[11px] md:text-xs text-slate-300/80">
            Rencana studi ini disusun berdasarkan data IPK, total SKS, dan
            preferensi minat yang kamu isi pada formulir rencana studi.
          </p>
        </div>
      </section>
    </main>
  );
}
