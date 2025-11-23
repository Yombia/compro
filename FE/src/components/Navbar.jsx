// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoFTE from "../assets/FTEwhite.png";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  // theme global dari hook
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/"); // balik ke beranda
  };

  // helper untuk class menu
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-sky-500 border-b-2 border-sky-500 pb-0.5"
      : "text-slate-400 dark:text-slate-200 hover:text-sky-500 transition-colors";

  return (
    // Navbar absolut di atas konten, ngambang di atas hero
    <header className="absolute top-4 left-0 right-0 z-30 flex justify-center">
      {/* Pill ala figma */}
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
          <NavLink to="/" className={navLinkClass}>
            Beranda
          </NavLink>
          <NavLink to="/rencana-studi" className={navLinkClass}>
            Rencana Studi
          </NavLink>
          <NavLink to="/riwayat" className={navLinkClass}>
            Riwayat
          </NavLink>
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
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md hover:bg-sky-600 transition-colors"
            >
              <span className="mr-1.5">👤</span> Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
