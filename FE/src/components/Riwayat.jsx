import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { api } from "../api/api";

// IMPORT LIBRARY PDF
import { pdf } from '@react-pdf/renderer';
import RencanaStudiPDF from './RencanaStudiPDF';

// =================================================================
// FUNGSI GENERATE PDF
// =================================================================
const handleSaveAsPdf = async (detail) => {
  try {
    // Generate PDF document
    const blob = await pdf(<RencanaStudiPDF data={detail} />).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `Rencana_Studi_${detail.mahasiswa?.nama || 'Mahasiswa'}_${timestamp}.pdf`;
    link.download = fileName;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Gagal membuat PDF:", error);
    alert("Terjadi kesalahan saat mengunduh PDF.");
  }
};

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch riwayat from backend
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        setLoading(true);
        const data = await api.mahasiswa.getRiwayat();
        setSubmissions(data.data || []);
      } catch (err) {
        console.error("Error fetching riwayat:", err);
        setError(err.message || "Gagal mengambil data riwayat");
      } finally {
        setLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const [activeDetail, setActiveDetail] = useState(null);

  // Map status dari backend ke frontend
  const mapStatus = (backendStatus) => {
    const statusMap = {
      'Pending': 'pending',
      'Tertunda': 'delayed',
      'Disetujui': 'approved',
      'Ditolak': 'rejected',
    };
    return statusMap[backendStatus] || 'pending';
  };

  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const statusConfig = {
    pending: { label: "Pending", badgeClass: "bg-[#FACC15] text-slate-900" },
    delayed: { label: "Tertunda", badgeClass: "bg-[#F97316] text-slate-900" },
    approved: { label: "Disetujui", badgeClass: "bg-emerald-400 text-slate-900" },
    rejected: { label: "Ditolak", badgeClass: "bg-rose-400 text-slate-900" },
  };

  const fokusMap = {
    s2: "Melanjutkan S2 / Riset",
    industri: "Bekerja di Industri",
    startup: "Membangun Start Up Teknologi",
  };

  const belajarMap = {
    konsep: "Konsep & Analisis",
    project: "Proyek & Implementasi",
    campuran: "Campuran",
  };

  const getDominantInterestText = (interests) => {
    if (!interests || interests.length === 0) return "-";
    return interests.join(" & ");
  };

  const getTotalRecommendedSKS = (recs) => {
    return recs.reduce((sum, item) => sum + item.sks, 0);
  };

  // =================================================================
  // KOMPONEN MODAL DETAIL (LOGIKA TAMPILAN DINAMIS)
  // =================================================================
  const DetailModal = ({ detail, onClose }) => {
    if (!detail) return null;

    const dominantText = getDominantInterestText(detail.mahasiswa?.interests);
    const mataKuliah = detail.mata_kuliah || [];

    // 1. KONTEN UNTUK STATUS APPROVED/DELAYED (LENGKAP)
    const RenderApprovedContent = () => {
      const totalRecommendedSks = mataKuliah.reduce((sum, mk) => sum + mk.sks, 0);

      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">IPK Saat Ini</p>
              <p className="text-3xl font-bold text-white">{parseFloat(detail.mahasiswa?.ipk || 0).toFixed(2)}</p>
            </div>
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">Bidang Dominan</p>
              <p className="text-xl font-bold text-white truncate">{dominantText}</p>
            </div>
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">Fokus Karir</p>
              <p className="text-xl font-bold text-[#FACC15] truncate">{fokusMap[detail.mahasiswa?.future_focus]}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-[#072d7a]/50 rounded-2xl border border-white/5 p-6 h-full">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span>📚</span> Rekomendasi Mata Kuliah
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-300">
                        <th className="py-3 font-semibold">Mata Kuliah</th>
                        <th className="py-3 font-semibold text-center">SKS</th>
                        <th className="py-3 font-semibold text-right">Kecocokan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mataKuliah.map((mk, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-2">
                            <div className="font-medium text-white">{mk.nama_mata_kuliah}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{mk.alasan || '-'}</div>
                          </td>
                          <td className="py-3 text-center text-white">{mk.sks}</td>
                          <td className="py-3 text-right font-bold text-[#FACC15]">
                            {mk.tingkat_kecocokan !== null && mk.tingkat_kecocokan !== undefined 
                              ? `${mk.tingkat_kecocokan}%` 
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/20">
                        <td className="py-3 font-bold text-white">Total SKS</td>
                        <td className="py-3 font-bold text-center text-white">{totalRecommendedSks}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="bg-[#072d7a]/50 rounded-2xl border border-white/5 p-6">
                <h3 className="text-lg font-bold mb-4">Informasi Tambahan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Mata Kuliah:</span>
                    <span className="font-semibold text-white">{mataKuliah.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total SKS:</span>
                    <span className="font-semibold text-white">{totalRecommendedSks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Status:</span>
                    <span className="font-semibold text-[#FACC15]">{detail.status_rencana}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  onClick={() => handleSaveAsPdf(detail)}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#f59e0b] 
                             text-[#0f172a] font-bold text-sm uppercase tracking-wide shadow-lg 
                             hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all
                             flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Simpan PDF
                </button>
              </div>
            </div>
          </div>
        </>
      );
    };

    // 2. KONTEN UNTUK STATUS PENDING (RINGKASAN)
    const RenderPendingContent = () => (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8 mb-8 w-full max-w-2xl text-center backdrop-blur-sm">
          <div className="text-5xl mb-4">⏳</div>
          <h3 className="text-2xl font-bold text-[#FACC15] mb-3">Menunggu Dosen Generate Rekomendasi</h3>
          <p className="text-slate-300 leading-relaxed">
            Rencana studi kamu sudah diajukan.<br/>
            Dosen akan generate rekomendasi mata kuliah berdasarkan minat dan preferensi kamu menggunakan AI.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-[#072d7a]/40 rounded-2xl border border-white/5 p-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Ringkasan Pengajuan</h4>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div>
              <p className="text-slate-400 mb-0.5">Bidang Minat</p>
              <p className="text-white font-medium text-lg">{dominantText}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Fokus Karir</p>
              <p className="text-[#FACC15] font-medium text-lg">{fokusMap[detail.mahasiswa?.future_focus]}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">IPK Terakhir</p>
              <p className="text-white font-medium">{detail.mahasiswa?.ipk}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Gaya Belajar</p>
              <p className="text-white font-medium">{belajarMap[detail.mahasiswa?.learning_preference]}</p>
            </div>
          </div>
        </div>
      </div>
    );

    // 3. KONTEN UNTUK STATUS REJECTED (TOLAK & PERBAIKI)
    const RenderRejectedContent = () => (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 mb-8 w-full max-w-2xl text-center backdrop-blur-sm">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-rose-400 mb-3">Pengajuan Ditolak</h3>
          <p className="text-slate-300 leading-relaxed">
            Mohon maaf, rencana studi kamu belum dapat disetujui.<br/>
            Silakan tinjau kembali data akademik dan preferensi minat kamu, lalu ajukan ulang rencana studi yang baru.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full border border-slate-500 text-slate-300 hover:bg-slate-800 transition"
          >
            Tutup
          </button>
          <button
            onClick={() => navigate('/rencana-studi')}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold shadow-lg shadow-rose-900/40 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>✏️</span> Perbaiki Rencana Studi
          </button>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-6 overflow-y-auto">
        <div className="w-full flex justify-center px-2 md:px-4">
          <div 
            className="w-full max-w-[95vw] lg:max-w-6xl rounded-2xl md:rounded-3xl bg-[#0B3C9C] text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-slate-700 p-4 md:p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Tombol Close */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition transform hover:scale-110 z-10 bg-black/20 rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header Modal */}
            <div className="mb-2 pr-10 border-b border-white/10 pb-4">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Detail Rencana Studi</h2>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-slate-400 text-xs font-mono bg-black/20 px-2 py-1 rounded">ID: {detail.id}</span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                  mapStatus(detail.status_rencana) === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  mapStatus(detail.status_rencana) === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  mapStatus(detail.status_rencana) === 'delayed' ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {detail.status_rencana}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-300 text-xs">
                  {new Date(detail.created_at).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Dynamic Content Body */}
            <div className="mt-6">
              {mapStatus(detail.status_rencana) === 'approved' && <RenderApprovedContent />}
              {mapStatus(detail.status_rencana) === 'delayed' && <RenderApprovedContent />}
              {mapStatus(detail.status_rencana) === 'pending' && <RenderPendingContent />}
              {mapStatus(detail.status_rencana) === 'rejected' && <RenderRejectedContent />}
            </div>

            {/* Footer hanya muncul jika Approved/Delayed */}
            {(mapStatus(detail.status_rencana) === 'approved' || mapStatus(detail.status_rencana) === 'delayed') && (
              <div className="mt-10 pt-4 border-t border-white/10">
                <p className="text-[10px] md:text-xs text-slate-400 text-center leading-relaxed opacity-70">
                  Dokumen ini dibuat secara otomatis oleh sistem Smart Academic Planner. <br/>
                  Validasi kurikulum dan prasyarat mata kuliah tetap mengacu pada buku pedoman akademik universitas yang berlaku.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =================================================================
  // RENDER UTAMA HALAMAN
  // =================================================================
  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
            </div>
            <nav className="space-y-5 text-sm font-semibold">
              <button onClick={() => navigate("/dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>
              <button onClick={() => navigate("/rencana-studi")} className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Rencana Studi</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Riwayat</span>
              </button>
              <button onClick={() => navigate("/profil")} className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Profil</span>
              </button>
            </nav>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-medium text-slate-100/80 hover:text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-100/40 text-sm bg-white/5">⤺</span>
              <span>Keluar Akun</span>
            </button>
            <button onClick={toggleTheme} className="h-12 w-12 rounded-full border-[3px] border-white bg-[#FACC15] shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform">
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">Riwayat Pengajuan</h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">Lihat status pengajuan rencana studi kamu.</p>
        </header>

        <div className="rounded-[32px] bg-white bg-gradient-to-br from-white via-white to-slate-50 text-slate-900 shadow-[0_18px_40px_rgba(148,163,184,0.25)] border border-slate-200 px-5 py-6 md:px-8 md:py-8 dark:from-[#020617] dark:via-[#020617] dark:to-[#0f172a] dark:text-white dark:shadow-[0_18px_40px_rgba(15,23,42,0.85)] dark:border-slate-800/70">
          {/* Isi konten list */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-semibold mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : sortedSubmissions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 dark:text-slate-400 mb-4">Belum ada riwayat pengajuan</p>
              <button
                onClick={() => navigate('/rencana-studi')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Buat Rencana Studi
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSubmissions.map((sub) => {
                const statusInfo = statusConfig[mapStatus(sub.status_rencana)] ?? statusConfig.pending;
                const interestText = sub.mahasiswa?.interests?.length ? sub.mahasiswa.interests.join(", ") : "-";

                return (
                  <div key={sub.id} className="rounded-2xl bg-white/90 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-600">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-sm md:text-base text-slate-800 dark:text-white">Pengajuan Rencana Studi</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                          <span className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-900/70" /> {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-300">
                        Tanggal: {new Date(sub.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-300 mt-1">Minat: {interestText}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        type="button" 
                        onClick={() => setActiveDetail(sub)} 
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition dark:border-slate-300/60 dark:text-slate-100 dark:hover:bg-slate-100/10"
                      >
                        <span>👁️</span> Lihat Detail
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RENDER MODAL JIKA ADA DATA */}
        {activeDetail && (
          <DetailModal detail={activeDetail} onClose={() => setActiveDetail(null)} />
        )}
      </section>
    </main>
  );
}