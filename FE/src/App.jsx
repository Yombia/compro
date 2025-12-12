import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Beranda from "./components/Beranda";
import DashboardPage from "./components/Dashboard";
import DashboardDosenPage from "./components/DashboardDosen"; // Dashboard khusus Dosen
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Halaman Rencana Studi
import RencanaStudiStep2 from "./components/RencanaStudiStep2";
import RencanaStudiStep3 from "./components/RencanaStudiStep3";
import RencanaStudiStep4 from "./components/RencanaStudiStep4";
import MahasiswaForm from './components/Mahasiswa'; // Form Rencana Studi Mahasiswa

// Halaman Riwayat
import RiwayatPage from "./components/Riwayat";
import RiwayatDetailPage from "./components/RiwayatDetail"; 

// Halaman Profil (IMPORT BARU DISINI)
import ProfilPage from "./components/ProfilPage"; // Pastikan path import sesuai dengan struktur folder Anda

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

          {/* Rencana Studi – form mahasiswa */}
          <Route
            path="/rencana-studi"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <MahasiswaForm />
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

          {/* ======================================================== */}
          {/* HALAMAN PROFIL (ROUTE BARU) */}
          {/* ======================================================== */}
          <Route
            path="/profil"
            element={
              <ProtectedRoute roleRequired="mahasiswa">
                <ProfilPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
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