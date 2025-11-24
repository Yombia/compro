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
import RencanaStudiStep2 from "./components/RencanaStudiStep2";
import RencanaStudiStep3 from "./components/RencanaStudiStep3";
import RencanaStudiStep4 from "./components/RencanaStudiStep4";
import RiwayatPage from "./components/Riwayat"; // ⬅️ halaman riwayat

function AppShell() {
  const location = useLocation();
  const path = location.pathname;

  // Halaman yang TIDAK pakai navbar & footer (full layout sendiri)
  const hideChrome =
    path === "/login" ||
    path.startsWith("/dashboard") ||
    path.startsWith("/rencana-studi") ||
    path.startsWith("/riwayat");

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar hanya muncul di landing & halaman biasa */}
      {!hideChrome && <Navbar />}

      <main className={hideChrome ? "min-h-screen" : "flex-1"}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Beranda />} />

          {/* Dashboard (layout di dalam DashboardPage) */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Login fullscreen */}
          <Route path="/login" element={<Login />} />

          {/* Rencana Studi – step 1 s/d 4 */}
          <Route path="/rencana-studi" element={<RencanaStudiPage />} />
          <Route path="/rencana-studi/step-2" element={<RencanaStudiStep2 />} />
          <Route path="/rencana-studi/step-3" element={<RencanaStudiStep3 />} />
          <Route path="/rencana-studi/step-4" element={<RencanaStudiStep4 />} />

          {/* Riwayat – pakai layout sidebar juga */}
          <Route path="/riwayat" element={<RiwayatPage />} />

          {/* Route lain sementara */}
          <Route path="/tentang" element={<Navigate to="/" replace />} />
          <Route path="/profil" element={<Navigate to="/login" replace />} />

          {/* Fallback: path tidak dikenal balik ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer cuma muncul di halaman yang pakai navbar */}
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
