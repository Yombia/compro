import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlanStore } from "../store/usePlanStore"; // Import store zustand
import { useTheme } from "../hooks/useTheme"; // Import hook tema
import { api } from "../api/api"; // Import API

const DEFAULT_INTEREST_OPTIONS = [
  { value: "IoT", label: "IoT & Embedded Systems" },
  { value: "Robotics", label: "Robotika & Otomasi" },
  { value: "Programming", label: "Software Engineering & Programming" },
  { value: "Networking", label: "Telekomunikasi & Jaringan" },
  { value: "Power System", label: "Sistem Tenaga & Energi" },
];

const DEFAULT_FUTURE_FOCUS_OPTIONS = [
  { value: "s2", label: "Melanjutkan S2 / Riset" },
  { value: "industri", label: "Bekerja di Industri" },
  { value: "startup", label: "Membangun Start Up Teknologi" },
];

const DEFAULT_LEARNING_OPTIONS = [
  { value: "konsep", label: "Konsep & Analisis" },
  { value: "project", label: "Proyek & Implementasi" },
  { value: "campuran", label: "Campuran" },
];

const normalizeOptions = (list, fallback) => {
  if (!Array.isArray(list) || !list.length) {
    return fallback;
  }

  const normalized = list
    .map((item) => {
      if (typeof item === "string") {
        return { value: item, label: item };
      }

      if (item && typeof item === "object") {
        const value =
          item.value ?? item.id ?? (typeof item.label === "string" ? item.label : "");
        const label = item.label ?? value;

        if (value === undefined || value === null || value === "") {
          return null;
        }

        return {
          value: String(value),
          label: typeof label === "string" ? label : String(value),
        };
      }

      return null;
    })
    .filter(Boolean);

  return normalized.length ? normalized : fallback;
};

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

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [interestOptions, setInterestOptions] = useState(
    DEFAULT_INTEREST_OPTIONS
  );
  const [focusOptions, setFocusOptions] = useState(
    DEFAULT_FUTURE_FOCUS_OPTIONS
  );
  const [learningOptions, setLearningOptions] = useState(
    DEFAULT_LEARNING_OPTIONS
  );
  const [profileMeta, setProfileMeta] = useState({
    electiveSks: 0,
    canTakeElectives: false,
    hasApprovedPlan: false,
    hasOpenPlan: false,
    openPlanStatus: "",
  });

  // Fetch data mahasiswa dari backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.mahasiswa.getProfile();
        const { mahasiswa: mhs, preference_options: options } = response;

        setInterestOptions(
          normalizeOptions(options?.interests, DEFAULT_INTEREST_OPTIONS)
        );
        setFocusOptions(
          normalizeOptions(options?.future_focus, DEFAULT_FUTURE_FOCUS_OPTIONS)
        );
        setLearningOptions(
          normalizeOptions(options?.learning_preferences, DEFAULT_LEARNING_OPTIONS)
        );

        const ipkValue =
          typeof mhs?.ipk === "number"
            ? mhs.ipk.toFixed(2)
            : mhs?.ipk
            ? String(mhs.ipk)
            : "";
        const maxSksValue =
          mhs?.remaining_sks_semester ?? mhs?.max_sks_semester ?? mhs?.sks_semester_ini ?? "";
        const totalSksValue = mhs?.total_sks ?? "";
        const interestsValue = Array.isArray(mhs?.interests)
          ? mhs.interests.slice(0, 2)
          : [];
        const futureFocusValue = mhs?.future_focus ?? "";
        const learningPrefValue = mhs?.learning_preference ?? "";

        setFormData((prev) => ({
          ...prev,
          ipk: ipkValue,
          sks:
            maxSksValue !== "" && maxSksValue !== null
              ? String(maxSksValue)
              : "",
          totalSks:
            totalSksValue !== "" && totalSksValue !== null
              ? String(totalSksValue)
              : "",
          interests: interestsValue,
          futureFocus: futureFocusValue,
          learningPreference: learningPrefValue,
        }));

        setProfileMeta({
          electiveSks: mhs?.sks_pilihan_maksimal ?? 0,
          canTakeElectives: Boolean(mhs?.can_take_electives),
          hasApprovedPlan: Boolean(mhs?.has_approved_plan_current_semester),
          hasOpenPlan: Boolean(mhs?.has_open_plan),
          openPlanStatus: mhs?.open_plan_status ?? "",
        });

        setFetchError("");
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setFetchError(error?.message || "Gagal mengambil data profil");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!formData.interests.length) return;
    setInterestOptions((existing) => {
      const mapped = new Map(existing.map((option) => [option.value, option]));
      let mutated = false;

      formData.interests.forEach((value) => {
        if (!mapped.has(value)) {
          mapped.set(value, { value, label: value });
          mutated = true;
        }
      });

      return mutated ? Array.from(mapped.values()) : existing;
    });
  }, [formData.interests]);

  useEffect(() => {
    if (!formData.futureFocus) return;
    setFocusOptions((existing) => {
      if (existing.some((option) => option.value === formData.futureFocus)) {
        return existing;
      }

      return [...existing, { value: formData.futureFocus, label: formData.futureFocus }];
    });
  }, [formData.futureFocus]);

  useEffect(() => {
    if (!formData.learningPreference) return;
    setLearningOptions((existing) => {
      if (existing.some((option) => option.value === formData.learningPreference)) {
        return existing;
      }

      return [
        ...existing,
        { value: formData.learningPreference, label: formData.learningPreference },
      ];
    });
  }, [formData.learningPreference]);

  // Handle submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (profileMeta.hasApprovedPlan || profileMeta.hasOpenPlan) {
      const reason = profileMeta.hasApprovedPlan
        ? "Rencana studi semester ini sudah disetujui."
        : `Pengajuan sebelumnya masih ${profileMeta.openPlanStatus || "diproses"}. Tunggu sampai selesai sebelum mengajukan lagi.`;
      alert(reason);
      return;
    }
    
    try {
      setStep2Data({
        interests: formData.interests,
        futureFocus: formData.futureFocus,
        learningPreference: formData.learningPreference,
      });
      await submitCurrentPlan();    // Submit ke backend (async)
      navigate("/riwayat");   // Arahkan ke riwayat setelah berhasil
    } catch (error) {
      // Error sudah di-handle di submitCurrentPlan
      console.error("Submit error:", error);
    }
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

  const isInterestDisabled = (value) =>
    formData.interests.length >= 2 && !formData.interests.includes(value);

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

        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-200">
            {fetchError}
          </div>
        )}

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
              disabled={loading}
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
          </div>

          {/* 2. SKS (READ ONLY) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Kuota SKS Semester Ini</label>
            <input
              type="text"
              name="sks"
              value={formData.sks}
              readOnly
              disabled={loading}
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {loading
                ? "Menghitung kuota SKS yang tersedia..."
                : profileMeta.canTakeElectives
                ? `Sisa SKS pilihan yang masih bisa diambil: ${profileMeta.electiveSks}`
                : "Saat ini kamu belum memenuhi syarat untuk menambah mata kuliah pilihan."}
            </p>
          </div>

          {/* 3. TOTAL SKS (READ ONLY) */}
          <div>
            <label className="block text-sm font-semibold mb-1">Total SKS Kumulatif (Terintegrasi)</label>
            <input
              type="text"
              name="totalSks"
              value={formData.totalSks}
              readOnly
              disabled={loading}
              className="w-full p-2 rounded-md border border-gray-300 bg-slate-200 text-slate-600 
                         cursor-not-allowed focus:outline-none 
                         dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400"
            />
          </div>

          {/* 4. BIDANG MINAT (EDITABLE - Limit 2) */}
          <div>
            <label className="block text-sm font-semibold mb-2">Bidang yang diminati (Pilih Maksimal 2)</label>
            <div className="flex flex-col space-y-2 p-3 border border-slate-300 rounded-md bg-white/50 dark:bg-slate-900/50 dark:border-slate-700">
              {interestOptions.map((option) => {
                const checked = formData.interests.includes(option.value);
                const disabled = loading || isInterestDisabled(option.value);
                return (
                  <label
                    key={option.value}
                    className="inline-flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={checked}
                      onChange={handleInterestChange}
                      disabled={disabled}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                    />
                    <span className={disabled && !checked ? "text-slate-400" : ""}>
                      {option.label}
                    </span>
                  </label>
                );
              })}
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
              disabled={loading}
            >
              <option value="" disabled className="dark:text-slate-400">-- Pilih Fokus --</option>
              {focusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="dark:bg-slate-800 dark:text-slate-50"
                >
                  {option.label}
                </option>
              ))}
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
              disabled={loading}
            >
              <option value="" disabled className="dark:text-slate-400">-- Pilih Preferensi --</option>
              {learningOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="dark:bg-slate-800 dark:text-slate-50"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8">
            <button 
              type="submit" 
              className={`w-full py-3 rounded-full font-bold shadow-lg transition-all ${
                loading || profileMeta.hasApprovedPlan || profileMeta.hasOpenPlan
                  ? 'bg-slate-600 text-slate-200 cursor-not-allowed'
                  : 'bg-[#FACC15] text-[#2D3A67] hover:bg-[#F97316] hover:scale-[1.01]'
              }`}
              disabled={loading || profileMeta.hasApprovedPlan || profileMeta.hasOpenPlan}
            >
                {profileMeta.hasApprovedPlan
                  ? "Sudah Disetujui"
                  : profileMeta.hasOpenPlan
                    ? (profileMeta.openPlanStatus === "Tertunda" ? "Sedang Ditinjau Dosen" : "Menunggu Diproses")
                    : "Submit Rencana Studi"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}