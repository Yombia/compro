import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
// import { usePlanStore } from "../store/usePlanStore"; // Kita disable dulu store aslinya

// IMPORT LIBRARY PDF
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// =================================================================
// 1. DATA DUMMY (RIWAYAT BODONG) UNTUK DEMO
// =================================================================
const dummySubmissions = [
  {
    id: "1765549145517",
    title: "Rencana Studi Semester Genap",
    status: "approved", // STATUS: DISETUJUI
    createdAt: "2025-12-01T09:00:00Z",
    dateLabel: "01/12/2025",
    ipk: "3.89",
    totalSks: "85",
    interests: ["IoT", "Robotics"],
    futureFocus: "startup",
    learningPreference: "project",
  },
  {
    id: "1765549145518",
    title: "Pengajuan Perbaikan SKS",
    status: "pending", // STATUS: PENDING
    createdAt: "2025-12-12T14:30:00Z",
    dateLabel: "12/12/2025",
    ipk: "3.90",
    totalSks: "105",
    interests: ["Programming"],
    futureFocus: "industri",
    learningPreference: "konsep",
  },
  {
    id: "1765549145519",
    title: "Rencana Studi Awal",
    status: "rejected", // STATUS: DITOLAK
    createdAt: "2025-11-20T10:15:00Z",
    dateLabel: "20/11/2025",
    ipk: "3.50",
    totalSks: "60",
    interests: ["IoT", "Programming"],
    futureFocus: "s2",
    learningPreference: "campuran",
  },
];

// =================================================================
// DATA REKOMENDASI MATA KULIAH (Tetap Sama)
// =================================================================
const recommendationData = [
  { course: "Matriks dan Ruang Vektor", sks: 3, reason: "Mendukung dasar AI dan Data Science", match: 100 },
  { course: "Praktikum Elektronika", sks: 1, reason: "Penting untuk pengembangan perangkat IoT", match: 85 },
  { course: "Fisika 3A", sks: 2, reason: "Dasar pemahaman sistem fisik/Robotics", match: 100 },
  { course: "Pembangkitan Energi Elektrik", sks: 3, reason: "Cocok untuk bidang energi terbarukan/startup", match: 90 },
  { course: "Kalkulus", sks: 3, reason: "Diperlukan untuk analisis algoritma kompleks", match: 85 },
];

