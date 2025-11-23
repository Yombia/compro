// src/components/Footer.jsx
import logoFTE from "../assets/FTEwhite.png";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-t from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr,1fr,1.5fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src={logoFTE}
                alt="FTE Telkom"
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-slate-300">
              Smart Academic Planner adalah sistem rekomendasi berbasis data
              untuk membantu mahasiswa menentukan mata kuliah terbaik untuk
              semester berikutnya.
            </p>
            <div className="flex gap-3 mt-4 text-xl">
              <span>🔗</span>
              <span>📘</span>
              <span>🐦</span>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Navigasi</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>Beranda</li>
              <li>Rencana Studi</li>
              <li>Riwayat</li>
              <li>Tentang</li>
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Kontak</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>📧 studyacademicplanner@ftio.id</li>
              <li>📱 +62 812-345-6789</li>
              <li>📍 Jl. Telekomunikasi No. 1, Bandung</li>
            </ul>
          </div>

          {/* CTAs */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              Mulai Rencana Studi
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Dapatkan rekomendasi studi terbaik sesuai dengan bidang yang kamu
              minati.
            </p>
            <button className="inline-flex items-center justify-center rounded-full bg-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-600 transition-colors">
              Mulai Tracking
            </button>
          </div>
        </div>

        <p className="mt-8 border-t border-slate-700 pt-4 text-center text-xs text-slate-400">
          2025 © Fakultas Teknik Elektro Telkom University
        </p>
      </div>
    </footer>
  );
}
