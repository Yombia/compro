import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function SidebarMahasiswa() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const path = location.pathname;

  const isDashboard = path.startsWith("/dashboard");
  const isRencanaStudi = path.startsWith("/rencana-studi");
  const isRiwayat = path.startsWith("/riwayat");
  const isProfil = path.startsWith("/profil");

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  return (
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
              onClick={() => navigate("/dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                ${
                  isDashboard
                    ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                    : ""
                }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isDashboard ? "bg-[#FACC15]" : "bg-slate-300/80"
                }`}
              />
              <span
                className={`${
                  isDashboard ? "text-white" : "text-slate-100/80"
                }`}
              >
                Beranda
              </span>
            </button>

            {/* Rencana Studi */}
            <button
              type="button"
              onClick={() => navigate("/rencana-studi")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                ${
                  isRencanaStudi
                    ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                    : ""
                }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isRencanaStudi ? "bg-[#FACC15]" : "bg-slate-300/80"
                }`}
              />
              <span
                className={`${
                  isRencanaStudi ? "text-white" : "text-slate-100/80"
                }`}
              >
                Rencana Studi
              </span>
            </button>

            {/* Riwayat */}
            <button
              type="button"
              onClick={() => navigate("/riwayat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                ${
                  isRiwayat
                    ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                    : ""
                }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isRiwayat ? "bg-[#FACC15]" : "bg-slate-300/80"
                }`}
              />
              <span
                className={`${
                  isRiwayat ? "text-white" : "text-slate-100/80"
                }`}
              >
                Riwayat
              </span>
            </button>

            {/* Profil */}
            <button
              type="button"
              onClick={() => navigate("/profil")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-full transition
                ${
                  isProfil
                    ? "bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
                    : ""
                }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isProfil ? "bg-[#FACC15]" : "bg-slate-300/80"
                }`}
              />
              <span
                className={`${
                  isProfil ? "text-white" : "text-slate-100/80"
                }`}
              >
                Profil
              </span>
            </button>
          </nav>
        </div>

        {/* Bawah: Keluar + Toggle Tema */}
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
  );
}
