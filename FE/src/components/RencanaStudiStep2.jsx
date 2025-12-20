// src/components/RencanaStudiStep2.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";
import { usePlanStore } from "../store/usePlanStore";
import { api } from "../api/api";

const DEFAULT_INTEREST_OPTIONS = [
  { value: "IoT", label: "IoT & Embedded Systems" },
  { value: "Robotics", label: "Robotika & Otomasi" },
  { value: "Programming", label: "Software Engineering & Programming" },
  { value: "Networking", label: "Telekomunikasi & Jaringan" },
  { value: "Power System", label: "Sistem Tenaga & Energi" },
];

const DEFAULT_FUTURE_FOCUS_OPTIONS = [
  { value: "s2", label: "S2 / Penelitian Lanjut" },
  { value: "industri", label: "Karir Profesional di Industri" },
  { value: "startup", label: "Bangun Startup / Wirausaha Teknologi" },
];

const DEFAULT_LEARNING_OPTIONS = [
  { value: "konsep", label: "Fokus pada Konsep & Analisis" },
  { value: "project", label: "Berbasis Proyek & Implementasi" },
  { value: "campuran", label: "Campuran (Teori & Praktik)" },
];

export default function RencanaStudiStep2() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  // ambil action dari store
  const { currentPlan, setStep2Data } = usePlanStore();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // === STATE UNTUK STEP 2 ===
  const [interestOptions, setInterestOptions] = useState(
    DEFAULT_INTEREST_OPTIONS
  );
  const [focusOptions, setFocusOptions] = useState(
    DEFAULT_FUTURE_FOCUS_OPTIONS
  );
  const [learningOptions, setLearningOptions] = useState(
    DEFAULT_LEARNING_OPTIONS
  );

  // State kosong - user harus pilih sendiri (prefill dari store jika ada)
  const [selectedInterests, setSelectedInterests] = useState(
    currentPlan?.interests ?? []
  );
  const [futureFocus, setFutureFocus] = useState(currentPlan?.futureFocus ?? "");
  const [learningPreference, setLearningPreference] = useState(
    currentPlan?.learningPreference ?? ""
  );
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");
  const hasApprovedPlan = Boolean(profileData?.has_approved_plan_current_semester);
  const hasOpenPlan = Boolean(profileData?.has_open_plan);

  useEffect(() => {
    setInterestOptions((options) => {
      const existing = new Set(options.map((opt) => opt.value));
      const additions = selectedInterests
        .filter((value) => value && !existing.has(value))
        .map((value) => ({ value, label: value }));

      if (!additions.length) {
        return options;
      }

      return [...options, ...additions];
    });
  }, [selectedInterests]);

  useEffect(() => {
    if (!futureFocus) return;
    setFocusOptions((options) => {
      if (options.some((opt) => opt.value === futureFocus)) {
        return options;
      }

      return [...options, { value: futureFocus, label: futureFocus }];
    });
  }, [futureFocus]);

  useEffect(() => {
    if (!learningPreference) return;
    setLearningOptions((options) => {
      if (options.some((opt) => opt.value === learningPreference)) {
        return options;
      }

      return [...options, { value: learningPreference, label: learningPreference }];
    });
  }, [learningPreference]);

  useEffect(() => {
    let isMounted = true;
    const planSnapshot = currentPlan;

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await api.mahasiswa.getProfile();
        if (!isMounted) return;

        const { mahasiswa, preference_options: options } = response;
        setProfileData(mahasiswa ?? null);

        if (options?.interests?.length) {
          setInterestOptions(options.interests);
        }
        if (options?.future_focus?.length) {
          setFocusOptions(options.future_focus);
        }
        if (options?.learning_preferences?.length) {
          setLearningOptions(options.learning_preferences);
        }

        if (!planSnapshot?.interests?.length && mahasiswa?.interests?.length) {
          setSelectedInterests(mahasiswa.interests.slice(0, 2));
        }

        if (!planSnapshot?.futureFocus && mahasiswa?.future_focus) {
          setFutureFocus(mahasiswa.future_focus);
        }

        if (!planSnapshot?.learningPreference && mahasiswa?.learning_preference) {
          setLearningPreference(mahasiswa.learning_preference);
        }

        setProfileError("");
      } catch (error) {
        if (!isMounted) return;
        console.error("Gagal memuat profil mahasiswa", error);
        setProfileError(error?.message || "Gagal memuat profil mahasiswa");
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleInterest = (option) => {
    setSelectedInterests((prev) => {
      if (prev.includes(option)) {
        // kalau sudah dipilih, klik lagi untuk unselect
        return prev.filter((item) => item !== option);
      }
        if (hasApprovedPlan || hasOpenPlan) {
          alert(hasApprovedPlan
            ? "Rencana studi semester ini sudah disetujui."
            : `Pengajuan sebelumnya masih ${profileData?.open_plan_status || "diproses"}. Tunggu sampai selesai.`);
          return;
        }
      // batasi maksimal 2
      if (prev.length >= 2) return prev;
      return [...prev, option];
    });
  };

  // SIMPAN DATA KE STORE & LANJUT STEP 3
  const handleNext = () => {
    if (hasApprovedPlan || hasOpenPlan) {
      alert(hasApprovedPlan
        ? "Rencana studi semester ini sudah disetujui."
        : `Pengajuan sebelumnya masih ${profileData?.open_plan_status || "diproses"}. Tunggu sampai selesai.`);
      return;
    }

    if (!selectedInterests.length) {
      alert("Pilih minimal satu bidang minat terlebih dahulu.");
      return;
    }

    if (!futureFocus) {
      alert("Pilih fokus setelah lulus terlebih dahulu.");
      return;
    }

    if (!learningPreference) {
      alert("Pilih gaya belajar terlebih dahulu.");
      return;
    }

    console.log("=== DEBUG STEP 2 HANDLE NEXT ===");
    console.log("selectedInterests:", selectedInterests);
    console.log("futureFocus:", futureFocus);
    console.log("learningPreference:", learningPreference);

    setStep2Data({
      interests: selectedInterests,
      futureFocus,
      learningPreference,
    });

    console.log("Navigating to step-3...");
    navigate("/rencana-studi/step-3");
  };

  const formatIpkValue = (value) => {
    if (value === null || value === undefined) {
      return loadingProfile ? "..." : "—";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "—";
    }

    return numeric.toFixed(2);
  };

  const formatNumberValue = (value) => {
    if (value === null || value === undefined) {
      return loadingProfile ? "..." : "—";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return "—";
    }

    return numeric;
  };

  const programStudi = profileData?.jurusan
    ? profileData.jurusan.toUpperCase()
    : "S1 TEKNIK ELEKTRO";
  const ipkDisplay = formatIpkValue(profileData?.ipk);
  const sksQuotaDisplay = formatNumberValue(
    profileData?.remaining_sks_semester ?? profileData?.max_sks_semester ?? profileData?.sks_semester_ini
  );
  const totalSksDisplay = formatNumberValue(profileData?.total_sks);
  const electiveSksDisplay = formatNumberValue(
    profileData?.sks_pilihan_maksimal
  );

  // helper class chip minat
  const chipClass = (active) =>
    [
      "px-5 py-2 rounded-full text-sm font-semibold border flex items-center gap-2",
      active
        ? "bg-[#FACC15] border-[#FACC15] text-slate-900 shadow-[0_6px_18px_rgba(248,181,0,0.55)]"
        : "bg-transparent border-white/40 text-white hover:bg-white/10",
    ].join(" ");

  // helper class radio
  const radioWrapperClass =
    "flex items-center gap-3 text-sm md:text-base text-white";

  const radioCircleClass = (active) =>
    [
      "h-4 w-4 rounded-full border-2 flex items-center justify-center",
      active ? "border-[#FACC15]" : "border-white/60",
    ].join(" ");

  const radioDotClass = "h-2.5 w-2.5 rounded-full bg-[#FACC15]";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#C5E0FF] via-[#E6F4FF] to-[#F5FAFF]
                 text-slate-900
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* SIDEBAR – sama seperti Dashboard / Step 1, Rencana Studi aktif */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full h-full rounded-3xl bg-[#0B3C9C] text-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between p-6">
          {/* Logo + menu */}
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-5 text-sm font-semibold">
              {/* Beranda (non-aktif) */}
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Beranda</span>
              </button>

              {/* Rencana Studi (AKTIF) */}
              <button
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition bg-[#214A9A] shadow-[0_10px_25px_rgba(15,23,42,0.45)]"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#FACC15]" />
                <span className="text-white">Rencana Studi</span>
              </button>

              {/* Riwayat (non-aktif) */}
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300/80" />
                <span className="text-slate-100/80">Riwayat</span>
              </button>

              {/* Profil (non-aktif) */}
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

          {/* Bawah: Keluar + toggle tema */}
          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
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

      {/* KONTEN STEP 2 */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Judul besar */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-snug">
            Waktunya Racik Jalur Kuliah Terbaik!
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-800 dark:text-slate-300">
            Bikin pilihan mata kuliah yang paling pas buat perjalananmu.
          </p>
        </header>

        {/* KARTU BIRU STEP 2 */}
        <div className="rounded-[32px] bg-[#0B3B91] text-white shadow-2xl border border-blue-300/50 px-8 py-8 md:px-10 md:py-9">
          {/* Step bar */}
          <div className="mb-7">
            <p className="text-sm md:text-base font-semibold mb-3">
              Step <span className="text-[#FACC15]">2</span> dari 3 - Data
              Akademik
            </p>

            {/* Progress line */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 rounded-full bg-blue-800 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/3 bg-[#FACC15]" />
              </div>

              {/* Bulatan step */}
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-[#FACC15] border-2 border-white shadow-md" />
                <span className="h-4 w-4 rounded-full bg-[#FACC15] border-2 border-white shadow-md" />
                <span className="h-4 w-4 rounded-full bg-blue-300/70 border-2 border-white/60" />
              </div>
            </div>
          </div>

          {/* Program studi + IPK + SKS */}
          <div className="space-y-6">
            {/* Program studi */}
            <div className="space-y-2">
              <p className="text-sm font-semibold">Program Studi</p>
              <input
                type="text"
                  value={programStudi}
                readOnly
                className="w-full rounded-lg bg-white text-slate-900 px-4 py-3 text-sm md:text-base shadow-inner focus:outline-none"
              />
            </div>

            {/* IPK / SKS / Total SKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  IPK
                </p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                    {ipkDisplay}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                    Kuota SKS Semester Ini
                </p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                    {sksQuotaDisplay}
                </div>
                 <p className="text-xs text-blue-100/70">
                   {loadingProfile
                     ? "Memuat informasi kuota SKS..."
                     : hasApprovedPlan
                     ? "Rencana studi semester ini sudah disetujui. Tidak dapat mengajukan ulang."
                     : profileData?.can_take_electives
                     ? `Sisa SKS pilihan tersedia: ${electiveSksDisplay}`
                     : "Belum memenuhi syarat untuk menambah mata kuliah pilihan."}
                 </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-blue-100">
                  TOTAL SKS
                </p>
                <div className="rounded-xl bg-blue-900/60 px-5 py-4 text-2xl font-bold">
                    {totalSksDisplay}
                </div>
              </div>
            </div>

              {profileError && (
                <div className="rounded-xl border border-red-400/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {profileError}
                </div>
              )}

            {/* Bidang yang diminati */}
            <div className="space-y-3 pt-2">
              <p className="text-sm md:text-base font-semibold">
                  Bidang yang Diminati (Pilih Maksimal 2)
              </p>
              <div className="flex flex-wrap gap-3">
                  {interestOptions.map((opt) => {
                    const active = selectedInterests.includes(opt.value);
                  return (
                    <button
                        key={opt.value}
                      type="button"
                        onClick={() => toggleInterest(opt.value)}
                      className={chipClass(active)}
                    >
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-slate-900" />
                      )}
                        <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
                <p className="text-xs text-blue-100/70">
                  *Pilih 1 atau 2 minat utama kamu agar rekomendasi lebih tepat.
                </p>
            </div>

            {/* Fokus setelah lulus */}
            <div className="space-y-3 pt-4">
              <p className="text-sm md:text-base font-semibold">
                Apa fokus Kamu setelah lulus?
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                  {focusOptions.map((option) => {
                    const active = futureFocus === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFutureFocus(option.value)}
                        className={radioWrapperClass}
                      >
                        <span className={radioCircleClass(active)}>
                          {active && <span className={radioDotClass} />}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Gaya belajar */}
            <div className="space-y-3 pt-4">
              <p className="text-sm md:text-base font-semibold">
                Kamu lebih nyaman belajar dengan pendekatan seperti apa?
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                  {learningOptions.map((option) => {
                    const active = learningPreference === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLearningPreference(option.value)}
                        className={radioWrapperClass}
                      >
                        <span className={radioCircleClass(active)}>
                          {active && <span className={radioDotClass} />}
                        </span>
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Teks info bawah */}
            <p className="mt-6 text-xs md:text-sm text-[#FACC15]">
              Informasi ini akan membantu sistem merekomendasikan rencana studi
              yang paling sesuai dengan arah dan minat kamu!
            </p>
          </div>
        </div>

        {/* Tombol Selanjutnya di kanan bawah */}
         <div className="mt-8 flex justify-end">
           <button
             type="button"
             onClick={handleNext}
             disabled={hasApprovedPlan || hasOpenPlan}
             className={`mt-4 rounded-full px-10 py-3 text-sm md:text-base font-semibold text-slate-900 shadow-[0_14px_36px_rgba(248,181,0,0.6)] transition ${
               hasApprovedPlan || hasOpenPlan
                 ? 'bg-slate-500 cursor-not-allowed opacity-70'
                 : 'bg-gradient-to-r from-[#FACC15] to-[#F97316] hover:brightness-105'
             }`}
           >
            {hasApprovedPlan
              ? 'Sudah Disetujui'
              : hasOpenPlan
                ? (profileData?.open_plan_status === 'Tertunda' ? 'Sedang Ditinjau Dosen' : 'Menunggu Diproses')
                : 'Selanjutnya'}
           </button>
         </div>
      </section>
    </main>
  );
}
