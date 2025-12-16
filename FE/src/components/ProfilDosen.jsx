import { useState, useEffect } from "react";
import SidebarDosen from "./SidebarDosen";
import { api } from "../api/api";

export default function ProfilDosen() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.dosen.getProfile();
        setProfileData({
          name: data.dosen.nama,
          nip: data.dosen.nip,
          email: data.dosen.email ?? "-",
          fakultas: data.dosen.fakultas ?? "-",
          jurusan: data.dosen.jurusan ?? "-",
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.dosen.nama}&backgroundColor=ffdfbf`,
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      <SidebarDosen />

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Profil Dosen</h1>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Memuat data...</p>
            </div>
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
        ) : profileData ? (
          <>
            {/* KARTU PROFIL BESAR - Konsisten dengan Dashboard Dosen */}
            <div className="w-full rounded-[32px] bg-gradient-to-br from-[#2B5BA6] via-[#3668B8] to-[#4A7DD1] text-white shadow-[0_18px_40px_rgba(15,23,42,0.65)] border border-slate-700/30 p-12 flex flex-col items-center text-center mb-8">
              
              {/* Avatar Lingkaran */}
              <div className="mb-6 relative">
                <div className="w-40 h-40 rounded-full border-4 border-[#FACC15] overflow-hidden shadow-lg bg-[#FACC15]/20 flex items-center justify-center">
                  <img 
                    src={profileData.avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Nama & Info */}
              <h2 className="text-4xl font-bold mb-2 tracking-wide">
                {profileData.name}
              </h2>
              <p className="text-base md:text-lg text-blue-100 font-medium">
                {profileData.email}
              </p>
            </div>

            {/* INFORMASI DETAIL - 2 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informasi Akademik */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Informasi Akademik
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Fakultas</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{profileData.fakultas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Jurusan</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{profileData.jurusan}</span>
                  </div>
                </div>
              </div>

              {/* Kontak & Informasi */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 p-6">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
                  Kontak &amp; Informasi
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">NIP</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{profileData.nip}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Email</span>
                    <span className="font-semibold text-slate-800 dark:text-white break-all text-right">{profileData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
