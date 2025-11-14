import { Link, NavLink } from "react-router-dom";
import { ASSETS } from "../utils/assets";

const linkClass = ({ isActive }) =>
  `px-3 py-1 rounded-md transition ${
    isActive ? "text-blue-600 bg-white/70" : "text-white/90 hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header className="bg-gradient-to-tr from-blue-700 to-blue-500 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={ASSETS.logo} alt="FTE Tel-U" className="h-8 w-8" />
          <div className="leading-tight">
            <div className="text-sm font-semibold">Fakultas Teknik Elektro</div>
            <div className="text-[11px] opacity-80">
              School of Electrical Engineering – Telkom University
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={linkClass}>Beranda</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Rencana Studi</NavLink>
          <NavLink to="/riwayat" className={linkClass}>Riwayat</NavLink>
          <NavLink to="/tentang" className={linkClass}>Tentang</NavLink>
        </nav>

        {/* Profil ➜ Login */}
        <Link
          to="/login"
          className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/90 text-blue-700 px-4 py-1.5 text-sm font-medium hover:bg-white"
        >
          🔐 Profil
        </Link>
      </div>
    </header>
  );
}
