import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useTheme } from "../context/ThemeContext";

export default function DashboardDosen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dosenProfile, setDosenProfile] = useState(null);

  // Fetch data mahasiswa saat component mount
  useEffect(() => {
    fetchDosenProfile();
    fetchMahasiswaData();
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
      if (logAnimationTimeoutRef.current) {
        clearTimeout(logAnimationTimeoutRef.current);
      }
      if (finalizeTimeoutRef.current) {
        clearTimeout(finalizeTimeoutRef.current);
      }
      stepTimeoutsRef.current.forEach(t => clearTimeout(t));
      animationQueueRef.current = [];
      processedLogsRef.current = [];
      setProcessingError(null);
    };
  }, []);

  const fetchDosenProfile = async () => {
    try {
      const response = await api.dosen.getProfile();
      setDosenProfile(response.dosen);
    } catch (error) {
      console.error('Error fetching dosen profile:', error);
    }
  };

  const fetchMahasiswaData = async (force = false) => {
    try {
      setLoading(true);
      const response = await api.dosen.getMahasiswa({ force });
      setStudents(response.students || []);
    } catch (error) {
      console.error('Error fetching mahasiswa:', error);
    } finally {
      setLoading(false);
    }
  };

  // popup detail state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailPopup, setShowDetailPopup] = useState(false);

  // verify popup state
  const [showVerifyPopup, setShowVerifyPopup] = useState(false);
  const [verifyAction, setVerifyAction] = useState(null);

  // review form state (setelah generate AI selesai)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewStudent, setReviewStudent] = useState(null);
  const [reviewMataKuliah, setReviewMataKuliah] = useState([]);
  const [allMataKuliah, setAllMataKuliah] = useState([]);
  const [reviewCatatan, setReviewCatatan] = useState('');
  const [selectedMKToAdd, setSelectedMKToAdd] = useState('');
  
  // detail popup catatan state
  const [editingCatatan, setEditingCatatan] = useState(false);
  const [catatanDosen, setCatatanDosen] = useState('');

  // processing fullscreen state
  const [processingActive, setProcessingActive] = useState(false);
  const [processingStudent, setProcessingStudent] = useState(null);
  const [processingAction, setProcessingAction] = useState(null); // "approve" | "reject" | "generate"
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [processingError, setProcessingError] = useState(null);
  
  const initialSteps = [
    { label: "Validasi Data", state: "pending", subtitle: "Menunggu" },
    { label: "Cek Kelengkapan", state: "pending", subtitle: "Menunggu" },
    { label: "Proses Rekomendasi AI", state: "pending", subtitle: "Menunggu" },
    { label: "Finalisasi", state: "pending", subtitle: "Menunggu" },
    { label: "Simpan Hasil", state: "pending", subtitle: "Menunggu" },
  ];
  const [steps, setSteps] = useState(initialSteps);
  const [statusLogs, setStatusLogs] = useState([]);
  
  const stepTimeoutsRef = useRef([]);
  const loadingIntervalRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const currentStepRef = useRef(-1);
  const isTransitioningRef = useRef(false);
  const loadingProgressRef = useRef(0);
  const processedLogsRef = useRef([]);
  const animationQueueRef = useRef([]);
  const logAnimationTimeoutRef = useRef(null);
  const finalizeTimeoutRef = useRef(null);
  const generationCompletedRef = useRef(false);

  function updateLoadingProgress(value) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    loadingProgressRef.current = clamped;
    setLoadingProgress(clamped);
  }

  function clearAllTimers() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }
    if (logAnimationTimeoutRef.current) {
      clearTimeout(logAnimationTimeoutRef.current);
      logAnimationTimeoutRef.current = null;
    }
    if (finalizeTimeoutRef.current) {
      clearTimeout(finalizeTimeoutRef.current);
      finalizeTimeoutRef.current = null;
    }
    stepTimeoutsRef.current.forEach((t) => clearTimeout(t));
    stepTimeoutsRef.current = [];
  }

  function resetAnimationState({ resetSteps = false, resetLogs = false, resetTransitionFlag = true } = {}) {
    animationQueueRef.current = [];
    processedLogsRef.current = [];
    generationCompletedRef.current = false;
    currentStepRef.current = -1;
    if (resetTransitionFlag) {
      isTransitioningRef.current = false;
    }
    updateLoadingProgress(0);

    if (resetSteps) {
      setSteps(initialSteps.map((s) => ({ ...s, state: "pending", subtitle: "Menunggu" })));
      setCurrentStepIndex(-1);
    }

    if (resetLogs) {
      setStatusLogs([]);
    }
  }

  function animateProgressTo(target, duration = 600) {
    const clampedTarget = Math.max(0, Math.min(100, Math.round(target)));
    if (clampedTarget <= loadingProgressRef.current) {
      updateLoadingProgress(clampedTarget);
      return;
    }

    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
      loadingIntervalRef.current = null;
    }

    const start = loadingProgressRef.current;
    const delta = clampedTarget - start;
    const startTime = Date.now();

    loadingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressRatio = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      const value = Math.round(start + delta * progressRatio);
      updateLoadingProgress(value);

      if (progressRatio >= 1) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }, 40);
  }

  function applyLogEntry(logEntry, student) {
    const stepsCount = initialSteps.length;
    const numericStep = Number(logEntry?.step);
    const hasNumericStep = Number.isFinite(numericStep);

    let activeIndex;

    if (hasNumericStep) {
      if (numericStep >= stepsCount) {
        activeIndex = stepsCount;
      } else {
        activeIndex = Math.max(0, numericStep);
      }
    } else {
      activeIndex = Math.min(currentStepRef.current + 1, stepsCount);
    }

    if (activeIndex >= stepsCount) {
      currentStepRef.current = stepsCount;
      setCurrentStepIndex(stepsCount);
      setSteps(initialSteps.map((s) => ({ ...s, state: "success", subtitle: "Selesai" })));
      animateProgressTo(100, 500);

      if (!finalizeTimeoutRef.current) {
        finalizeTimeoutRef.current = setTimeout(() => {
          transitionToReview(student);
        }, 900);
      }

      return;
    }

    currentStepRef.current = activeIndex;
    setCurrentStepIndex(activeIndex);

    const updatedSteps = initialSteps.map((step, index) => {
      if (index < activeIndex) {
        return { ...step, state: "success", subtitle: "Selesai" };
      }
      if (index === activeIndex) {
        return {
          ...step,
          state: "processing",
          subtitle: logEntry?.message || "Sedang diproses...",
        };
      }
      return { ...step, state: "pending", subtitle: "Menunggu" };
    });

    setSteps(updatedSteps);

    const baseProgress = Math.round((activeIndex / stepsCount) * 100);
    animateProgressTo(Math.max(baseProgress, loadingProgressRef.current), 600);
  }

  async function handleViewDetails(nim) {
    const st = students.find((s) => s.nim === nim);
    if (!st) return;

    if (!st.rencana_studi_id) {
      alert('Mahasiswa belum memiliki rencana studi');
      return;
    }

    try {
      const response = await api.dosen.getDetailRencanaStudi(st.rencana_studi_id);
      const detail = response.rencana_studi;

      setSelectedStudent({
        ...st,
        prodi: detail.mahasiswa.prodi,
        ipk: detail.mahasiswa.ipk.toString(),
        jumlahMK: `${detail.jumlah_mk} MK`,
        totalSKS: `${detail.total_sks} SKS`,
        rencana: detail.mata_kuliah,
        note: "Informasi ini membantu sistem merekomendasikan rencana studi terbaik.",
        rencana_studi_id: st.rencana_studi_id,
      });
      console.log('Detail mata kuliah:', detail.mata_kuliah);
      console.log('Tingkat kecocokan check:', detail.mata_kuliah?.map(mk => ({ nama: mk.nama, tingkat: mk.tingkat_kecocokan })));
      setCatatanDosen(detail.catatan || '');
      setEditingCatatan(false);
      setShowDetailPopup(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('Gagal mengambil detail rencana studi');
    }
  }

  async function handleViewCompletedPlanDetails(id) {
    try {
      const response = await api.dosen.getDetailRencanaStudi(id);
      const detail = response.rencana_studi;

      setSelectedStudent({
        name: detail.mahasiswa.nama,
        nim: detail.mahasiswa.nim,
        submissionDate: detail.tanggal_pengajuan,
        status: detail.status,
        prodi: detail.mahasiswa.prodi,
        ipk: detail.mahasiswa.ipk.toString(),
        jumlahMK: `${detail.jumlah_mk} MK`,
        totalSKS: `${detail.total_sks} SKS`,
        rencana: detail.mata_kuliah,
        note: "Rencana studi ini telah diselesaikan.",
        rencana_studi_id: id,
      });
      setShowDetailPopup(true);
    } catch (error) {
      console.error('Error fetching completed plan detail:', error);
    }
  }

  async function handleViewDetails(nim) {
    const st = students.find((s) => s.nim === nim);
    if (!st) return;

    if (!st.rencana_studi_id) {
      alert('Mahasiswa belum memiliki rencana studi');
      return;
    }

    try {
      const response = await api.dosen.getDetailRencanaStudi(st.rencana_studi_id);
      const detail = response.rencana_studi;

      setSelectedStudent({
        ...st,
        prodi: detail.mahasiswa.prodi,
        ipk: detail.mahasiswa.ipk.toString(),
        jumlahMK: `${detail.jumlah_mk} MK`,
        totalSKS: `${detail.total_sks} SKS`,
        rencana: detail.mata_kuliah,
        note: "Informasi ini membantu sistem merekomendasikan rencana studi terbaik.",
        rencana_studi_id: st.rencana_studi_id,
      });
      console.log('Detail mata kuliah:', detail.mata_kuliah);
      console.log('Tingkat kecocokan check:', detail.mata_kuliah?.map(mk => ({ nama: mk.nama, tingkat: mk.tingkat_kecocokan })));
      setCatatanDosen(detail.catatan || '');
      setEditingCatatan(false);
      setShowDetailPopup(true);
    } catch (error) {
      console.error('Error fetching detail:', error);
      alert('Gagal mengambil detail rencana studi');
    }
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
    
    if (verifyAction === "reject") {
      // Untuk reject, langsung proses
      startProcessingFlow(verifyAction, selectedStudent);
    } else if (verifyAction === "approve") {
      // Jika approve, cek apakah sudah ada mata kuliah
      if (!selectedStudent.rencana || selectedStudent.rencana.length === 0) {
        // Belum ada MK → generate AI dulu
        startGenerateAndApproveFlow(selectedStudent);
      } else {
        // Sudah ada MK (status Tertunda) → langsung tampilkan review form
        showReviewFormDirectly(selectedStudent);
      }
    }
  }

  async function showReviewFormDirectly(student) {
    try {
      // Fetch detail rencana studi untuk get mata kuliah
      const detailResponse = await api.dosen.getDetailRencanaStudi(student.rencana_studi_id);
      const mataKuliahHasil = detailResponse.rencana_studi.mata_kuliah || [];
      
      // Fetch all mata kuliah untuk dropdown
      const allMKResponse = await api.dosen.getAllMataKuliah();
      
      // Show review form
      setReviewStudent(student);
      setReviewMataKuliah(mataKuliahHasil.map(mk => ({
        kode_mk: mk.kode_mk || '',
        nama: mk.nama,
        sks: mk.sks,
        alasan: mk.alasan || '',
        tingkat_kecocokan: mk.tingkat_kecocokan || null
      })));
      setAllMataKuliah(allMKResponse.mata_kuliah || []);
      setReviewCatatan('');
      setShowReviewForm(true);
      
      console.log("Review form displayed for Tertunda status");
    } catch (error) {
      console.error("Error loading review data:", error);
    }
  }

  async function transitionToReview(student) {
    if (!student || isTransitioningRef.current) {
      return;
    }

    isTransitioningRef.current = true;
    clearAllTimers();

    try {
      const detailResponse = await api.dosen.getDetailRencanaStudi(student.rencana_studi_id);
      const mataKuliahHasil = detailResponse.rencana_studi.mata_kuliah || [];
      const allMKResponse = await api.dosen.getAllMataKuliah();

      setProcessingError(null);
      setProcessingActive(false);
      setProcessingStudent(null);
      setProcessingAction(null);
      setStatusLogs([]);
      setSteps(initialSteps.map((s) => ({ ...s, state: "pending", subtitle: "Menunggu" })));
      setCurrentStepIndex(-1);

      setReviewStudent(student);
      setReviewMataKuliah(mataKuliahHasil.map((mk) => ({
        kode_mk: mk.kode_mk || '',
        nama: mk.nama,
        sks: mk.sks,
        alasan: mk.alasan || '',
        tingkat_kecocokan: mk.tingkat_kecocokan || null,
      })));
      setAllMataKuliah(allMKResponse.mata_kuliah || []);
      setReviewCatatan('');
      setShowReviewForm(true);

      console.log("Review form displayed");
    } catch (error) {
      console.error("Error loading review data:", error);
      alert('Gagal memuat data review, silakan coba lagi.');
      setProcessingActive(false);
      setProcessingStudent(null);
      setProcessingAction(null);
    } finally {
      clearAllTimers();
      resetAnimationState({ resetSteps: true, resetLogs: true });
      finalizeTimeoutRef.current = null;
    }
  }

  async function startGenerateAndApproveFlow(student) {
    clearAllTimers();
    resetAnimationState({ resetSteps: true, resetLogs: true });
    finalizeTimeoutRef.current = null;
    setProcessingError(null);

    setProcessingStudent(student);
    setProcessingAction("generate");
    setProcessingActive(true);

    setSteps(initialSteps.map((step, index) =>
      index === 0
        ? { ...step, state: "processing", subtitle: "Menunggu status awal..." }
        : { ...step, state: "pending", subtitle: "Menunggu" }
    ));
    setCurrentStepIndex(0);
    currentStepRef.current = 0;

    const stepsCount = initialSteps.length;

    const playNextFromQueue = () => {
      if (animationQueueRef.current.length === 0) {
        logAnimationTimeoutRef.current = null;
        return;
      }

      const nextLog = animationQueueRef.current.shift();
      processedLogsRef.current.push(nextLog);
      applyLogEntry(nextLog, student);

      logAnimationTimeoutRef.current = setTimeout(playNextFromQueue, 650);
    };

    const enqueueLogs = (logsList = []) => {
      if (!Array.isArray(logsList) || logsList.length === 0) {
        return;
      }

      const alreadyCount = processedLogsRef.current.length + animationQueueRef.current.length;
      if (logsList.length <= alreadyCount) {
        return;
      }

      const newLogs = logsList.slice(alreadyCount);
      animationQueueRef.current.push(...newLogs);

      if (!logAnimationTimeoutRef.current) {
        playNextFromQueue();
      }
    };

    try {
      const response = await api.dosen.generateRekomendasi(student.rencana_studi_id);
      const sessionId = response.session_id;

      console.log("Generate started, Session ID:", sessionId);

      const initialLogs = Array.isArray(response.status_logs) ? response.status_logs : [];
      setStatusLogs(initialLogs);
      enqueueLogs(initialLogs);

      generationCompletedRef.current = initialLogs.some((entry) => Number(entry?.step) >= stepsCount);

      let pollCount = 0;
      const maxPolls = 120;

      if (!generationCompletedRef.current) {
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const statusResponse = await api.dosen.getRecommendationStatus(sessionId);
            const logs = statusResponse.logs || [];

            pollCount += 1;
            const hasFinalLog = logs.some((entry) => Number(entry?.step) >= stepsCount);
            generationCompletedRef.current = Boolean(statusResponse.completed) || hasFinalLog;

            console.log("Polling response:", { logs, completed: statusResponse.completed });

            setStatusLogs(logs);
            enqueueLogs(logs);

            if (generationCompletedRef.current && pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            if (!generationCompletedRef.current && pollCount >= maxPolls) {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
              }
              console.error("Polling timeout");
              clearAllTimers();
              setProcessingActive(false);
              setProcessingStudent(null);
              setProcessingAction(null);
              resetAnimationState({ resetSteps: true, resetLogs: true });
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Generate AI error:", error);
      clearAllTimers();
      resetAnimationState({ resetSteps: false, resetLogs: true });

      const fallbackMessage = 'Gagal menghasilkan rekomendasi AI. Periksa koneksi atau coba lagi beberapa saat lagi.';
      const message = error?.message ? `Gagal menghasilkan rekomendasi: ${error.message}` : fallbackMessage;
      setProcessingError(message);
      setProcessingActive(true);
      setProcessingAction("generate");

      setSteps(initialSteps.map((step, index) => (
        index === 0
          ? { ...step, state: "error", subtitle: message }
          : { ...step, state: "pending", subtitle: "Menunggu" }
      )));
      setCurrentStepIndex(-1);
    }
  }

  async function startProcessingFlow(action, student) {
    clearAllTimers();
    resetAnimationState({ resetSteps: true, resetLogs: true });
    setProcessingError(null);

    setProcessingStudent(student);
    setProcessingAction(action);
    setProcessingActive(true);

    const delays = [400, 600, 1200, 600, 400];
    let acc = 0;

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
        updateLoadingProgress(Math.round(prog));
      }, intervalMs);

      const finishT = setTimeout(async () => {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
        updateLoadingProgress(100);

        // Call backend API
        try {
          if (action === "approve") {
            await api.dosen.setujuiRencanaStudi(student.rencana_studi_id);
          } else {
            await api.dosen.tolakRencanaStudi(student.rencana_studi_id);
          }

          // Update local state
          setStudents((prev) =>
            prev.map((s) =>
              s.nim === student.nim ? { ...s, status: action === "approve" ? "Disetujui" : "Ditolak" } : s
            )
          );

          // Refresh data mahasiswa agar daftar memperbarui status
          await fetchMahasiswaData(true);
        } catch (error) {
          console.error('Error updating rencana studi:', error);
        }

        const wrapUp = setTimeout(() => {
          setProcessingActive(false);
          setProcessingStudent(null);
          setProcessingAction(null);
          resetAnimationState({ resetSteps: true, resetLogs: true });
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
    clearAllTimers();
    resetAnimationState({ resetSteps: true, resetLogs: true });
    setProcessingError(null);
    setProcessingActive(false);
    setProcessingStudent(null);
    setProcessingAction(null);
  }

  // Review form handlers
  function handleRemoveMK(index) {
    setReviewMataKuliah(prev => prev.filter((_, idx) => idx !== index));
  }

  function handleAddMK() {
    if (!selectedMKToAdd) return;
    
    const mkToAdd = allMataKuliah.find(mk => mk.id.toString() === selectedMKToAdd);
    if (!mkToAdd) return;
    
    // Check if already added
    const alreadyExists = reviewMataKuliah.some(mk => mk.kode_mk === mkToAdd.kode_mk);
    if (alreadyExists) {
      alert('Mata kuliah sudah ditambahkan');
      return;
    }
    
    setReviewMataKuliah(prev => [...prev, {
      kode_mk: mkToAdd.kode_mk,
      nama: mkToAdd.nama_mk,
      sks: mkToAdd.sks,
      alasan: null,
      tingkat_kecocokan: null
    }]);
    setSelectedMKToAdd('');
  }

  function handleUpdateTingkatKecocokan(index, value) {
    setReviewMataKuliah(prev => prev.map((mk, idx) => {
      if (idx !== index) return mk;

      if (value === '') {
        return { ...mk, tingkat_kecocokan: null };
      }

      const numericValue = Number(value);
      if (Number.isNaN(numericValue)) {
        return mk;
      }

      const clamped = Math.max(0, Math.min(100, Math.round(numericValue)));
      return { ...mk, tingkat_kecocokan: clamped };
    }));
  }

  async function handleSaveRencanaStudi() {
    if (reviewMataKuliah.length === 0) {
      alert('Minimal harus ada 1 mata kuliah');
      return;
    }

    try {
      // Update mata kuliah
      await api.dosen.updateMataKuliah(
        reviewStudent.rencana_studi_id,
        reviewMataKuliah,
        reviewCatatan || null
      );

      // Approve rencana studi
      await api.dosen.setujuiRencanaStudi(reviewStudent.rencana_studi_id, reviewCatatan || null);

      // Refresh data mahasiswa agar status terbaru muncul
      await fetchMahasiswaData(true);

      // Close review form
      setShowReviewForm(false);
      setReviewStudent(null);
      setReviewMataKuliah([]);
      setReviewCatatan('');
      setAllMataKuliah([]);

      console.log('Rencana studi berhasil disimpan dan disetujui');
    } catch (error) {
      console.error('Error saving rencana studi:', error);
      alert('Gagal menyimpan rencana studi: ' + error.message);
    }
  }

  async function handleCancelReview() {
    // Konfirmasi sebelum cancel
    const confirm = window.confirm('Apakah Anda yakin ingin membatalkan review ini? Status akan berubah menjadi Ditolak.');
    
    if (!confirm) return;

    try {
      // Cancel di backend
      if (reviewStudent && reviewStudent.rencanaStudiId) {
        await api.dosen.cancelRencanaStudi(reviewStudent.rencanaStudiId);
        console.log('Rencana studi berhasil dibatalkan');
      }

      // Reset state
      setShowReviewForm(false);
      setReviewStudent(null);
      setReviewMataKuliah([]);
      setReviewCatatan('');
      setAllMataKuliah([]);

      // Refresh data mahasiswa
      await fetchMahasiswaData(true);
    } catch (error) {
      console.error('Error canceling review:', error);
      alert('Gagal membatalkan review: ' + error.message);
    }
  }

  // Review form screen (setelah AI generate selesai)
  if (showReviewForm && reviewStudent) {
    const totalSKS = reviewMataKuliah.reduce((sum, mk) => sum + mk.sks, 0);

    return (
      <div className="min-h-screen w-full flex flex-col items-start justify-start bg-gradient-to-b from-[#07102a] to-[#071a3a] text-white p-8">
        <button
          onClick={handleCancelReview}
          className="mb-6 flex items-center gap-2 text-blue-200 hover:text-white transition"
        >
          <span className="text-xl">←</span>
          <span className="text-sm">Kembali</span>
        </button>

        <div className="w-full max-w-[1000px] mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Review Rekomendasi AI</h1>
            <p className="text-sm text-blue-200/80 mt-1">
              Hasil rekomendasi AI untuk <span className="font-semibold">{reviewStudent.name}</span>. 
              Anda dapat mengedit, menambah, atau menghapus mata kuliah sebelum menyimpan.
            </p>
          </div>

          <div className="bg-[#0F2A55] rounded-2xl p-6 shadow-inner space-y-6">
            {/* Info mahasiswa */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-white/10">
              <div>
                <p className="text-xs text-blue-200/70">NIM</p>
                <p className="font-semibold">{reviewStudent.nim}</p>
              </div>
              <div>
                <p className="text-xs text-blue-200/70">Total SKS</p>
                <p className="font-semibold text-yellow-400">{totalSKS} SKS</p>
              </div>
              <div>
                <p className="text-xs text-blue-200/70">Jumlah MK</p>
                <p className="font-semibold text-yellow-400">{reviewMataKuliah.length} Mata Kuliah</p>
              </div>
            </div>

            {/* List mata kuliah hasil AI */}
            <div>
              <h3 className="font-semibold mb-3">Mata Kuliah Terpilih</h3>
              <div className="space-y-2">
                {reviewMataKuliah.length === 0 ? (
                  <p className="text-sm text-blue-200/60 italic">Belum ada mata kuliah. Tambahkan dari dropdown di bawah.</p>
                ) : (
                  reviewMataKuliah.map((mk, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium text-base">{mk.nama}</p>
                          <p className="text-xs text-blue-200/70 mt-1">{mk.kode_mk} • {mk.sks} SKS</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMK(idx)}
                          className="ml-4 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-lg text-sm transition flex-shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                      
                      {/* AI Notes and Match Percentage */}
                      <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-blue-300">Tingkat Kecocokan (%)</span>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={mk.tingkat_kecocokan ?? ''}
                              onChange={(e) => handleUpdateTingkatKecocokan(idx, e.target.value)}
                              placeholder="-"
                              className="w-24 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/40 border border-white/20 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
                            />
                            {mk.tingkat_kecocokan !== null && mk.tingkat_kecocokan !== undefined ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                mk.tingkat_kecocokan >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                mk.tingkat_kecocokan >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {mk.tingkat_kecocokan}%
                              </span>
                            ) : (
                              <span className="text-xs text-blue-200/50">Tidak diatur</span>
                            )}
                          </div>
                          <span className="text-[11px] text-blue-200/60">Kosongkan untuk menampilkan tanda '-'. Nilai otomatis dibulatkan 0-100.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-blue-300 min-w-[120px]">Alasan AI:</span>
                          <p className="text-xs text-blue-200/80 flex-1">
                            {mk.alasan || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tambah mata kuliah */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-blue-100">Tambah Mata Kuliah</h3>
              <div className="flex gap-3">
                <select
                  value={selectedMKToAdd}
                  onChange={(e) => setSelectedMKToAdd(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition"
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {allMataKuliah.map((mk) => (
                    <option key={mk.id} value={mk.id} className="bg-slate-800 text-white">
                      {mk.nama_mk} ({mk.kode_mk}) - {mk.sks} SKS
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddMK}
                  disabled={!selectedMKToAdd}
                  className="px-6 py-2.5 bg-blue-500/80 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-medium transition shadow-lg"
                >
                  + Tambah
                </button>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <h3 className="font-semibold mb-3">Catatan untuk Mahasiswa (Opsional)</h3>
              <textarea
                value={reviewCatatan}
                onChange={(e) => setReviewCatatan(e.target.value)}
                placeholder="Tulis pesan atau catatan untuk mahasiswa..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/40 focus:outline-none focus:border-yellow-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancelReview}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition"
              >
                Batal
              </button>
              <button
                onClick={handleSaveRencanaStudi}
                disabled={reviewMataKuliah.length === 0}
                className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
              >
                Simpan Rencana Studi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">
              {processingAction === 'generate' 
                ? 'Generate Rekomendasi AI' 
                : 'Memeriksa Data Akademik'}
            </h1>
            <p className="text-sm text-blue-200/80 mt-2">
              {processingError
                ? 'Terjadi kendala saat memproses rekomendasi. Silakan coba lagi atau kembali ke dashboard.'
                : processingAction === 'generate'
                ? 'Sistem AI sedang menganalisis preferensi mahasiswa dan membuat rekomendasi mata kuliah. Tunggu sebentar...'
                : 'Sistem akan memeriksa IPK, mata kuliah lulus, dan data akademik lainnya. Tunggu sebentar — ini otomatis.'}
            </p>
          </div>

          <div className="bg-[#0F2A55] rounded-2xl p-8 shadow-inner max-w-[700px] mx-auto">
            <div className="space-y-6 px-8">
              {steps.map((s, idx) => (
                <div key={idx} className="flex items-start gap-6 transition-all duration-300">
                  <div className="flex items-center flex-col flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${
                        s.state === "success" 
                          ? "bg-green-500 text-white shadow-lg shadow-green-500/50" 
                          : s.state === "processing" 
                          ? "bg-yellow-400 text-slate-900 animate-pulse shadow-lg shadow-yellow-400/50" 
                          : s.state === "error"
                          ? "bg-red-500 text-white"
                          : "bg-slate-600 text-slate-300"
                      }`}
                    >
                      {s.state === "success" ? "✓" : s.state === "processing" ? "⟳" : s.state === "error" ? "✗" : idx + 1}
                    </div>
                    {idx < steps.length - 1 && (
                      <div 
                        className={`w-1 mt-2 transition-all duration-500 ${
                          s.state === "success" ? "bg-green-500" : "bg-slate-700"
                        }`} 
                        style={{ height: 70 }} 
                      />
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className={`text-lg font-semibold transition-colors duration-300 ${
                      s.state === "success" 
                        ? "text-green-300" 
                        : s.state === "processing" 
                        ? "text-yellow-300" 
                        : s.state === "error"
                        ? "text-red-300"
                        : "text-slate-400"
                    }`}>
                      {s.label}
                    </div>
                    <div className={`text-sm mt-1 transition-colors duration-300 ${
                      s.state === "processing" ? "text-blue-200" : "text-blue-100/60"
                    }`}>
                      {s.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(2, loadingProgress)}%` }}
                  />
                </div>
                <div className="text-lg font-bold text-yellow-400 w-16 text-right">{loadingProgress}%</div>
              </div>

              {loadingProgress >= 100 && (
                <div className="text-center mt-2">
                  <button 
                    onClick={() => transitionToReview(processingStudent)}
                    className="px-6 py-2.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold transition-colors shadow-lg"
                  >
                    Lanjut ke Review →
                  </button>
                </div>
              )}

              {processingError && (
                <div className="mt-4 rounded-xl border border-red-500/50 bg-red-500/10 px-5 py-4 text-left">
                  <p className="text-sm text-red-200 leading-relaxed">
                    {processingError}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => processingStudent && startGenerateAndApproveFlow(processingStudent)}
                      className="flex-1 rounded-lg bg-red-500/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Coba Lagi
                    </button>
                    <button
                      type="button"
                      onClick={cancelProcessingAndReturn}
                      className="flex-1 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              )}
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
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 bg-[#214A9A] shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Beranda</span>
              </button>

              <button 
                type="button"
                onClick={() => navigate("/rencana-studi-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
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
        {/* DASHBOARD BERANDA */}
        <header className="mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">Halo, <span className="font-semibold text-[#FBBF24]">{dosenProfile?.nama || 'Dosen'}</span></p>
          <h1 className="text-lg md:text-xl font-semibold mt-1">Pantau dan verifikasi rencana studi mahasiswa</h1>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Memuat data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0B3C9C] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Total Mahasiswa</p>
                <p className="mt-2 text-3xl font-bold">{students.length}</p>
              </div>
              <div className="bg-[#0B3C9C] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Menunggu Validasi</p>
                <p className="mt-2 text-3xl font-bold">{students.filter(s => s.status === 'Tertunda' || s.status === 'Pending').length}</p>
              </div>
              <div className="bg-[#0B3C9C] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Disetujui</p>
                <p className="mt-2 text-3xl font-bold">{students.filter(s => s.status === 'Disetujui').length}</p>
              </div>
              <div className="bg-[#0B3C9C] text-white px-5 py-4 rounded-2xl shadow-lg">
                <p className="text-xs uppercase tracking-wide text-blue-100">Ditolak</p>
                <p className="mt-2 text-3xl font-bold">{students.filter(s => s.status === 'Ditolak').length}</p>
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
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                          Tidak ada mahasiswa yang mengajukan rencana studi
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => (
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </section>

      {/* POPUP DARI FILE KIRI */}
      {/* Detail Popup */}
      {showDetailPopup && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
          <div className="relative w-full max-w-6xl rounded-3xl bg-gradient-to-br from-[#0A3B8A] to-[#0F57C5] text-white shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowDetailPopup(false);
                setSelectedStudent(null);
                setEditingCatatan(false);
              }}
              className="absolute top-6 right-6 text-white/70 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6">Detail Rencana Studi</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Student Info */}
                <div className="bg-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Informasi Mahasiswa</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-100">Nama</p>
                      <p className="font-semibold">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-100">NIM</p>
                      <p className="font-semibold">{selectedStudent.nim}</p>
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
                      <p className="text-sm text-blue-100">Jumlah MK</p>
                      <p className="font-semibold">{selectedStudent.jumlahMK}</p>
                    </div>
                  </div>
                </div>

                {/* Minat & Fokus */}
                {(selectedStudent.interests || selectedStudent.futureFocus) && (
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-3">Minat & Fokus Karir</h3>
                    {selectedStudent.interests && (
                      <div className="mb-3">
                        <p className="text-sm text-blue-100 mb-2">Bidang Minat:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudent.interests.map((interest, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedStudent.futureFocus && (
                      <p className="text-sm">
                        <span className="text-blue-100">Fokus Masa Depan:</span>{" "}
                        <span className="font-semibold capitalize">{selectedStudent.futureFocus}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Catatan Dosen - Editable */}
                <div className="bg-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Catatan Dosen</h3>
                    {!editingCatatan && (
                      <button
                        onClick={() => setEditingCatatan(true)}
                        className="px-3 py-1 bg-yellow-500/80 hover:bg-yellow-500 text-sm rounded-lg transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingCatatan ? (
                    <div className="space-y-3">
                      <textarea
                        value={catatanDosen}
                        onChange={(e) => setCatatanDosen(e.target.value)}
                        placeholder="Tambahkan catatan..."
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/40 focus:outline-none focus:border-yellow-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            try {
                              await api.dosen.updateMataKuliah(
                                selectedStudent.rencana_studi_id,
                                selectedStudent.rencana,
                                catatanDosen
                              );
                              setEditingCatatan(false);
                              alert('Catatan berhasil disimpan');
                            } catch (error) {
                              alert('Gagal menyimpan catatan');
                            }
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingCatatan(false)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-100/80">
                      {catatanDosen || <span className="italic text-blue-200/50">Belum ada catatan</span>}
                    </p>
                  )}
                </div>

                {/* Daftar Mata Kuliah */}
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="font-semibold text-lg mb-4">Daftar Mata Kuliah</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {selectedStudent.rencana && selectedStudent.rencana.map((mk, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold">{mk.nama}</p>
                            <p className="text-xs text-blue-200/70 mt-1">
                              {mk.kode_mk} • {mk.sks} SKS
                              {mk.bidang_minat && <span> • {mk.bidang_minat}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Alasan AI */}
                        {mk.alasan && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-blue-200/80">
                              <span className="font-semibold text-blue-100">Alasan:</span> {mk.alasan}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bar Graph - Tingkat Kecocokan Agregat */}
                {selectedStudent.rencana && selectedStudent.rencana.some(mk => mk.tingkat_kecocokan !== null && mk.tingkat_kecocokan !== undefined) && (
                  <div className="bg-white/10 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-4">Tingkat Kecocokan Mata Kuliah</h3>
                    <div className="space-y-3">
                      {selectedStudent.rencana
                        .filter(mk => mk.tingkat_kecocokan !== null && mk.tingkat_kecocokan !== undefined)
                        .map((mk, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-blue-100 truncate flex-1 mr-4">{mk.nama}</span>
                              <span className={`text-sm font-bold min-w-[50px] text-right ${
                                mk.tingkat_kecocokan >= 80 ? 'text-green-300' :
                                mk.tingkat_kecocokan >= 60 ? 'text-yellow-300' :
                                'text-blue-300'
                              }`}>
                                {mk.tingkat_kecocokan}%
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  mk.tingkat_kecocokan >= 80 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                  mk.tingkat_kecocokan >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                  'bg-gradient-to-r from-blue-400 to-blue-500'
                                }`}
                                style={{ width: `${mk.tingkat_kecocokan}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Donut Chart */}
              <div className="space-y-6">
                {/* Donut Chart - Distribusi Bidang Minat */}
                {selectedStudent.rencana && selectedStudent.rencana.length > 0 && (() => {
                  const bidangMinatCount = {};
                  selectedStudent.rencana.forEach(mk => {
                    const bidang = mk.bidang_minat || 'Lainnya';
                    bidangMinatCount[bidang] = (bidangMinatCount[bidang] || 0) + 1;
                  });
                  
                  const total = selectedStudent.rencana.length;
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

                  return (
                    <div className="bg-white/10 rounded-xl p-6 sticky top-0">
                      <h3 className="font-semibold text-lg mb-4 text-center">Distribusi Bidang Minat</h3>
                      <div className="flex flex-col items-center gap-4">
                        {/* Donut Chart */}
                        <svg width="180" height="180" viewBox="0 0 180 180">
                          <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="26" />
                          {Object.entries(bidangMinatCount).map(([bidang, count], idx) => {
                            const percent = (count / total) * 100;
                            const angle = (percent / 100) * 360;
                            const startAngle = idx === 0 ? 0 : Object.entries(bidangMinatCount)
                              .slice(0, idx)
                              .reduce((sum, [, c]) => sum + ((c / total) * 360), 0);
                            
                            const startRad = (startAngle - 90) * (Math.PI / 180);
                            const endRad = (startAngle + angle - 90) * (Math.PI / 180);
                            
                            const x1 = 90 + 70 * Math.cos(startRad);
                            const y1 = 90 + 70 * Math.sin(startRad);
                            const x2 = 90 + 70 * Math.cos(endRad);
                            const y2 = 90 + 70 * Math.sin(endRad);
                            
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            return (
                              <path
                                key={bidang}
                                d={`M 90 90 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                fill={colors[idx % colors.length]}
                                opacity="0.9"
                              />
                            );
                          })}
                          <circle cx="90" cy="90" r="45" fill="#0A3B8A" />
                        </svg>

                        {/* Legend */}
                        <div className="space-y-2 w-full">
                          {Object.entries(bidangMinatCount).map(([bidang, count], idx) => {
                            const percent = ((count / total) * 100).toFixed(1);
                            return (
                              <div key={bidang} className="flex items-center gap-2 text-sm">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: colors[idx % colors.length] }}
                                />
                                <span className="text-blue-100 flex-1">{bidang}</span>
                                <span className="font-semibold">{percent}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 mt-6 border-t border-white/20">
              <button
                onClick={onPrepareReject}
                disabled={selectedStudent.status === 'Disetujui' || selectedStudent.status === 'Ditolak'}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                  selectedStudent.status === 'Disetujui' || selectedStudent.status === 'Ditolak'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Tolak
              </button>
              <button
                onClick={onPrepareApprove}
                disabled={selectedStudent.status === 'Disetujui' || selectedStudent.status === 'Ditolak'}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                  selectedStudent.status === 'Disetujui' || selectedStudent.status === 'Ditolak'
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Setujui
              </button>
            </div>

              {(selectedStudent.status === 'Disetujui' || selectedStudent.status === 'Ditolak') && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-blue-100/80">
                    Rencana studi ini sudah {selectedStudent.status.toLowerCase()}
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Verify Popup */}
      {showVerifyPopup && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-[60] p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-900 shadow-2xl p-6">
            <h3 className="text-xl font-bold mb-4">
              {verifyAction === "approve" 
                ? "Konfirmasi Persetujuan" 
                : verifyAction === "reject"
                ? "Konfirmasi Penolakan"
                : "Konfirmasi Generate AI"}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {verifyAction === "approve"
                ? (selectedStudent.rencana && selectedStudent.rencana.length > 0)
                  ? `Apakah Anda yakin ingin menyetujui rencana studi ${selectedStudent.name}?`
                  : `Sistem akan otomatis generate rekomendasi AI terlebih dahulu, kemudian menyetujui rencana studi ${selectedStudent.name}. Proses ini membutuhkan waktu beberapa detik.`
                : verifyAction === "reject"
                ? `Apakah Anda yakin ingin menolak rencana studi ${selectedStudent.name}?`
                : `Sistem akan menggunakan AI untuk generate rekomendasi mata kuliah berdasarkan preferensi ${selectedStudent.name}. Proses ini membutuhkan waktu beberapa detik.`}
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
                    : verifyAction === "reject"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-yellow-500 hover:bg-yellow-600 text-white"
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