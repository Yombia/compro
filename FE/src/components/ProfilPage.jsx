import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import SidebarMahasiswa from "./SidebarMahasiswa";
import SidebarDosen from "./SidebarDosen";
import { api } from "../api/api";

export default function ProfilPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tentukan role user
  const userRole = user?.role || "mahasiswa";
  const isDosen = userRole === "dosen";
  
  // Gunakan sidebar berdasarkan role
  const SidebarComponent = isDosen ? SidebarDosen : SidebarMahasiswa;

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (isDosen) {
          const data = await api.dosen.getProfile();
          setProfileData({
            name: data.dosen.nama,
            nip: data.dosen.nip,
            position: "Dosen Tetap",
            faculty: "Fakultas Teknik",
            department: data.dosen.jurusan || "Teknik Elektro",
            teachingExperience: "15 tahun",
            researchCount: 23,
            publications: 45,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.dosen.nama}&backgroundColor=ffdfbf`,
          });
        } else {
          const data = await api.mahasiswa.getProfile();
          setProfileData({
            name: data.mahasiswa.nama,
            nim: data.mahasiswa.nim,
            major: "S1 Teknik Elektro",
            totalSks: data.mahasiswa.total_sks || 0,
            ipk: parseFloat(data.mahasiswa.ipk || 0).toFixed(2),
            semester: data.mahasiswa.semester_saat_ini || 1,
            academicYear: new Date().getFullYear().toString(),
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.mahasiswa.nama}&backgroundColor=ffdfbf`,
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isDosen]);

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50 transition-colors duration-300">
      
      {/* Gunakan Sidebar berdasarkan role */}
      {SidebarComponent && <SidebarComponent />}

      {/* MAIN CONTENT */}
      <section className="flex-1 px-8 py-8 md:px-12 md:py-10 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            {isDosen ? "Profil Dosen" : "Profil Mahasiswa"}
          </h1>
        </header>

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
        ) : profileData ? (
          <>
            {/* KARTU PROFIL BESAR */}
            <div className="w-full rounded-[40px] bg-[#173678] text-white shadow-2xl relative overflow-hidden p-10 md:p-16 flex flex-col items-center text-center">
          
          {/* Avatar Lingkaran */}
          <div className="mb-6 relative">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#FACC15] overflow-hidden shadow-lg bg-[#FACC15]/20 flex items-center justify-center">
                <img 
                  src={profileData.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>

          {/* Nama & Info */}
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
            {profileData.name}
          </h2>
          <p className="text-lg md:text-xl text-slate-200 font-medium mb-12">
            {isDosen ? (
              <>
                {profileData.nip} <span className="mx-2">|</span> {profileData.department}, {profileData.faculty}
              </>
            ) : (
              <>
                {profileData.nim} <span className="mx-2">|</span> {profileData.major}
              </>
            )}
          </p>

          {/* Statistik (Grid 3 Kolom) */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Kolom 1 */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {isDosen ? profileData.teachingExperience : profileData.totalSks}
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                {isDosen ? "Pengalaman Mengajar" : "Total SKS"}
              </span>
            </div>

            {/* Kolom 2 */}
            <div className="flex flex-col items-center border-t border-slate-500/30 pt-6 md:border-t-0 md:pt-0 md:border-x md:border-slate-500/30 md:px-12">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {isDosen ? profileData.researchCount : profileData.ipk}
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                {isDosen ? "Penelitian" : "IPK"}
              </span>
            </div>

            {/* Kolom 3 */}
            <div className="flex flex-col items-center border-t border-slate-500/30 pt-6 md:border-t-0 md:pt-0">
              <span className="text-2xl md:text-3xl font-bold mb-3 md:mt-2">
                {isDosen ? (
                  `${profileData.publications} Publikasi`
                ) : (
                  `Semester ${profileData.semester} (${profileData.academicYear})`
                )}
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                {isDosen ? "Publikasi" : "Periode"}
              </span>
            </div>

          </div>
        </div>

        {/* INFORMASI TAMBAHAN KHUSUS DOSEN */}
        {isDosen && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Informasi Akademik
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Jabatan</span>
                  <span className="font-semibold">{profileData.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Fakultas</span>
                  <span className="font-semibold">{profileData.faculty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Jurusan</span>
                  <span className="font-semibold">{profileData.department}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Kontak & Informasi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">NIP</span>
                  <span className="font-semibold">{profileData.nip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Pengalaman</span>
                  <span className="font-semibold">{profileData.teachingExperience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Email</span>
                  <span className="font-semibold">john.smith@university.ac.id</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INFORMASI TAMBAHAN KHUSUS MAHASISWA */}
        {!isDosen && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Informasi Akademik
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Program Studi</span>
                  <span className="font-semibold">{profileData.major}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Semester</span>
                  <span className="font-semibold">{profileData.semester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Tahun Akademik</span>
                  <span className="font-semibold">{profileData.academicYear}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
                Informasi Lainnya
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">NIM</span>
                  <span className="font-semibold">{profileData.nim}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Total SKS</span>
                  <span className="font-semibold">{profileData.totalSks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-300">IPK</span>
                  <span className="font-semibold">{profileData.ipk}</span>
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        ) : null}
      </section>
    </main>
  );
}