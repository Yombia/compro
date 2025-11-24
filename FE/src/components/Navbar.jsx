// src/components/Navbar.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoFTE from "../assets/FTEwhite.png";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [showAuthModal, setShowAuthModal] = useState(false);

  // helper untuk class menu
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-sky-500 border-b-2 border-sky-500 pb-0.5"
      : "text-slate-400 dark:text-slate-200 hover:text-sky-500 transition-colors";

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  /**
   * Dipakai untuk menu yang butuh login (Rencana Studi, Riwayat, dll).
   * Kalau belum login -> tampilkan modal & batalkan navigate.
   */
  const handleProtectedNav = (event, targetPath) => {
    if (!isAuthenticated) {
      event.preventDefault();
      setShowAuthModal(true);
      return;
    }
    // kalau sudah login, lanjut navigate
    event.preventDefault();
    navigate(targetPath);
  };

  return (
    <>
      {/* NAVBAR PILL ATAS */}
      <header className="absolute top-4 left-0 right-0 z-30 flex justify-center">
        <div className="w-[94%] md:w-[80%] lg:w-[70%] bg-white/95 dark:bg-slate-800/95 rounded-full shadow-xl flex items-center justify-between px-6 py-2 border border-slate-100/60 dark:border-slate-700">
          {/* Logo kiri */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoFTE}
              alt="FTE Telkom"
              className="h-10 w-auto object-contain"
            />
            <div className="leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Fakultas Teknik Elektro
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                School of Electrical Engineering
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                Telkom University
              </p>
            </div>
          </Link>

          {/* Menu tengah */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            {/* Beranda selalu boleh diakses */}
            <NavLink to="/" className={navLinkClass}>
              Beranda
            </NavLink>

            {/* Rencana Studi & Riwayat -> butuh login */}
            <NavLink
              to="/rencana-studi"
              className={navLinkClass}
              onClick={(e) => handleProtectedNav(e, "/rencana-studi")}
            >
              Rencana Studi
            </NavLink>
            <NavLink
              to="/riwayat"
              className={navLinkClass}
              onClick={(e) => handleProtectedNav(e, "/riwayat")}
            >
              Riwayat
            </NavLink>

            {/* Tentang: tetap publik */}
            <NavLink to="/tentang" className={navLinkClass}>
              Tentang
            </NavLink>
          </nav>

          {/* Kanan: toggle tema + tombol auth */}
          <div className="flex items-center gap-3">
            {/* Toggle tema */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ubah ke light mode" : "Ubah ke dark mode"
              }
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-yellow-500 shadow-inner border border-slate-300 dark:bg-slate-700 dark:border-slate-500 dark:text-yellow-300"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>

            {/* Tombol Masuk / Keluar */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full bg-red-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-red-600 transition-colors"
              >
                <span className="mr-1.5">↩</span> Keluar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors"
              >
                <span className="mr-1.5">👤</span> Masuk
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MODAL WAJIB LOGIN – sama gaya dengan popup di beranda */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-[90%] max-w-3xl bg-white/90 rounded-3xl shadow-2xl px-6 py-10 text-center">
            <div className="mx-auto mb-6 flex items-center justify-center h-24 w-24 rounded-full border-[6px] border-amber-400 text-6xl text-amber-500 bg-amber-50">
              !
            </div>
            <p className="text-xl md:text-3xl font-semibold text-slate-800 mb-6">
              Silahkan Masuk Terlebih Dahulu!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                onClick={() => setShowAuthModal(false)}
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm md:text-base font-semibold text-white hover:bg-sky-600 transition-colors"
              >
                Pergi ke Halaman Masuk
              </Link>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm md:text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
