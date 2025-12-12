import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import SidebarMahasiswa from "./SidebarMahasiswa"; // 1. Import SidebarMahasiswa

export default function ProfilPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // =================================================================
  // DATA DUMMY PROFIL MAHASISWA
  // =================================================================
  const studentProfile = {
    name: "Jane Doe",
    nim: "1301987654",
    major: "S1 Teknik Elektro",
    totalSks: 50,
    ipk: 3.89,
    semester: 2,
    academicYear: "2023",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane&backgroundColor=ffdfbf",
  };

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50 transition-colors duration-300">
      
      {/* 2. Gunakan Komponen SidebarMahasiswa disini */}
      {/* Pastikan SidebarMahasiswa.jsx memiliki class 'sticky top-0 h-screen' jika ingin sidebar tetap diam saat discroll, 
          atau biarkan default sesuai kodingan Anda */}
      <SidebarMahasiswa />

      {/* MAIN CONTENT */}
      <section className="flex-1 px-8 py-8 md:px-12 md:py-10 overflow-y-auto h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
            Profil Mahasiswa
          </h1>
        </header>

        {/* KARTU PROFIL BESAR */}
        <div className="w-full rounded-[40px] bg-[#173678] text-white shadow-2xl relative overflow-hidden p-10 md:p-16 flex flex-col items-center text-center">
          
          {/* Avatar Lingkaran */}
          <div className="mb-6 relative">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#FACC15] overflow-hidden shadow-lg bg-[#FACC15]/20 flex items-center justify-center">
                <img 
                  src={studentProfile.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>

          {/* Nama & Info Jurusan */}
          <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide">
            {studentProfile.name}
          </h2>
          <p className="text-lg md:text-xl text-slate-200 font-medium mb-12">
            {studentProfile.nim} <span className="mx-2">|</span> {studentProfile.major}
          </p>

          {/* Statistik (Grid 3 Kolom) */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            {/* Kolom 1: Total SKS */}
            <div className="flex flex-col items-center">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {studentProfile.totalSks}
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                Total SKS
              </span>
            </div>

            {/* Kolom 2: IPK */}
            <div className="flex flex-col items-center border-t border-slate-500/30 pt-6 md:border-t-0 md:pt-0 md:border-x md:border-slate-500/30 md:px-12">
              <span className="text-4xl md:text-5xl font-bold mb-2">
                {studentProfile.ipk}
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                IPK
              </span>
            </div>

            {/* Kolom 3: Periode */}
            <div className="flex flex-col items-center border-t border-slate-500/30 pt-6 md:border-t-0 md:pt-0">
              <span className="text-2xl md:text-3xl font-bold mb-3 md:mt-2">
                Semester {studentProfile.semester} ({studentProfile.academicYear})
              </span>
              <span className="text-sm md:text-base text-slate-300 uppercase tracking-widest font-semibold">
                Periode
              </span>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}