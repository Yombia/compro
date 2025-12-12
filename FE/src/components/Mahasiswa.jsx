import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../store/usePlanStore"; // Import store zustand
import { useTheme } from "../hooks/useTheme"; // Import hook tema

export default function MahasiswaForm() {
  const navigate = useNavigate();
  const { setStep2Data, submitCurrentPlan } = usePlanStore();
  const { theme, toggleTheme } = useTheme();

  // State form
  const [formData, setFormData] = useState({
    ipk: "",        // Akan terisi otomatis (Read Only)
    sks: "",        // Akan terisi otomatis (Read Only)
    totalSks: "",   // Akan terisi otomatis (Read Only)
    interests: [],
    futureFocus: "",
    learningPreference: "",
  });

  // =================================================================================
  // SIMULASI INTEGRASI DATA:
  // Mengambil data akademik mahasiswa dari database/backend saat halaman dimuat.
  // =================================================================================
  useEffect(() => {
    // Ceritanya ini request ke API: /api/mahasiswa/akademik
    const academicDataFromDB = {
      ipk: "3.89",      // Data dari database
      sks: "24",        // Data dari database (SKS semester ini)
      totalSks: "85"    // Data dari database (Total SKS kumulatif)
    };

    // Update state form dengan data dari database
    setFormData((prev) => ({
      ...prev,
      ...academicDataFromDB
    }));
  }, []);

  // Handle submit form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setStep2Data(formData); // Simpan ke store
    submitCurrentPlan();    // Finalisasi submission
    navigate("/riwayat");   // Arahkan ke riwayat
  };

  // Handle perubahan input (Hanya untuk dropdown)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox (Limit maksimal 2 pilihan)
  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => {
      let updatedInterests = [...prevState.interests];
      if (checked) {
        if (updatedInterests.length < 2) {
          updatedInterests.push(value);
        }
      } else {
        updatedInterests = updatedInterests.filter((item) => item !== value);
      }
      return { ...prevState, interests: updatedInterests };
    });
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          {/* Logo + Menu */}
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
            </div>
            <nav className="space-y-5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Rencana Studi</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Riwayat</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition hover:bg-white/10"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Profil</span>
              </button>
            </nav>
          </div>
          {/* Bottom: Keluar + Toggle Tema */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-medium text-slate-100/80 hover:text-white"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-100/40 text-sm bg-white/5">
                ⤺
              </span>
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="h-12 w-12 rounded-full border-[3px] border-white bg-[#FACC15] shadow-[0_18px_45px_rgba(0,0,0,0.55)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Rencana Studi Mahasiswa
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-300">
            Data akademik diambil dari sistem pusat. Silakan lengkapi preferensi studi Anda.
          </p>
        </header>

        {/* Formulir Pengajuan Rencana Studi */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* 1. IPK (READ ONLY) */}
          <div>
            <label className="block text-sm font-semibold mb-1">IPK (Terintegrasi)</label>
            <input
              type="text"
              name="ipk"
              value={formData.ipk}
              readOnly
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
          </div>

          {/* 2. SKS (READ ONLY) */}
          <div>
            <label className="block text-sm font-semibold mb-1">SKS Semester Ini (Terintegrasi)</label>
            <input
              type="text"
              name="sks"
              value={formData.sks}
              readOnly
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
          </div>

          {/* 3. TOTAL SKS (READ ONLY) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Total SKS Kumulatif (Terintegrasi)</label>
            <input
              type="text"
              name="totalSks"
              value={formData.totalSks}
              readOnly
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
          </div>

          {/* 4. BIDANG MINAT (EDITABLE - Limit 2) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Bidang yang diminati (Pilih Maksimal 2)</label>
            <div className="flex flex-col space-y-2 p-3 border border-slate-300 rounded-md bg-white/50 dark:bg-slate-900/50 dark:border-slate-700">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value="IoT"
                  checked={formData.interests.includes("IoT")}
                  onChange={handleInterestChange}
                  disabled={formData.interests.length >= 2 && !formData.interests.includes("IoT")}
                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className={formData.interests.length >= 2 && !formData.interests.includes("IoT") ? "text-slate-400" : ""}>IoT</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value="Robotics"
                  checked={formData.interests.includes("Robotics")}
                  onChange={handleInterestChange}
                  disabled={formData.interests.length >= 2 && !formData.interests.includes("Robotics")}
                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className={formData.interests.length >= 2 && !formData.interests.includes("Robotics") ? "text-slate-400" : ""}>Robotics</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value="Programming"
                  checked={formData.interests.includes("Programming")}
                  onChange={handleInterestChange}
                  disabled={formData.interests.length >= 2 && !formData.interests.includes("Programming")}
                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                />
                <span className={formData.interests.length >= 2 && !formData.interests.includes("Programming") ? "text-slate-400" : ""}>Programming</span>
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">*Pilih 1 atau 2 minat utama Anda.</p>
          </div>

          {/* 5. FOKUS SETELAH LULUS (EDITABLE - Dropdown Fix) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Fokus Setelah Lulus</label>
            <select
              name="futureFocus"
              value={formData.futureFocus}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled className="dark:text-slate-400">-- Pilih Fokus --</option>
              <option value="startup" className="dark:bg-slate-800 dark:text-slate-50">Membangun Start Up Teknologi</option>
              <option value="industri" className="dark:bg-slate-800 dark:text-slate-50">Bekerja di Industri</option>
              <option value="s2" className="dark:bg-slate-800 dark:text-slate-50">Melanjutkan S2 / Riset</option>
            </select>
          </div>

          {/* 6. GAYA BELAJAR (EDITABLE - Dropdown Fix) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Gaya Belajar</label>
            <select
              name="learningPreference"
              value={formData.learningPreference}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-50 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled className="dark:text-slate-400">-- Pilih Preferensi --</option>
              <option value="project" className="dark:bg-slate-800 dark:text-slate-50">Proyek & Implementasi</option>
              <option value="konsep" className="dark:bg-slate-800 dark:text-slate-50">Konsep & Analisis</option>
              <option value="campuran" className="dark:bg-slate-800 dark:text-slate-50">Campuran</option>
            </select>
          </div>

          <div className="mt-8">
            <button 
              type="submit" 
              className="w-full py-3 rounded-full bg-[#FACC15] text-[#2D3A67] font-bold shadow-lg hover:bg-[#F97316] hover:scale-[1.01] transition-all"
            >
              Submit Rencana Studi
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}