import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { api } from "../api/api";

const STATUS_STYLES = {
  Pending: {
    label: "Pending",
    badgeClass: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-200",
  },
  Tertunda: {
    label: "Tertunda",
    badgeClass: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-200",
  },
  Disetujui: {
    label: "Disetujui",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
  Ditolak: {
    label: "Ditolak",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200",
  },
  default: {
    label: "Belum Ada",
    badgeClass: "bg-slate-200 text-slate-700 dark:bg-slate-700/60 dark:text-slate-200",
  },
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("Failed to format date", error);
    return "-";
  }
};

const getStatusInfo = (status) => STATUS_STYLES[status] ?? STATUS_STYLES.default;

const calculateTotalSKS = (mataKuliah = []) =>
  mataKuliah.reduce((total, mk) => total + (mk?.sks ?? 0), 0);

const buildPlanLabel = (plan, index) => {
  if (!plan) return "Rencana Studi";

  const semesterRaw = plan?.kelas?.semester;
  const tahunAjaranRaw = plan?.kelas?.tahun_ajaran;

  const semesterLabel = semesterRaw ? `Semester ${semesterRaw}` : null;
  const tahunLabel = tahunAjaranRaw
    ? tahunAjaranRaw.replace(/[\/]/g, (match) => (match === "/" ? "-" : match))
    : null;

  if (semesterLabel && tahunLabel) {
    return `${semesterLabel} ${tahunLabel}`;
  }

  if (semesterLabel) {
    return semesterLabel;
  }

  if (tahunLabel) {
    return `Tahun ${tahunLabel}`;
  }

  const formattedDate = formatDate(plan?.created_at || plan?.tanggal_pengajuan);
  if (formattedDate !== "-") {
    return `Pengajuan ${formattedDate}`;
  }

  return `Rencana Studi ${index + 1}`;
};

