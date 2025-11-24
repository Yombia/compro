// src/components/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme(); // sinkron tema + toggle emoji

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const handleGoRencanaStudi = () => {
    navigate("/rencana-studi");
  };

  const handleGoRiwayat = () => {
    navigate("/riwayat");
  };

  const handleGoProfil = () => {
    navigate("/profil");
  };

  return (
    <main
      className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        {/* Kartu biru di dalam sidebar (tidak full tinggi layar) */}
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] dark:bg-[#0B1F4B] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between">
          {/* Logo + menu */}
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-4 text-sm font-medium">
              {/* Beranda (aktif) */}
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] bg-[#214A9A] px-4 py-3 shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Beranda</span>
              </button>

              {/* Rencana Studi */}
              <button
                type="button"
                onClick={handleGoRencanaStudi}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Rencana Studi</span>
              </button>

              {/* Riwayat */}
              <button
                type="button"
                onClick={handleGoRiwayat}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Riwayat</span>
              </button>

              {/* Profil */}
              <button
                type="button"
                onClick={handleGoProfil}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          {/* Bawah: tombol keluar + toggle tema emoji */}
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
              aria-label={
                theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"
              }
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Halo Pengguna */}
        <header className="mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Halo,{" "}
            <span className="font-semibold text-[#FBBF24]">Pengguna!</span>
          </p>
          <h1 className="text-lg md:text-xl font-semibold mt-1">
            Selamat datang di Smart Academic Planner
          </h1>
        </header>

        {/* Kartu ringkasan (Total SKS, IPK, Periode) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl bg-[#165DFF] text-white px-5 py-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">
              Total SKS
            </p>
            <p className="mt-2 text-3xl font-bold">50</p>
          </div>
          <div className="rounded-2xl bg-[#165DFF] text-white px-5 py-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">IPK</p>
            <p className="mt-2 text-3xl font-bold">3.89</p>
          </div>
          <div className="rounded-2xl bg-[#165DFF] text-white px-5 py-4 shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">
              Periode Semester
            </p>
            <p className="mt-2 text-lg font-semibold">Semester 2 (2023)</p>
          </div>
        </div>

        {/* Tabel riwayat semester lalu */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 mb-8">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">
              i
            </span>
            <p className="text-sm font-semibold">Semester 1 (2023)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr className="text-left">
                  <th className="px-4 py-2">No</th>
                  <th className="px-4 py-2">Kode</th>
                  <th className="px-4 py-2">Mata Kuliah</th>
                  <th className="px-4 py-2">SKS</th>
                  <th className="px-4 py-2">Nilai</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">AZK2AAB3</td>
                  <td className="px-4 py-2">Probabilitas dan Statistika</td>
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">A</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">2</td>
                  <td className="px-4 py-2">AZK2CAB3</td>
                  <td className="px-4 py-2">Persamaan Diferensial</td>
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">AB</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">AZK2EAB3</td>
                  <td className="px-4 py-2">Elektromagnetika</td>
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">A</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">4</td>
                  <td className="px-4 py-2">ABK2AAB3</td>
                  <td className="px-4 py-2">Rangkaian Listrik 2</td>
                  <td className="px-4 py-2">3</td>
                  <td className="px-4 py-2">A</td>
                </tr>
                <tr className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">5</td>
                  <td className="px-4 py-2">ABK2BAB1</td>
                  <td className="px-4 py-2">Praktikum Rangkaian Listrik</td>
                  <td className="px-4 py-2">1</td>
                  <td className="px-4 py-2">AB</td>
                </tr>
                <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/60 font-semibold">
                  <td className="px-4 py-2" colSpan={3}>
                    Jumlah SKS
                  </td>
                  <td className="px-4 py-2">13</td>
                  <td className="px-4 py-2">3.8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* TEKS judul + bar biru kecil */}
        <section className="mb-8">
          <p className="text-sm md:text-base">
            Bingung Mau Ambil Mata Kuliah Apa?{" "}
            <span className="bg-[#1D4ED8] text-white px-3 py-1 rounded-md">
              Dapatkan rekomendasi yang sesuai dengan minatmu
            </span>
          </p>
        </section>

        {/* KARTU REKOMENDASI */}
        <section className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/70 dark:border-slate-700 px-6 py-7 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-2">Rekomendasi Akurat</h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sistem memproses IPK, nilai setiap mata kuliah, serta beban SKS
              untuk menyusun rekomendasi yang sesuai kemampuan akademikmu.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/70 dark:border-slate-700 px-6 py-7 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="font-semibold mb-2">Tepat Sasaran</h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Rekomendasi dibangun berdasarkan minat dan tujuan karier yang
              kamu pilih, sehingga rencana studimu tetap on track.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200/70 dark:border-slate-700 px-6 py-7 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold mb-2">Efisien & Terarah</h3>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Membantumu menyusun rencana studi yang optimal setiap semester
              dengan jalur studi yang lebih terarah.
            </p>
          </div>
        </section>

        {/* CTA: tombol bawah */}
        <section className="mt-4">
          <p className="text-sm md:text-base mb-4">
            Buat Rencana Studi Kamu Sekarang!
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={handleGoRencanaStudi}
              className="flex-1 rounded-full bg-[#165DFF] text-white py-3 text-sm md:text-base font-semibold shadow-[0_10px_30px_rgba(37,99,235,0.6)] hover:brightness-110 transition"
            >
              Mulai Rencana Studi Baru
            </button>
            <button
              type="button"
              onClick={handleGoRiwayat}
              className="flex-1 rounded-full border border-slate-300 dark:border-slate-600 py-3 text-sm md:text-base font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Lihat Riwayat Studi
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
