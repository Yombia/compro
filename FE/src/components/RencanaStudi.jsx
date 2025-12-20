import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../store/usePlanStore"; // Store Zustand untuk menyimpan data
import { api } from "../api/api";
import { useTheme } from "../hooks/useTheme";

export default function RencanaStudiPage() {
  const navigate = useNavigate();
  const { setStep2Data } = usePlanStore(); // Menggunakan set untuk menyimpan data formulir
  const { toggleTheme, theme } = useTheme();
  const [formData, setFormData] = useState({
    ipk: "",
    sks: "",
    totalSks: "",
    interests: [],
    futureFocus: "",
    learningPreference: "",
  });
  const [hasApprovedPlan, setHasApprovedPlan] = useState(false);
  const [hasOpenPlan, setHasOpenPlan] = useState(false);
  const [openPlanStatus, setOpenPlanStatus] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const response = await api.mahasiswa.getProfile();
        if (!mounted) return;

        const mhs = response?.mahasiswa ?? {};
        setFormData((prev) => ({
          ...prev,
          ipk: mhs.ipk ?? "",
          sks: mhs.remaining_sks_semester ?? mhs.max_sks_semester ?? mhs.sks_semester_ini ?? "",
          totalSks: mhs.total_sks ?? "",
          interests: Array.isArray(mhs.interests) ? mhs.interests.slice(0, 2) : [],
          futureFocus: mhs.future_focus ?? "",
          learningPreference: mhs.learning_preference ?? "",
        }));

        setHasApprovedPlan(Boolean(mhs.has_approved_plan_current_semester));
        setHasOpenPlan(Boolean(mhs.has_open_plan));
        setOpenPlanStatus(mhs.open_plan_status ?? "");
        setProfileError("");
      } catch (err) {
        if (!mounted) return;
        setProfileError(err?.message || "Gagal memuat profil mahasiswa");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Fungsi handle submit form 
  const handleFormSubmit = (e) => {
    e.preventDefault(); // Jangan biarkan form melakukan refresh
    if (hasApprovedPlan || hasOpenPlan) {
      const reason = hasApprovedPlan
        ? "Rencana studi semester ini sudah disetujui."
        : `Pengajuan sebelumnya masih ${openPlanStatus || "diproses"}. Tunggu sampai selesai sebelum ajukan lagi.`;
      alert(reason);
      return;
    }

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

        {profileError && (
          <div className="mb-4 rounded-md border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {profileError}
          </div>
        )}

        {(hasApprovedPlan || hasOpenPlan) && (
          <div className="mb-4 rounded-md border border-amber-400/60 bg-amber-100 px-4 py-3 text-sm text-amber-900">
            {hasApprovedPlan
              ? "Rencana studi semester ini sudah disetujui. Form dinonaktifkan."
              : `Pengajuan sebelumnya masih ${openPlanStatus || "diproses"}. Tunggu sampai dosen menindaklanjuti.`}
          </div>
        )}

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
              disabled={loadingProfile || hasApprovedPlan || hasOpenPlan}
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
              disabled={loadingProfile || hasApprovedPlan || hasOpenPlan}
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
              disabled={loadingProfile || hasApprovedPlan || hasOpenPlan}
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
            <button
              type="submit"
              disabled={hasApprovedPlan || hasOpenPlan}
              className={`w-full py-2 rounded-full font-semibold transition ${
                hasApprovedPlan || hasOpenPlan
                  ? 'bg-slate-600 text-slate-200 cursor-not-allowed'
                  : 'bg-[#FACC15] text-[#2D3A67] hover:bg-[#F97316]'
              }`}
            >
              {hasApprovedPlan
                ? 'Sudah Disetujui'
                : hasOpenPlan
                  ? (openPlanStatus === 'Tertunda' ? 'Sedang Ditinjau Dosen' : 'Menunggu Diproses')
                  : 'Submit Rencana Studi'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
