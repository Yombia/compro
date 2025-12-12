// src/components/Dashboard.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const path = location.pathname;
  const isActive = (prefix) => path.startsWith(prefix);

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

  const handleGoBeranda = () => {
    navigate("/dashboard");
  };

  return (
    <main
      className="
        min-h-screen flex
        bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF]
        dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617]
        text-slate-900 dark:text-slate-50
      "
    >
      {/* SIDEBAR */}
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
                onClick={handleGoBeranda}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                  ${
                    isActive("/dashboard")
                      ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                      : ""
                  }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full
                    ${
                      isActive("/dashboard")
                        ? "bg-[#FACC15]"
                        : "bg-slate-300/80"
                    }`}
                />
                <span
                  className={`${
                    isActive("/dashboard") ? "text-white" : "text-slate-100/80"
                  }`}
                >
                  Beranda
                </span>
              </button>

              {/* Rencana Studi */}
              <button
                type="button"
                onClick={handleGoRencanaStudi}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                  ${
                    isActive("/rencana-studi")
                      ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                      : ""
                  }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full
                    ${
                      isActive("/rencana-studi")
                        ? "bg-[#FACC15]"
                        : "bg-slate-300/80"
                    }`}
                />
                <span
                  className={`${
                    isActive("/rencana-studi")
                      ? "text-white"
                      : "text-slate-100/80"
                  }`}
                >
                  Rencana Studi
                </span>
              </button>

              {/* Riwayat */}
              <button
                type="button"
                onClick={handleGoRiwayat}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                  ${
                    isActive("/riwayat")
                      ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                      : ""
                  }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full
                    ${
                      isActive("/riwayat")
                        ? "bg-[#FACC15]"
                        : "bg-slate-300/80"
                    }`}
                />
                <span
                  className={`${
                    isActive("/riwayat") ? "text-white" : "text-slate-100/80"
                  }`}
                >
                  Riwayat
                </span>
              </button>

              {/* Profil */}
              <button
                type="button"
                onClick={handleGoProfil}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                  ${
                    isActive("/profil")
                      ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                      : ""
                  }`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full
                    ${
                      isActive("/profil")
                        ? "bg-[#FACC15]"
                        : "bg-slate-300/80"
                    }`}
                />
                <span
                  className={`${
                    isActive("/profil") ? "text-white" : "text-slate-100/80"
                  }`}
                >
                  Profil
                </span>
              </button>
            </nav>
          </div>

          {/* Bawah: Keluar + Toggle Tema (pojok kanan bawah) */}
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

      {/* KONTEN UTAMA */}
      <section className="flex-1 px-12 py-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Halo Pengguna */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              Halo,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Pengguna!</span>
                <span className="absolute inset-x-0 bottom-0 h-3 bg-[#FACC15] rounded-md -z-0" />
              </span>
            </h1>
            <p className="mt-3 text-base md:text-lg font-medium">
              Selamat datang di Smart Academic Planner
            </p>
          </header>

          {/* Bar teks biru */}
          <section className="mb-8">
            <p className="text-base md:text-lg leading-relaxed">
              Bingung Mau Ambil Mata Kuliah Apa?{" "}
              <span className="inline-block mt-2 md:mt-0 bg-[#1D4ED8] text-white px-4 py-1 rounded-md">
                Dapatkan rekomendasi yang sesuai dengan minatmu
              </span>
            </p>
          </section>

          {/* 3 Kartu fitur */}
          <section className="mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kartu 1 */}
              <div className="rounded-3xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-100 p-7 flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-2xl bg-gradient-to-b from-[#2563EB] to-[#1E40AF] flex items-center justify-center text-white text-2xl shadow-lg">
                  📊
                </div>
                <h2 className="font-semibold text-lg mb-2">
                  Rekomendasi Akurat
                </h2>
                <p className="text-sm text-slate-600">
                  Sistem memproses IPK, nilai setiap mata kuliah, serta beban
                  SKS untuk menyusun rekomendasi yang sesuai kemampuan
                  akademikmu.
                </p>
              </div>

              {/* Kartu 2 */}
              <div className="rounded-3xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-100 p-7 flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-2xl bg-gradient-to-b from-[#38BDF8] to-[#0EA5E9] flex items-center justify-center text-white text-2xl shadow-lg">
                  ✅
                </div>
                <h2 className="font-semibold text-lg mb-2">Tepat Sasaran</h2>
                <p className="text-sm text-slate-600">
                  Rekomendasi dibangun berdasarkan minat dan tujuan karier yang
                  kamu pilih.
                </p>
              </div>

              {/* Kartu 3 */}
              <div className="rounded-3xl bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] border border-slate-100 p-7 flex flex-col items-center text-center">
                <div className="mb-4 h-14 w-14 rounded-2xl bg-gradient-to-b from-[#F97316] to-[#FB923C] flex items-center justify-center text-white text-2xl shadow-lg">
                  🧭
                </div>
                <h2 className="font-semibold text-lg mb-2">
                  Efisien &amp; Terarah
                </h2>
                <p className="text-sm text-slate-600">
                  Membantu menyusun rencana studi yang optimal setiap semester
                  dengan jalur studi yang lebih terarah.
                </p>
              </div>
            </div>
          </section>

          {/* CTA: Isi Rencana Studi */}
          <section className="mt-6">
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Buat Rencana Studi Kamu Sekarang!
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6 max-w-3xl">
              Untuk memberikan rekomendasi rencana studi yang paling sesuai
              dengan kemampuan dan tujuan akademikmu, silakan isi Form Minat
              Studi terlebih dahulu.
            </p>

            <div className="w-full">
              <button
                type="button"
                onClick={handleGoRencanaStudi}
                className="w-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white py-3 text-sm md:text-base font-semibold shadow-[0_18px_40px_rgba(37,99,235,0.6)] hover:brightness-110 transition"
              >
                Isi Rencana Studi
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