// =================================================================
// FUNGSI GENERATE PDF
// =================================================================
const handleSaveAsPdf = async (detail) => {
  const element = document.getElementById("modal-content-to-print");
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#0B3C9C", 
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`Rencana_Studi_${detail.id}.pdf`);
  } catch (error) {
    console.error("Gagal membuat PDF:", error);
    alert("Terjadi kesalahan saat mengunduh PDF.");
  }
};

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  // const { submissions } = usePlanStore(); // <--- Store asli dikomentari dulu
  const submissions = dummySubmissions;     // <--- Pakai data bodong

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const [activeDetail, setActiveDetail] = useState(null);

  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
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

    const dominantText = getDominantInterestText(detail.interests);

    // 1. KONTEN UNTUK STATUS APPROVED (LENGKAP)
    const RenderApprovedContent = () => {
      const totalRecommendedSks = getTotalRecommendedSKS(recommendationData);
      const interestDistribution = [
        { name: 'IoT', value: 40, color: '#007BFF' },
        { name: 'Programming', value: 20, color: '#32CD32' },
        { name: 'Robotics', value: 40, color: '#FACC15' },
      ];

      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">IPK Saat Ini</p>
              <p className="text-3xl font-bold text-white">{parseFloat(detail.ipk).toFixed(2)}</p>
            </div>
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">Bidang Dominan</p>
              <p className="text-xl font-bold text-white truncate">{dominantText}</p>
            </div>
            <div className="p-5 bg-[#072d7a] rounded-2xl border border-white/10 shadow-inner">
              <p className="text-sm text-slate-300 mb-1">Fokus Karir</p>
              <p className="text-xl font-bold text-[#FACC15] truncate">{fokusMap[detail.futureFocus]}</p>
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
                      {recommendationData.map((item, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 pr-2">
                            <div className="font-medium text-white">{item.course}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{item.reason}</div>
                          </td>
                          <td className="py-3 text-center text-white">{item.sks}</td>
                          <td className="py-3 text-right font-bold text-[#FACC15]">{item.match}%</td>
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
              <div className="bg-[#072d7a]/50 rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold mb-4 text-center">Distribusi Minat</h3>
                <div className="relative w-40 h-40 mb-6 rounded-full shadow-2xl"
                  style={{
                    background: `conic-gradient(
                      ${interestDistribution[0].color} 0% ${interestDistribution[0].value}%, 
                      ${interestDistribution[1].color} ${interestDistribution[0].value}% ${interestDistribution[0].value + interestDistribution[1].value}%, 
                      ${interestDistribution[2].color} ${interestDistribution[0].value + interestDistribution[1].value}% 100%
                    )`
                  }}
                ></div>
                <div className="w-full space-y-2">
                  {interestDistribution.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-200">{item.name}</span>
                      </div>
                      <span className="font-bold text-white">{item.value}%</span>
                    </div>
                  ))}
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
          <h3 className="text-2xl font-bold text-[#FACC15] mb-3">Menunggu Persetujuan</h3>
          <p className="text-slate-300 leading-relaxed">
            Rencana studi kamu sedang dalam proses peninjauan oleh Dosen Wali.<br/>
            Analisis lengkap, rekomendasi mata kuliah, dan grafik minat akan tersedia setelah status pengajuan berubah menjadi 
            <span className="text-emerald-400 font-semibold"> Disetujui</span>.
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
              <p className="text-[#FACC15] font-medium text-lg">{fokusMap[detail.futureFocus]}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">IPK Terakhir</p>
              <p className="text-white font-medium">{detail.ipk}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-0.5">Gaya Belajar</p>
              <p className="text-white font-medium">{belajarMap[detail.learningPreference]}</p>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="max-h-screen overflow-y-auto w-full flex justify-center">
          <div 
            id="modal-content-to-print" 
            className="w-full max-w-5xl rounded-3xl bg-[#0B3C9C] text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-slate-700 p-6 md:p-8 relative min-h-[550px]"
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
                  detail.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  detail.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                }`}>
                  {detail.status === 'approved' ? 'Disetujui' : detail.status === 'rejected' ? 'Ditolak' : 'Pending'}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-300 text-xs">{detail.dateLabel}</span>
              </div>
            </div>

            {/* Dynamic Content Body */}
            <div className="mt-6">
              {detail.status === 'approved' && <RenderApprovedContent />}
              {detail.status === 'pending' && <RenderPendingContent />}
              {detail.status === 'rejected' && <RenderRejectedContent />}
            </div>

            {/* Footer hanya muncul jika Approved */}
            {detail.status === 'approved' && (
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

        <div className="rounded-[32px] bg-[#020617] bg-gradient-to-br from-[#020617] via-[#020617] to-[#0f172a] text-white shadow-[0_18px_40px_rgba(15,23,42,0.85)] border border-slate-800/70 px-5 py-6 md:px-8 md:py-8">
          {sortedSubmissions.length === 0 ? (
            <div className="py-10 text-center text-sm md:text-base text-slate-300">
              Belum ada pengajuan rencana studi.<br />
              Silakan buat rencana studi terlebih dahulu di menu <span className="font-semibold text-[#FACC15] cursor-pointer underline" onClick={() => navigate("/rencana-studi")}>Rencana Studi</span>.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedSubmissions.map((sub) => {
                const statusInfo = statusConfig[sub.status] ?? statusConfig.pending;
                const interestText = sub.interests?.length ? sub.interests.join(", ") : "-";

                return (
                  <div key={sub.id} className="rounded-2xl bg-slate-900/70 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-slate-800 hover:border-slate-600 transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold text-sm md:text-base">{sub.title ?? "Pengajuan Rencana Studi"}</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                          <span className="h-2 w-2 rounded-full bg-slate-900/70" /> {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-slate-300">Tanggal: {sub.dateLabel ?? "-"}</p>
                      <p className="text-xs md:text-sm text-slate-300 mt-1">Minat: {interestText}</p>
                    </div>
                    <div className="flex items-center justify-end">
                      <button 
                        type="button" 
                        onClick={() => setActiveDetail(sub)} 
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 px-4 py-2 text-xs md:text-sm font-semibold text-slate-100 hover:bg-slate-100/10 transition"
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