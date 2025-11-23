// src/App.jsx
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Beranda from "./components/Beranda";
import DashboardPage from "./components/Dashboard";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RencanaStudiPage from "./components/RencanaStudi";

// Komponen placeholder simple untuk halaman yang belum jadi
const Placeholder = ({ title }) => {
  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="max-w-xl mx-auto text-center px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-50 mb-2">
          {title}
        </h1>
        <p className="text-slate-500 dark:text-slate-300 mb-4 text-sm md:text-base">
          Halaman <span className="font-semibold">{title}</span> masih dalam
          pengembangan. Nantikan pembaruan berikutnya.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    </div>
  );
};

// Shell yang tau lokasi URL dan mutusin kapan Navbar/Footer ditampilkan
function AppShell() {
  const location = useLocation();
  const path = location.pathname;

  // true kalau kita TIDAK mau menampilkan Navbar & Footer
  const hideChrome =
    path === "/login" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/rencana-studi") ||
    path.startsWith("/riwayat") ||
    path.startsWith("/profil");

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar hanya untuk halaman biasa (bukan login/dashboard/dsb) */}
      {!hideChrome && <Navbar />}

      <main className={hideChrome ? "min-h-screen" : "flex-1"}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Beranda />} />

          {/* Halaman dengan layout sidebar sendiri (tanpa navbar/footer) */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rencana-studi" element={<RencanaStudiPage />} />

          {/* Login full screen tanpa navbar/footer */}
          <Route path="/login" element={<Login />} />

          {/* Halaman lain sementara pakai placeholder */}
          <Route path="/riwayat" element={<Placeholder title="Riwayat" />} />
          <Route path="/tentang" element={<Placeholder title="Tentang" />} />

          {/* Profil diarahkan ke login (belum ada page) */}
          <Route path="/profil" element={<Navigate to="/login" replace />} />

          {/* Fallback: kalau path nggak dikenal, balik ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer juga cuma muncul di halaman biasa */}
      {!hideChrome && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
