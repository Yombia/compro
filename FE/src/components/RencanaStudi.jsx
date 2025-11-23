// src/components/RencanaStudi.jsx
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import heroRencana from "../assets/PROPLOG.png";

export default function RencanaStudiPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const menuButtonBase =
    "w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-sm transition";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#0A4EC0] via-[#7AB6FF] to-[#E6F4FF]
                 text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* === SIDEBAR (sama style dengan dashboard) === */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between dark:bg-[#0B1F4B]">
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
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#214A9A]`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Beranda</span>
              </button>

              {/* Rencana Studi – aktif di halaman ini */}
              <button
                type="button"
                className={`${menuButtonBase} bg-[#214A9A] shadow-md`}
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span className="font-semibold">Rencana Studi</span>
              </button>

              {/* Riwayat */}
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#214A9A]`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Riwayat</span>
              </button>

              {/* Profil */}
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#214A9A]`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
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

      {/* === KONTEN STEP 1 (hero + status pemeriksaan) === */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Waktunya Racik Jalur Kuliah Terbaik!
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
            Bikin pilihan mata kuliah yang paling pas buat perjalananmu.
          </p>
        </header>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] items-start">
          {/* Kiri: ilustrasi 3D */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative w-[260px] md:w-[340px] lg:w-[380px]">
              <img
                src={heroRencana}
                alt="Ilustrasi Rencana Studi"
                className="w-full h-auto drop-shadow-[0_28px_70px_rgba(15,23,42,0.6)]"
              />
            </div>
          </div>

          {/* Kanan: step + deskripsi + kartu proses */}
          <div className="space-y-6">
            <div>
              <p className="text-sm md:text-base font-semibold">
                Step 1 dari 3 -{" "}
                <span className="text-[#FACC15]">Data Akademik</span>
              </p>

              {/* Progress bar */}
              <div className="mt-3 flex items-center gap-4">
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-1/3 bg-[#FACC15]" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-4 w-4 rounded-full bg-[#FACC15] border-2 border-white shadow-md" />
                  <span className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="h-4 w-4 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>
              </div>

              <p className="mt-4 text-sm md:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed">
                Melalui analisis performa akademik dan minat bidang studi,
                sistem ini memberikan saran rencana studi yang optimal agar
                mahasiswa dapat mencapai hasil belajar maksimal. Mahasiswa
                diharapkan menggunakan fitur ini sebelum melakukan pengisian
                Kartu Rencana Studi (KRS), sehingga pemilihan mata kuliah lebih
                terarah dan sesuai dengan kemampuan akademik yang dimiliki.
              </p>
            </div>

            {/* Kartu proses */}
            <div
              className="rounded-[32px] bg-[#0B3B91] text-white shadow-2xl border border-blue-300/40
                         dark:bg-[#020A26] dark:border-blue-500/40 px-6 py-6 md:px-8 md:py-7"
            >
              <ul className="space-y-4 text-xs md:text-sm">
                <li className="flex gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-emerald-300">
                      Memuat Profil Mahasiswa
                    </p>
                    <p className="text-[11px] md:text-xs text-blue-100">
                      Berhasil
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-emerald-300">
                      Mengambil Data Nilai Akademik
                    </p>
                    <p className="text-[11px] md:text-xs text-blue-100">
                      Berhasil
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-amber-400 flex items-center justify-center text-[11px]">
                    …
                  </span>
                  <div>
                    <p className="font-semibold text-amber-200">
                      Memeriksa IP Semester Terakhir (IPS)
                    </p>
                    <p className="text-[11px] md:text-xs text-blue-100">
                      Sedang Diproses...
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-emerald-300">
                      Hasil Pemeriksaan IPS
                    </p>
                    <p className="text-[11px] md:text-xs text-blue-100">
                      Hasil Ditemukan
                    </p>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="mt-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[11px]">
                    ✕
                  </span>
                  <div>
                    <p className="font-semibold text-red-300">
                      Pemeriksaan Selesai
                    </p>
                    <p className="text-[11px] md:text-xs text-blue-100">
                      Lanjutkan pengisian peminatan
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Tombol NEXT -> STEP 2 */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/rencana-studi/step-2")}
                className="mt-4 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316]
                           px-10 py-3 text-sm md:text-base font-semibold text-slate-900
                           shadow-[0_14px_36px_rgba(248,181,0,0.6)] hover:brightness-105 transition"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
