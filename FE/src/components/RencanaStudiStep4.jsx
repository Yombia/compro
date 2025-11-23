// src/components/RencanaStudiStep4.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function RencanaStudiStep4() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout?.();
    navigate("/");
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
      {/* === SIDEBAR (sama dengan Step 2 & 3, Rencana Studi aktif) === */}
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

      {/* === KONTEN STEP 4 === */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Judul besar */}
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
              {/* progress penuh */}
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

        {/* Kartu besar ringkasan rencana studi */}
        <div
          className="rounded-[32px] bg-[#0B3B91] text-white shadow-2xl border border-blue-300/40
                     dark:bg-[#020A26] dark:border-blue-500/40 px-6 py-6 md:px-8 md:py-8
                     flex flex-col lg:flex-row gap-8"
        >
          {/* Kiri: tabel mata kuliah yang akan diambil */}
          <div className="flex-1">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Rencana Studi Semester 3 (Contoh)
            </h2>

            <div className="overflow-x-auto rounded-2xl bg-white/5">
              <table className="min-w-full text-xs md:text-sm">
                <thead className="bg-white/10">
                  <tr className="text-left">
                    <th className="px-4 py-2">Mata Kuliah</th>
                    <th className="px-4 py-2">SKS</th>
                    <th className="px-4 py-2">Kategori</th>
                    <th className="px-4 py-2">Kecocokan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-2">Pemrograman Lanjut</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">Programming</td>
                    <td className="px-4 py-2">100%</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-2">Sistem Embedded IoT</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">IoT</td>
                    <td className="px-4 py-2">95%</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-2">Robotika Dasar</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">Robotics</td>
                    <td className="px-4 py-2">90%</td>
                  </tr>
                  <tr className="border-t border-white/10">
                    <td className="px-4 py-2">Metode Numerik</td>
                    <td className="px-4 py-2">3</td>
                    <td className="px-4 py-2">Pendukung</td>
                    <td className="px-4 py-2">85%</td>
                  </tr>
                  <tr className="border-t border-white/10 font-semibold">
                    <td className="px-4 py-2" colSpan={1}>
                      Total SKS
                    </td>
                    <td className="px-4 py-2">12</td>
                    <td className="px-4 py-2" colSpan={2}>
                      Kesesuaian tinggi dengan minat IoT & Robotics
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] md:text-xs text-blue-100">
              Daftar di atas hanya contoh rekomendasi. Nantinya daftar aktual
              bisa diambil dari data sistem atau input pengguna.
            </p>
          </div>

          {/* Kanan: ringkasan singkat */}
          <div className="w-full lg:w-80 space-y-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <h3 className="text-sm font-semibold mb-3">
                Ringkasan Rencana Studi
              </h3>
              <ul className="space-y-2 text-xs md:text-sm">
                <li className="flex justify-between">
                  <span>IPK Saat Ini</span>
                  <span className="font-semibold">3.89</span>
                </li>
                <li className="flex justify-between">
                  <span>Total SKS yang Diambil</span>
                  <span className="font-semibold">12 SKS</span>
                </li>
                <li className="flex justify-between">
                  <span>Bidang Dominan</span>
                  <span className="font-semibold">IoT & Robotics</span>
                </li>
                <li className="flex justify-between">
                  <span>Fokus Belajar</span>
                  <span className="font-semibold">Proyek & Implementasi</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white/5 p-4 text-xs md:text-sm text-blue-100">
              <p className="font-semibold mb-1 text-[#FACC15]">
                Catatan Sistem
              </p>
              <p>
                Kombinasi mata kuliah ini dirancang supaya beban SKS tetap
                seimbang, tapi tetap mendorong kamu di bidang yang kamu minati.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol aksi bawah */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/rencana-studi")}
            className="order-2 md:order-1 rounded-full border border-slate-300/70 dark:border-slate-600
                       px-8 py-3 text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100
                       hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition"
          >
            Atur Ulang Rencana Studi
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="order-1 md:order-2 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                       px-10 py-3 text-sm md:text-base font-semibold text-slate-900
                       shadow-[0_14px_36px_rgba(248,181,0,0.6)] hover:brightness-105 transition"
          >
            Simpan & Kembali ke Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}
