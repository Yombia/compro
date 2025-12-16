import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/api";

export default function RencanaStudiDosen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [completedPlans, setCompletedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dosenProfile, setDosenProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDosenProfile();
    fetchRiwayatData();
  }, []);

  const fetchDosenProfile = async () => {
    try {
      const response = await api.dosen.getProfile();
      setDosenProfile(response.dosen);
    } catch (error) {
      console.error('Error fetching dosen profile:', error);
    }
  };

  const fetchRiwayatData = async () => {
    try {
      setLoading(true);
      const response = await api.dosen.getRiwayat();
      setCompletedPlans(response.riwayat || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching riwayat:', error);
      setError(error.message || 'Gagal mengambil rencana studi');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await api.dosen.getDetailRencanaStudi(id);
      // You can navigate to detail page or show modal
      console.log('Detail:', response);
    } catch (error) {
      console.error('Error fetching detail:', error);
    }
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const mapStatus = (backendStatus) => {
    const statusMap = {
      Pending: { label: 'Pending', badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200' },
      Tertunda: { label: 'Tertunda', badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200' },
      Disetujui: { label: 'Disetujui', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200' },
      Ditolak: { label: 'Ditolak', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200' },
    };

    return statusMap[backendStatus] || statusMap.Pending;
  };

  const sortedPlans = useMemo(() => {
    return [...completedPlans].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [completedPlans]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    try {
      return new Date(dateValue).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getTotalSKS = (mataKuliah = []) => {
    return mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] dark:bg-[#0B1F4B] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between min-h-[calc(100vh-3rem)]">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
            </div>

            <nav className="space-y-4 text-sm font-medium">
              <button 
                type="button" 
                onClick={() => navigate("/dashboard-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Beranda</span>
              </button>

              <button 
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 bg-[#214A9A] shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Rencana Studi</span>
              </button>

              <button 
                type="button"
                onClick={() => navigate("/riwayat-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Riwayat</span>
              </button>

              <button 
                type="button"
                onClick={() => navigate("/profil-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Profil</span>
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
              onClick={toggleTheme}
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Rencana Studi Mahasiswa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Telusuri seluruh pengajuan rencana studi dari mahasiswa Anda.</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Memuat data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-300 font-semibold mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchRiwayatData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : (
          <section className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <p className="text-base font-semibold">Daftar Rencana Studi Mahasiswa</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr className="text-left">
                    <th className="px-6 py-3 font-medium">Nama</th>
                    <th className="px-6 py-3 font-medium">NIM</th>
                    <th className="px-6 py-3 font-medium">Tanggal Pengajuan</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-center">Jumlah MK</th>
                    <th className="px-6 py-3 font-medium text-center">Total SKS</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPlans.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                        Belum ada rencana studi untuk kelas yang Anda ampu
                      </td>
                    </tr>
                  ) : (
                    sortedPlans.map((plan) => {
                      const { label, badgeClass } = mapStatus(plan.status_rencana);
                      const jumlahMK = plan.mata_kuliah ? plan.mata_kuliah.length : 0;
                      const totalSKS = getTotalSKS(plan.mata_kuliah);

                      return (
                        <tr key={plan.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4">{plan.mahasiswa?.nama || '-'}</td>
                          <td className="px-6 py-4">{plan.mahasiswa?.nim || '-'}</td>
                          <td className="px-6 py-4">{formatDate(plan.created_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">{jumlahMK}</td>
                          <td className="px-6 py-4 text-center">{totalSKS}</td>
                          <td className="px-6 py-4">
                            <button 
                              className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB] transition"
                              onClick={() => handleViewDetails(plan.id)}
                            >
                              Lihat Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
