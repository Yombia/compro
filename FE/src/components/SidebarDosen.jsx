// SidebarDosen.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../context/ThemeContext";

export default function SidebarDosen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-72 flex flex-col px-4">
      <div className="mt-6 mb-6 w-full bg-[#0D3B9A] dark:bg-[#0B1F4B] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between min-h-[calc(100vh-3rem)]">
        <div>
          <div className="mb-10">
            <p className="text-lg font-bold leading-tight">Smart Academic</p>
            <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
          </div>

          <nav className="space-y-4 text-sm font-medium">
            <button
              type="button"
              onClick={() => navigate("/dashboard-dosen")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                isActive("/dashboard-dosen")
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive("/dashboard-dosen") ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Beranda</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/rencana-studi-dosen")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                isActive("/rencana-studi-dosen")
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive("/rencana-studi-dosen") ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Rencana Studi</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/riwayat-dosen")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                isActive("/riwayat-dosen")
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive("/riwayat-dosen") ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Riwayat</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/profil-dosen")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                isActive("/profil-dosen")
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${isActive("/profil-dosen") ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Profil</span>
            </button>
          </nav>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-100/90 hover:text-white flex items-center gap-2 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Keluar Akun</span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </aside>
  );
}