import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "./components/Dashboard";  // Pastikan path benar
import Login from "./components/Login";  // Pastikan path benar

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute utama */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Rute untuk login */}
        <Route path="/login" element={<Login />} />

        {/* Profil langsung diarahkan ke /login */}
        <Route path="/profil" element={<Navigate to="/login" replace />} />

        {/* Rute Placeholder */}
        <Route path="/riwayat" element={<Placeholder title="Riwayat" />} />
        <Route path="/tentang" element={<Placeholder title="Tentang" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
