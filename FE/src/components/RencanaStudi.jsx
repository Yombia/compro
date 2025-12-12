import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../store/usePlanStore"; // Store Zustand untuk menyimpan data

export default function RencanaStudiPage() {
  const navigate = useNavigate();
  const { setStep2Data } = usePlanStore(); // Menggunakan set untuk menyimpan data formulir
  const [formData, setFormData] = useState({
    ipk: "",
    sks: "",
    totalSks: "",
    interests: [],
    futureFocus: "",
    learningPreference: "",
  });

  // Fungsi handle submit form (pastikan hanya ada satu fungsi ini)
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Jangan biarkan form melakukan refresh
    setStep2Data(formData); // Simpan data ke store Zustand
    navigate("/rencana-studi/step-2"); // Arahkan ke step berikutnya
  };

  // Update form data on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes for interests
  const handleInterestChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevState) => {
      const interests = checked
        ? [...prevState.interests, value]
        : prevState.interests.filter((item) => item !== value);
      return { ...prevState, interests };
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
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>
            <nav className="space-y-5 text-sm font-semibold">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/rencana-studi")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Rencana Studi</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Riwayat</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/profil")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
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
              aria-label={
                theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"
              }
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
            Isi data berikut dengan benar untuk melanjutkan pengajuan rencana studi.
          </p>
        </header>

        {/* Formulir Pengajuan Rencana Studi */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">IPK</label>
            <input
              type="number"
              name="ipk"
              value={formData.ipk}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">SKS</label>
            <input
              type="number"
              name="sks"
              value={formData.sks}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Total SKS</label>
            <input
              type="number"
              name="totalSks"
              value={formData.totalSks}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Bidang yang diminati</label>
            <label>
              <input
                type="checkbox"
                value="IoT"
                checked={formData.interests.includes("IoT")}
                onChange={handleInterestChange}
              />
              IoT
            </label>
            <label>
              <input
                type="checkbox"
                value="Robotics"
                checked={formData.interests.includes("Robotics")}
                onChange={handleInterestChange}
              />
              Robotics
            </label>
            <label>
              <input
                type="checkbox"
                value="Programming"
                checked={formData.interests.includes("Programming")}
                onChange={handleInterestChange}
              />
              Programming
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold">Fokus Setelah Lulus</label>
            <select
              name="futureFocus"
              value={formData.futureFocus}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300"
              required
            >
              <option value="startup">Membangun Start Up Teknologi</option>
              <option value="industri">Bekerja di Industri</option>
              <option value="s2">Melanjutkan S2 / Riset</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Gaya Belajar</label>
            <select
              name="learningPreference"
              value={formData.learningPreference}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300"
              required
            >
              <option value="project">Proyek & Implementasi</option>
              <option value="konsep">Konsep & Analisis</option>
              <option value="campuran">Campuran</option>
            </select>
          </div>
          <div className="mt-4">
            <button type="submit" className="w-full py-2 rounded-full bg-[#FACC15] text-[#2D3A67] hover:bg-[#F97316] transition">
              Submit Rencana Studi
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
