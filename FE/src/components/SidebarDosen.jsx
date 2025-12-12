// SidebarDosen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarDosen() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLogout = () => {
    // Logika logout
    navigate("/");
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Logika toggle theme
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    // Navigasi ke halaman yang sesuai
    if (menu === "dashboard") {
      navigate("/dashboard-dosen");
    } else if (menu === "profil") {
      navigate("/profil-dosen");
    }
    // Tambahkan navigasi untuk menu lainnya
  };

  return (
    <aside className="w-72 flex flex-col px-4">
      <div className="mt-6 mb-6 w-full bg-[#0D3B9A] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between min-h-[calc(100vh-3rem)]">
        <div>
          <div className="mb-10">
            <p className="text-lg font-bold leading-tight">Smart Academic</p>
            <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
          </div>

          <nav className="space-y-4 text-sm font-medium">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => handleMenuClick("dashboard")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "dashboard"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "dashboard" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Dashboard</span>
            </button>

            {/* Rencana Studi */}
            <button
              type="button"
              onClick={() => handleMenuClick("rencana-studi")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "rencana-studi"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "rencana-studi" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Rencana Studi</span>
            </button>

            {/* Riwayat */}
            <button
              type="button"
              onClick={() => handleMenuClick("riwayat")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "riwayat"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "riwayat" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Riwayat</span>
            </button>

            {/* Profil */}
            <button
              type="button"
              onClick={() => handleMenuClick("profil")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "profil"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "profil" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Profil</span>
            </button>

            {/* KELOLA DATA (Opsional) */}
            <button
              type="button"
              onClick={() => handleMenuClick("kelola-data")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "kelola-data"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "kelola-data" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Kelola Data</span>
            </button>

            {/* LAPORAN (Opsional) */}
            <button
              type="button"
              onClick={() => handleMenuClick("laporan")}
              className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                activeMenu === "laporan"
                  ? "bg-[#214A9A] shadow-md"
                  : "text-slate-100/80 hover:bg-[#214A9A] transition"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${activeMenu === "laporan" ? "bg-yellow-300" : "bg-slate-400"}`} />
              <span>Laporan</span>
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
            onClick={toggleDarkMode}
            className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </aside>
  );
}