import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardDosen() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([
    {
      name: "Yesi Sukmawati",
      nim: "1301224570",
      submissionDate: "12/11/2025",
      status: "Tertunda",
      ipk: 3.89,
      totalSks: 102,
      interests: ["IoT", "Robotics", "Programming"],
      futureFocus: "startup",
      learningPreference: "project",
    },
    {
      name: "Jaya Saputra",
      nim: "1301225555",
      submissionDate: "10/11/2025",
      status: "Disetujui",
      ipk: 3.85,
      totalSks: 100,
      interests: ["IoT", "Robotics"],
      futureFocus: "industri",
      learningPreference: "konsep",
    },
    {
      name: "Dennis Rizky",
      nim: "1301221289",
      submissionDate: "10/11/2025",
      status: "Ditolak",
      ipk: 3.60,
      totalSks: 90,
      interests: ["Programming", "Networking"],
      futureFocus: "startup",
      learningPreference: "campuran",
    },
    {
      name: "Gagas Surya",
      nim: "1301223990",
      submissionDate: "10/11/2025",
      status: "Pending",
      ipk: 3.50,
      totalSks: 85,
      interests: ["Robotics", "Power System"],
      futureFocus: "s2",
      learningPreference: "project",
    },
  ]);

  // DATA BARU DARI FILE KIRI
  const [activeMenu, setActiveMenu] = useState("dashboard"); // dashboard | rencana-studi | riwayat | profil
  
  const [completedPlans, setCompletedPlans] = useState([
    { name: "Yesi Sukmawati", nim: "1301224570", date: "15/11/2025", jumlahMK: 5, totalSKS: 15 },
    { name: "Jaya Saputra", nim: "1301223555", date: "14/11/2025", jumlahMK: 4, totalSKS: 12 },
    { name: "Yesi Sukmawati", nim: "1301224570", date: "12/12/2025", jumlahMK: 5, totalSKS: 15 },
  ]);

  // popup detail state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  // verify popup state
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null);

  // processing fullscreen state
  const [processingActive, setProcessingActive] = useState(false);
  const [processingStudent, setProcessingStudent] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const initialSteps = [
    { id: 1, title: "Memuat Profil Mahasiswa", subtitle: "Menunggu", state: "pending" },
    { id: 2, title: "Mengambil Data Nilai Akademik", subtitle: "Menunggu", state: "pending" },
    { id: 3, title: "Memeriksa IP Semester Terakhir (IPS)", subtitle: "Menunggu", state: "pending" },
    { id: 4, title: "Hasil Pemeriksaan IPS", subtitle: "Menunggu", state: "pending" },
    { id: 5, title: "Pemeriksaan Selesai", subtitle: "Menunggu", state: "pending" },
  ];
  const [steps, setSteps] = useState(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingIntervalRef = useRef(null);
  const stepTimeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      stepTimeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // FUNGSI BARU DARI FILE KIRI
  function handleViewDetails(nim) {
    const st = students.find((s) => s.nim === nim);
    if (!st) return;

    const rencana = [
      { nama: "Matriks dan Ruang Vektor", sks: 3 },
      { nama: "Praktikum Elektronika", sks: 1 },
      { nama: "Fisika 3A", sks: 2 },
      { nama: "Pembangkit Energi Elektrik", sks: 3 },
      { nama: "Kalkulus", sks: 3 },
    ];
    const totalSKS = rencana.reduce((sum, m) => sum + m.sks, 0);

    setSelectedStudent({
      ...st,
      prodi: "S1 TEKNIK ELEKTRO",
      ipk: "3.89",
      jumlahMK: `${rencana.length} MK`,
      totalSKS: `${totalSKS} SKS`,
      rencana,
      note: "Informasi ini membantu sistem merekomendasikan rencana studi terbaik.",
    });
    setShowDetailPopup(true);
  }

  function handleViewCompletedPlanDetails(nim) {
    // Mock data untuk rencana yang sudah diselesaikan
    const plan = completedPlans.find((p) => p.nim === nim);
    if (!plan) return;

    const rencana = [
      { nama: "Matriks dan Ruang Vektor", sks: 3 },
      { nama: "Praktikum Elektronika", sks: 1 },
      { nama: "Fisika 3A", sks: 2 },
      { nama: "Pembangkit Energi Elektrik", sks: 3 },
      { nama: "Kalkulus", sks: 3 },
    ];

    setSelectedStudent({
      name: plan.name,
      nim: plan.nim,
      submissionDate: plan.date,
      status: "Disetujui",
      prodi: "S1 TEKNIK ELEKTRO",
      ipk: "3.89",
      jumlahMK: `${plan.jumlahMK} MK`,
      totalSKS: `${plan.totalSKS} SKS`,
      rencana,
      note: "Rencana studi ini telah diselesaikan.",
    });
    setShowDetailPopup(true);
  }

  function onPrepareApprove() {
    if (!selectedStudent) return;
    setVerifyAction("approve");
    setShowVerifyPopup(true);
  }

  function onPrepareReject() {
    if (!selectedStudent) return;
    setVerifyAction("reject");
    setShowVerifyPopup(true);
  }

  function onVerifyContinue() {
    if (!selectedStudent || !verifyAction) return;
    setShowVerifyPopup(false);
    setShowDetailPopup(false);
    setProcessingStudent(selectedStudent);
    setProcessingAction(verifyAction);
    startProcessingFlow(verifyAction, selectedStudent);
  }

  function startProcessingFlow(action, student) {
    setSteps(initialSteps.map((s) => ({ ...s, state: "pending", subtitle: "Menunggu" })));
    setCurrentStepIndex(-1);
    setLoadingProgress(0);
    setProcessingActive(true);

    const delays = [400, 600, 1200, 600, 400];
    let acc = 0;
    stepTimeoutsRef.current.forEach((t) => clearTimeout(t));
    stepTimeoutsRef.current = [];

    for (let i = 0; i < delays.length; i++) {
      acc += delays[i];
      const t = setTimeout(() => {
        setSteps((prev) => {
          const copy = prev.map((c) => ({ ...c }));
          if (i === 2) {
            copy[i].state = "processing";
            copy[i].subtitle = "Sedang Diproses...";
          } else {
            copy[i].state = "success";
            copy[i].subtitle = "Berhasil";
          }
          return copy;
        });
        setCurrentStepIndex(i);
      }, acc);
      stepTimeoutsRef.current.push(t);

      if (i === 2) {
        const t2 = setTimeout(() => {
          setSteps((prev) => {
            const copy = prev.map((c) => ({ ...c }));
            copy[2].state = "success";
            copy[2].subtitle = "Selesai";
            return copy;
          });
        }, acc + 700);
        stepTimeoutsRef.current.push(t2);
      }
    }

    const totalSimTime = delays.reduce((a, b) => a + b, 0) + 900;
    const startLoadingT = setTimeout(() => {
      const duration = 2200;
      const intervalMs = 40;
      const stepIncrement = (100 / duration) * intervalMs;
      let prog = 0;
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = setInterval(() => {
        prog += stepIncrement;
        if (prog >= 100) {
          prog = 100;
          clearInterval(loadingIntervalRef.current);
        }
        setLoadingProgress(Math.round(prog));
      }, intervalMs);

      const finishT = setTimeout(() => {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        setLoadingProgress(100);

        setStudents((prev) =>
          prev.map((s) =>
            s.nim === student.nim ? { ...s, status: action === "approve" ? "Disetujui" : "Ditolak" } : s
          )
        );

        const wrapUp = setTimeout(() => {
          setProcessingActive(false);
          setProcessingStudent(null);
          setProcessingAction(null);
          setLoadingProgress(0);
          setSteps(initialSteps.map((s) => ({ ...s, state: "pending", subtitle: "Menunggu" })));
          setCurrentStepIndex(-1);
          setSelectedStudent(null);
          setVerifyAction(null);
        }, 700);
        stepTimeoutsRef.current.push(wrapUp);
      }, duration + 300);
      stepTimeoutsRef.current.push(finishT);
    }, totalSimTime);
    stepTimeoutsRef.current.push(startLoadingT);
  }

  function cancelProcessingAndReturn() {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    stepTimeoutsRef.current.forEach((t) => clearTimeout(t));
    setProcessingActive(false);
    setProcessingStudent(null);
    setProcessingAction(null);
    setLoadingProgress(0);
    setSteps(initialSteps.map((s) => ({ ...s, state: "pending", subtitle: "Menunggu" })));
    setCurrentStepIndex(-1);
    setActiveMenu("dashboard");
  }

  // Processing screen
  if (processingActive && processingStudent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-start justify-start bg-gradient-to-b from-[#07102a] to-[#071a3a] text-white p-8">
        <button
          onClick={cancelProcessingAndReturn}
          className="mb-6 flex items-center gap-2 text-blue-200 hover:text-white transition"
        >
          <span className="text-xl">←</span>
          <span className="text-sm">Kembali ke Beranda</span>
        </button>

        <div className="w-full max-w-[980px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Memeriksa Data Akademik</h1>
            <p className="text-sm text-blue-200/80">
              Sistem akan memeriksa IPK, mata kuliah lulus, dan data akademik lainnya. Tunggu sebentar — ini otomatis.
            </p>
          </div>

          <div className="bg-[#0F2A55] rounded-2xl p-6 shadow-inner">
            <div className="space-y-5">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-start gap-4">
                  <div className="flex items-center flex-col">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        s.state === "success" ? "bg-green-400" : s.state === "processing" ? "bg-yellow-400" : "bg-slate-600"
                      }`}
                    >
                      {s.state === "success" ? "✓" : s.state === "processing" ? "•" : idx + 1}
                    </div>
                    {idx < steps.length - 1 && <div className="w-px bg-slate-700 mt-3" style={{ height: 80 }} />}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-yellow-300">{s.title}</div>
                    <div className="text-xs text-blue-100/80">{s.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div>
                <button
                  onClick={cancelProcessingAndReturn}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition"
                >
                  Batal
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[380px] bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${Math.max(2, loadingProgress)}%` }}
                  />
                </div>
                <div className="text-sm text-blue-100 w-12 text-right">{loadingProgress}%</div>
                <button className="px-4 py-2 rounded-lg bg-yellow-400 text-blue-900 font-semibold">Selanjutnya</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FUNGSI DARI FILE KANAN
  const handleLogout = () => {
    navigate("/login");
  };

  // Main layout
  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      {/* SIDEBAR - DIADAPTASI DARI FILE KIRI */}
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
                onClick={() => setActiveMenu("dashboard")}
                className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                  activeMenu === "dashboard" 
                    ? "bg-[#214A9A] shadow-md" 
                    : "text-slate-100/80 hover:bg-[#214A9A] transition"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${activeMenu === "dashboard" ? "bg-yellow-300" : "bg-slate-400"}`} />
                <span>Beranda</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveMenu("rencana-studi")}
                className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                  activeMenu === "rencana-studi" 
                    ? "bg-[#214A9A] shadow-md" 
                    : "text-slate-100/80 hover:bg-[#214A9A] transition"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${activeMenu === "rencana-studi" ? "bg-yellow-300" : "bg-slate-400"}`} />
                <span>Rencana Studi</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveMenu("riwayat")}
                className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                  activeMenu === "riwayat" 
                    ? "bg-[#214A9A] shadow-md" 
                    : "text-slate-100/80 hover:bg-[#214A9A] transition"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${activeMenu === "riwayat" ? "bg-yellow-300" : "bg-slate-400"}`} />
                <span>Riwayat</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveMenu("profil")}
                className={`w-full flex items-center gap-3 rounded-[999px] px-4 py-3 ${
                  activeMenu === "profil" 
                    ? "bg-[#214A9A] shadow-md" 
                    : "text-slate-100/80 hover:bg-[#214A9A] transition"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${activeMenu === "profil" ? "bg-yellow-300" : "bg-slate-400"}`} />
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
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              🌙
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* DASHBOARD DARI FILE KIRI */}
        {activeMenu === "dashboard" && (
          <>
            <header className="mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-300">Halo, <span className="font-semibold text-[#FBBF24]">John Doe</span></p>
              <h1 className="text-lg md:text-xl font-semibold mt-1">Pantau dan verifikasi rencana studi mahasiswa</h1>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Total Mahasiswa</p>
                <p className="mt-2 text-3xl font-bold">41</p>
              </div>
              <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Menunggu Validasi</p>
                <p className="mt-2 text-3xl font-bold">10</p>
              </div>
              <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Formulir Disetujui</p>
                <p className="mt-2 text-3xl font-bold">21</p>
              </div>
              <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Formulir Ditolak</p>
                <p className="mt-2 text-3xl font-bold">9</p>
              </div>
            </div>

            <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 mb-8">
              <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">i</span>
                <p className="text-sm font-semibold">Daftar mahasiswa yang Mengajukan Rencana Studi</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-xs md:text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr className="text-left">
                      <th className="px-4 py-2">Nama</th>
                      <th className="px-4 py-2">NIM</th>
                      <th className="px-4 py-2">Tanggal Pengajuan</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-4 py-2">{student.name}</td>
                        <td className="px-4 py-2">{student.nim}</td>
                        <td className="px-4 py-2">{student.submissionDate}</td>
                        <td className="px-4 py-2">
                          <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(student.status)}`}>{student.status}</span>
                        </td>
                        <td className="px-4 py-2">
                          <button className="text-blue-500 hover:underline" onClick={() => handleViewDetails(student.nim)}>Lihat Detail</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* RENCANA STUDI DARI FILE KIRI */}
        {activeMenu === "rencana-studi" && (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-semibold">Rencana Studi Mahasiswa</h1>
              <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Lihat daftar rencana studi yang sudah diselesaikan</p>
            </header>

            <section className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 mb-8">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <p className="text-base font-semibold">Daftar Rencana Studi yang Sudah Diselesaikan</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr className="text-left">
                      <th className="px-6 py-3 font-medium">Nama</th>
                      <th className="px-6 py-3 font-medium">NIM</th>
                      <th className="px-6 py-3 font-medium">Tanggal Dibuat</th>
                      <th className="px-6 py-3 font-medium">Jumlah MK</th>
                      <th className="px-6 py-3 font-medium">Total SKS</th>
                      <th className="px-6 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedPlans.map((plan, index) => (
                      <tr key={index} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4">{plan.name}</td>
                        <td className="px-6 py-4">{plan.nim}</td>
                        <td className="px-6 py-4">{plan.date}</td>
                        <td className="px-6 py-4">{plan.jumlahMK}</td>
                        <td className="px-6 py-4">{plan.totalSKS}</td>
                        <td className="px-6 py-4">
                          <button 
                            className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm hover:bg-[#2563EB] transition"
                            onClick={() => handleViewCompletedPlanDetails(plan.nim)}
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* MENU LAIN DARI FILE KIRI */}
        {activeMenu === "riwayat" && (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500 dark:text-slate-400">Halaman Riwayat - Coming Soon</p>
          </div>
        )}

        {activeMenu === "profil" && (
          <div className="text-center py-20">
            <p className="text-lg text-slate-500 dark:text-slate-400">Halaman Profil - Coming Soon</p>
          </div>
        )}
      </section>

      {/* POPUP DARI FILE KIRI */}
      {/* Detail Popup */}
      {showDetailPopup && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="relative w-full max-w-3xl rounded-3xl bg-gradient-to-br from-[#0A3B8A] to-[#0F57C5] text-white shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDetailPopup(false);
                setSelectedStudent(null);
              }}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">Detail Rencana Studi</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-100">Nama Mahasiswa</p>
                  <p className="font-semibold text-lg">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">NIM</p>
                  <p className="font-semibold text-lg">{selectedStudent.nim}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">Program Studi</p>
                  <p className="font-semibold">{selectedStudent.prodi}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">IPK</p>
                  <p className="font-semibold">{selectedStudent.ipk}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">Total SKS</p>
                  <p className="font-semibold">{selectedStudent.totalSKS}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">Jumlah Mata Kuliah</p>
                  <p className="font-semibold">{selectedStudent.jumlahMK}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-blue-100 mb-2">Minat & Fokus Karir</p>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.interests && selectedStudent.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm">
                  <span className="text-blue-100">Fokus Masa Depan:</span>{" "}
                  <span className="font-semibold capitalize">{selectedStudent.futureFocus}</span>
                </p>
              </div>

              <div>
                <p className="text-sm text-blue-100 mb-3">Rencana Mata Kuliah</p>
                <div className="bg-white/10 rounded-xl p-4 space-y-2">
                  {selectedStudent.rencana && selectedStudent.rencana.map((mk, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                      <span className="text-sm">{mk.nama}</span>
                      <span className="font-semibold">{mk.sks} SKS</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedStudent.note && (
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-blue-100/80">{selectedStudent.note}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={onPrepareReject}
                  className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition"
                >
                  Tolak
                </button>
                <button
                  onClick={onPrepareApprove}
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition"
                >
                  Setujui
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verify Popup */}
      {showVerifyPopup && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[60] p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
              {verifyAction === "approve" ? "Konfirmasi Persetujuan" : "Konfirmasi Penolakan"}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {verifyAction === "approve"
                ? `Apakah Anda yakin ingin menyetujui rencana studi ${selectedStudent.name}?`
                : `Apakah Anda yakin ingin menolak rencana studi ${selectedStudent.name}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowVerifyPopup(false);
                  setVerifyAction(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={onVerifyContinue}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  verifyAction === "approve"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  // Helper function for status badges
  function getStatusClass(status) {
    switch (status) {
      case "Disetujui":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "Ditolak":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "Tertunda":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Pending":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  }
}