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
import DashboardDosenPage from "./components/DashboardDosen"; // Dashboard khusus Dosen
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import RencanaStudiPage from "./components/RencanaStudi";
import RencanaStudiStep2 from "./components/RencanaStudiStep2";
import RencanaStudiStep3 from "./components/RencanaStudiStep3";
import RencanaStudiStep4 from "./components/RencanaStudiStep4";
import RiwayatPage from "./components/Riwayat";
import RiwayatDetailPage from "./components/RiwayatDetail"; // ⬅️ TAMBAHAN

import { useAuthStore } from "./store/useAuthStore";

function AppShell() {
  const location = useLocation();
  const path = location.pathname;

  const { isAuthenticated, role } = useAuthStore();

  // Navbar & footer cuma tampil di halaman landing "/"
  const showChrome = path === "/";

  // Route guard + cek role
  const ProtectedRoute = ({ children, roleRequired }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (role !== roleRequired) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar hanya muncul di halaman awal */}
      {showChrome && <Navbar />}

      <main className={showChrome ? "flex-1" : "min-h-screen"}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Beranda />} />

          {/* Dashboard mahasiswa */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard dosen */}
          <Route
            path="/dashboard-dosen"
            element={
              <ProtectedRoute roleRequired="dosen">
                <DashboardDosenPage />
              </ProtectedRoute>
            }
          />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Rencana Studi – step 1 s/d 4 */}
          <Route
            path="/rencana-studi"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RencanaStudiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rencana-studi/step-2"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RencanaStudiStep2 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rencana-studi/step-3"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RencanaStudiStep3 />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rencana-studi/step-4"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RencanaStudiStep4 />
              </ProtectedRoute>
            }
          />

          {/* Riwayat list */}
          <Route
            path="/riwayat"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RiwayatPage />
              </ProtectedRoute>
            }
          />

          {/* Riwayat detail */}
          <Route
            path="/riwayat/:id"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <RiwayatDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Route lain sementara */}
          <Route path="/tentang" element={<Navigate to="/" replace />} />
          <Route path="/profil" element={<Navigate to="/login" replace />} />

          {/* Fallback: path tidak dikenal balik ke beranda */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer juga cuma di halaman awal */}
      {showChrome && <Footer />}
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