export default function RencanaStudiDosen() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [dosenProfile, setDosenProfile] = useState(null);
  const [studentPlans, setStudentPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});
  const [allCourses, setAllCourses] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editLoadingPlan, setEditLoadingPlan] = useState(false);
  const [activeEditNim, setActiveEditNim] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDosenProfile();
    fetchPlansData();
  }, []);

  const fetchDosenProfile = async () => {
    try {
      const response = await api.dosen.getProfile();
      setDosenProfile(response.dosen);
    } catch (err) {
      console.error("Error fetching dosen profile", err);
    }
  };

  const fetchPlansData = async () => {
    try {
      setLoading(true);
      const [studentsResponse, riwayatResponse] = await Promise.all([
        api.dosen.getMahasiswa(),
        api.dosen.getRiwayat(),
      ]);

      const baseStudents = studentsResponse.students || [];
      const riwayatList = (riwayatResponse.riwayat || []).filter(
        (plan) => plan?.mahasiswa?.nim && plan.status_rencana !== "Ditolak"
      );

      const groupedPlans = riwayatList.reduce((acc, plan) => {
        const nim = plan.mahasiswa.nim;
        if (!acc[nim]) {
          acc[nim] = [];
        }
        acc[nim].push(plan);
        return acc;
      }, {});

      const mergedStudents = baseStudents.map((student) => {
        const normalizedInterests = Array.isArray(student.interests)
          ? student.interests
          : student.interests
          ? [student.interests]
          : [];

        const plans = (groupedPlans[student.nim] || [])
          .slice()
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        return {
          ...student,
          interests: normalizedInterests,
          plans,
        };
      });

      const initialSelection = {};
      mergedStudents.forEach((student) => {
        if (student.plans.length > 0) {
          const latestPlan = student.plans[student.plans.length - 1];
          initialSelection[student.nim] = String(latestPlan.id);
        }
      });

      setStudentPlans(mergedStudents);
      setSelectedPlans(initialSelection);
      setError(null);
    } catch (err) {
      console.error("Error fetching plans data", err);
      setError(err.message || "Gagal mengambil rencana studi");
      setStudentPlans([]);
      setSelectedPlans({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentPlans.length === 0) {
      setExpandedStudents({});
      return;
    }

    setExpandedStudents((previous) => {
      const nextState = {};
      studentPlans.forEach((student) => {
        nextState[student.nim] = previous[student.nim] ?? false;
      });
      return nextState;
    });
  }, [studentPlans]);

  const toggleStudentCardExpansion = (nim) => {
    setExpandedStudents((previous) => ({
      ...previous,
      [nim]: !(previous[nim] ?? false),
    }));
  };

  const handleOpenEdit = async (student) => {
    const planId = selectedPlans[student.nim];
    if (!planId) return;

    setActiveEditNim(student.nim);
    setEditError(null);
    setEditLoadingPlan(true);

    try {
      const detailResponse = await api.dosen.getDetailRencanaStudi(planId);
      const detail = detailResponse.rencana_studi;

      if (!detail) {
        throw new Error("Detail rencana studi tidak ditemukan");
      }

      if (allCourses.length === 0) {
        try {
          const coursesResponse = await api.dosen.getAllMataKuliah();
          setAllCourses(coursesResponse.mata_kuliah || []);
        } catch (courseError) {
          console.error("Error fetching mata kuliah list", courseError);
        }
      }

      const normalizedCourses = (detail.mata_kuliah || []).map((mk) => ({
        kode_mk: mk.kode_mk,
        nama: mk.nama || mk.nama_mata_kuliah || "",
        sks: mk.sks || 0,
        alasan: mk.alasan || "",
        tingkat_kecocokan: mk.tingkat_kecocokan ?? null,
      }));

      setEditModal({
        student,
        planId: detail.id,
        mataKuliah: normalizedCourses,
        catatan: detail.catatan || "",
        selectedCourseId: "",
      });
    } catch (err) {
      console.error("Error loading plan for editing", err);
      alert(err?.message || "Gagal membuka editor rencana studi.");
    } finally {
      setEditLoadingPlan(false);
      setActiveEditNim(null);
    }
  };

  const handleCloseEdit = () => {
    setEditModal(null);
    setEditError(null);
  };

  const handleSelectCourseForEdit = (courseId) => {
    setEditModal((prev) => (prev ? { ...prev, selectedCourseId: courseId } : prev));
    setEditError(null);
  };

  const handleAddCourseToPlan = () => {
    if (!editModal || !editModal.selectedCourseId) return;

    const course = allCourses.find(
      (item) => String(item.id) === String(editModal.selectedCourseId)
    );

    if (!course) {
      setEditError("Mata kuliah tidak ditemukan");
      return;
    }

    const alreadyExists = editModal.mataKuliah.some(
      (mk) => mk.kode_mk === course.kode_mk
    );

    if (alreadyExists) {
      setEditError("Mata kuliah sudah ada dalam rencana studi");
      return;
    }

    const newEntry = {
      kode_mk: course.kode_mk,
      nama: course.nama_mk,
      sks: course.sks,
      alasan: "",
      tingkat_kecocokan: null,
    };

    setEditModal((prev) =>
      prev
        ? {
            ...prev,
            mataKuliah: [...prev.mataKuliah, newEntry],
            selectedCourseId: "",
          }
        : prev
    );
    setEditError(null);
  };

  const handleRemoveCourseFromPlan = (index) => {
    setEditModal((prev) => {
      if (!prev) return prev;
      const updated = prev.mataKuliah.filter((_, idx) => idx !== index);
      return { ...prev, mataKuliah: updated };
    });
    setEditError(null);
  };

  const handleUpdateCourseMatch = (index, value) => {
    setEditModal((prev) => {
      if (!prev) return prev;

      const updated = prev.mataKuliah.map((mk, idx) => {
        if (idx !== index) return mk;

        if (value === "" || value === null) {
          return { ...mk, tingkat_kecocokan: null };
        }

        const numeric = Number(value);
        if (Number.isNaN(numeric)) return mk;

        const clamped = Math.max(0, Math.min(100, Math.round(numeric)));
        return { ...mk, tingkat_kecocokan: clamped };
      });

      return { ...prev, mataKuliah: updated };
    });
  };

  const handleUpdateCourseReason = (index, value) => {
    setEditModal((prev) => {
      if (!prev) return prev;
      const updated = prev.mataKuliah.map((mk, idx) =>
        idx === index ? { ...mk, alasan: value } : mk
      );
      return { ...prev, mataKuliah: updated };
    });
  };

  const handleUpdateCatatan = (value) => {
    setEditModal((prev) => (prev ? { ...prev, catatan: value } : prev));
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    if (editModal.mataKuliah.length === 0) {
      setEditError("Minimal harus ada 1 mata kuliah dalam rencana studi.");
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      const payload = editModal.mataKuliah.map((mk) => ({
        kode_mk: mk.kode_mk,
        nama: mk.nama,
        sks: mk.sks,
        alasan: mk.alasan || null,
        tingkat_kecocokan: mk.tingkat_kecocokan,
      }));

      await api.dosen.updateMataKuliah(
        editModal.planId,
        payload,
        editModal.catatan || null
      );

      setStudentPlans((prev) =>
        prev.map((student) => {
          if (student.nim !== editModal.student.nim) return student;

          const updatedPlans = student.plans.map((plan) => {
            if (plan.id !== editModal.planId) return plan;

            return {
              ...plan,
              catatan: editModal.catatan,
              mata_kuliah: editModal.mataKuliah.map((mk) => ({
                kode_mk: mk.kode_mk,
                nama_mata_kuliah: mk.nama,
                nama: mk.nama,
                sks: mk.sks,
                alasan: mk.alasan,
                tingkat_kecocokan: mk.tingkat_kecocokan,
              })),
            };
          });

          return {
            ...student,
            plans: updatedPlans,
          };
        })
      );

      handleCloseEdit();
    } catch (err) {
      console.error("Error updating rencana studi", err);
      setEditError(err?.message || "Gagal menyimpan perubahan.");
    } finally {
      setSavingEdit(false);
    }
  };

  const selectedPlanSummary = useMemo(() => {
    const totalStudents = studentPlans.length;
    const studentsWithPlans = studentPlans.filter((student) => student.plans.length > 0).length;
    const pendingCount = studentPlans.reduce((acc, student) => {
      const selectedPlan = student.plans.find((plan) => String(plan.id) === selectedPlans[student.nim]);
      if ((selectedPlan?.status_rencana || student.status) === "Pending") {
        return acc + 1;
      }
      if ((selectedPlan?.status_rencana || student.status) === "Tertunda") {
        return acc + 1;
      }
      return acc;
    }, 0);

    return {
      totalStudents,
      studentsWithPlans,
      pendingCount,
    };
  }, [studentPlans, selectedPlans]);

  const handlePlanChange = (nim, planId) => {
    setSelectedPlans((prev) => ({
      ...prev,
      [nim]: planId,
    }));
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const renderStudentCard = (student) => {
    const selectedPlanId = selectedPlans[student.nim];
    const selectedPlan = student.plans.find((plan) => String(plan.id) === selectedPlanId);
    const statusSource = selectedPlan?.status_rencana || student.status;
    const statusInfo = getStatusInfo(statusSource);
    const totalSKS = calculateTotalSKS(selectedPlan?.mata_kuliah);
    const tanggalPengajuan = selectedPlan?.created_at || selectedPlan?.tanggal_pengajuan;
    const isExpanded = expandedStudents[student.nim] ?? false;

    return (
      <div
        key={student.nim}
        className="rounded-3xl bg-white shadow-[0_24px_50px_rgba(15,23,42,0.08)] border border-slate-200 p-6 flex flex-col gap-5 dark:bg-[#0F172A] dark:border-slate-700"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{student.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">NIM {student.nim}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-300">
              {student.interests?.length ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-600">
                  <span className="text-slate-400">Minat:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {student.interests.join(", ")}
                  </span>
                </span>
              ) : null}
              {student.futureFocus ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-600">
                  <span className="text-slate-400">Fokus:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 capitalize">
                    {student.futureFocus}
                  </span>
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </span>
            <button
              type="button"
              onClick={() => toggleStudentCardExpansion(student.nim)}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? "Sembunyikan detail" : "Buka detail"}
              className="inline-flex h-10 w-10 items-center justify-center text-3xl leading-none text-slate-500 transition hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/40 dark:text-slate-300 dark:hover:text-slate-50"
            >
              <span className="select-none">{isExpanded ? "▴" : "▾"}</span>
            </button>
          </div>
        </div>

        {isExpanded ? (
          <>
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Pilih Rencana Studi
              </label>
              <select
                value={selectedPlanId || ""}
                onChange={(event) => handlePlanChange(student.nim, event.target.value)}
                disabled={student.plans.length === 0}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/10"
              >
                {student.plans.length === 0 ? (
                  <option value="">Belum ada pengajuan aktif</option>
                ) : (
                  student.plans.map((plan, index) => (
                    <option key={plan.id} value={plan.id}>
                      {buildPlanLabel(plan, index)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedPlan ? (
              <div className="space-y-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(student)}
                    disabled={editLoadingPlan && activeEditNim === student.nim}
                    className="rounded-full border border-blue-300 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-blue-400/60 dark:text-blue-200 dark:hover:bg-blue-500/10"
                  >
                    {editLoadingPlan && activeEditNim === student.nim ? "Membuka..." : "Edit Rencana Studi"}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Pengajuan</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                      {formatDate(tanggalPengajuan)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total Mata Kuliah</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                      {selectedPlan.mata_kuliah?.length || 0} MK
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total SKS</p>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{totalSKS} SKS</p>
                  </div>
                </div>

                {selectedPlan.catatan ? (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700 dark:border-blue-400/40 dark:bg-blue-500/10 dark:text-blue-100">
                    <p className="font-semibold mb-1">Catatan</p>
                    <p>{selectedPlan.catatan}</p>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Daftar Mata Kuliah</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {selectedPlan.mata_kuliah?.length || 0} item
                    </span>
                  </div>
                  <div className="mt-3 space-y-3 max-h-56 overflow-y-auto pr-1">
                    {selectedPlan.mata_kuliah?.map((mk, index) => (
                      <div
                        key={`${mk.kode_mk || mk.nama_mata_kuliah || "mk"}-${index}`}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-600 dark:bg-slate-800/70"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {mk.nama_mata_kuliah || mk.nama || "Mata kuliah"}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-400">
                              {mk.kode_mk || "-"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                              {mk.sks || 0} SKS
                            </span>
                            {mk.tingkat_kecocokan !== null && mk.tingkat_kecocokan !== undefined ? (
                              <p className="mt-1 text-xs font-semibold text-blue-500 dark:text-blue-300">
                                {mk.tingkat_kecocokan}% cocok
                              </p>
                            ) : null}
                          </div>
                        </div>
                        {mk.alasan ? (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
                            {mk.alasan}
                          </p>
                        ) : null}
                      </div>
                    ))}

                    {(selectedPlan.mata_kuliah?.length || 0) === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400 dark:border-slate-600 dark:text-slate-500">
                        Belum ada mata kuliah yang ditambahkan pada pengajuan ini.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                {student.status === "Ditolak"
                  ? "Pengajuan terakhir ditolak. Menunggu pengajuan baru dari mahasiswa."
                  : "Belum ada pengajuan rencana studi yang aktif."}
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editModal) return null;

    return (
      <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-4xl rounded-3xl bg-white text-slate-900 shadow-[0_24px_60px_rgba(15,23,42,0.4)] border border-slate-200 dark:bg-[#0F172A] dark:text-white dark:border-slate-700">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500">Editing untuk</p>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{editModal.student.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-300">NIM {editModal.student.nim}</p>
            </div>
            <button
              type="button"
              onClick={handleCloseEdit}
              className="rounded-full border border-slate-300 p-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/60"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6 px-6 py-5">
            {editError ? (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500 dark:bg-rose-500/10 dark:text-rose-200">
                {editError}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tambah Mata Kuliah
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={editModal.selectedCourseId}
                  onChange={(event) => handleSelectCourseForEdit(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/10"
                >
                  <option value="">-- Pilih Mata Kuliah --</option>
                  {allCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.nama_mk} ({course.kode_mk}) - {course.sks} SKS
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCourseToPlan}
                  disabled={!editModal.selectedCourseId}
                  className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + Tambah
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editModal.mataKuliah.map((mk, index) => (
                <div
                  key={`${mk.kode_mk || mk.nama}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {mk.nama || mk.kode_mk}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-400">
                        {mk.kode_mk} • {mk.sks} SKS
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourseFromPlan(index)}
                      className="rounded-full border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-100 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-500/20"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Tingkat Kecocokan (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={mk.tingkat_kecocokan ?? ""}
                        onChange={(event) => handleUpdateCourseMatch(index, event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                        placeholder="-"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Alasan / Catatan AI
                      </label>
                      <textarea
                        rows={3}
                        value={mk.alasan}
                        onChange={(event) => handleUpdateCourseReason(index, event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                        placeholder="Tambahkan konteks atau alasan..."
                      />
                    </div>
                  </div>
                </div>
              ))}

              {editModal.mataKuliah.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/20 dark:text-slate-400">
                  Belum ada mata kuliah yang dipilih.
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Catatan Dosen
              </label>
              <textarea
                rows={4}
                value={editModal.catatan}
                onChange={(event) => handleUpdateCatatan(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-500/20"
                placeholder="Catatan atau instruksi untuk mahasiswa"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm sm:flex-row-reverse dark:border-slate-700">
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={savingEdit}
              className="rounded-full bg-blue-600 px-6 py-2 font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              type="button"
              onClick={handleCloseEdit}
              disabled={savingEdit}
              className="rounded-full border border-slate-300 px-6 py-2 font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700/60"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <main className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] via-[#F5FAFF] to-[#FDFEFF] text-slate-900 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
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
                onClick={() => navigate("/dashboard-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Beranda</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 bg-[#214A9A] shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
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
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </aside>

      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Halo, <span className="font-semibold text-[#2563EB] dark:text-[#FACC15]">{dosenProfile?.nama || "Dosen"}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Rencana Studi Mahasiswa</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau pengajuan rencana studi setiap mahasiswa dan lihat detail kurikulumnya per semester.
          </p>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-[#111C33]">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Total Mahasiswa</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedPlanSummary.totalStudents}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-[#111C33]">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Memiliki Rencana Studi</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedPlanSummary.studentsWithPlans}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-[#111C33]">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Menunggu Tindakan</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{selectedPlanSummary.pendingCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Memuat data rencana studi...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-300 font-semibold mb-4">{error}</p>
              <button
                type="button"
                onClick={fetchPlansData}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : studentPlans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            Belum ada data mahasiswa pada kelas yang Anda ampu.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {studentPlans.map(renderStudentCard)}
          </div>
        )}
      </section>
    </main>
    {renderEditModal()}
  </>
  );
}
