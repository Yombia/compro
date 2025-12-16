// src/store/usePlanStore.js
import { create } from "zustand";
import { api } from "../api/api";

export const usePlanStore = create((set) => ({
  // Data rencana studi yang sedang diisi
  currentPlan: {
    interests: [],          // ["IoT", "Robotics", ...]
    futureFocus: "",        // "s2" | "industri" | "startup"
    learningPreference: "", // "konsep" | "project" | "campuran"
    ipk: null,              // optional, kalau nanti mau diisi
    totalSks: null,         // optional, dari rencana atau sistem
  },

  // Riwayat seluruh pengajuan
  submissions: [],

  // Simpan data yang diinput mahasiswa di form
  setStep2Data: (data) =>
    set((state) => ({
      currentPlan: {
        ...state.currentPlan,
        ...data, // merge field yang dikirim dari form mahasiswa
      },
    })),

  // Submit pengajuan rencana studi
  submitCurrentPlan: async () => {
    const state = usePlanStore.getState();
    const plan = state.currentPlan;

    // Validasi: Jika ada data kosong, jangan lanjutkan submit
    if (
      !plan.interests?.length ||
      !plan.futureFocus ||
      !plan.learningPreference
    ) {
      console.error("Data tidak lengkap:", plan);
      alert("Mohon lengkapi semua field (bidang minat, fokus, dan gaya belajar)");
      return;
    }

    try {
      // Kirim ke backend
      console.log("Submitting to backend:", {
        interests: plan.interests,
        future_focus: plan.futureFocus,
        learning_preference: plan.learningPreference,
      });

      const response = await api.mahasiswa.submitRencanaStudi({
        interests: plan.interests,
        future_focus: plan.futureFocus,
        learning_preference: plan.learningPreference,
      });

      console.log("Submit berhasil:", response);
      alert("Rencana studi berhasil diajukan!");

      // Reset currentPlan setelah submit berhasil
      set({
        currentPlan: {
          interests: [],
          futureFocus: "",
          learningPreference: "",
          ipk: null,
          totalSks: null,
        },
      });
    } catch (error) {
      console.error("Submit gagal:", error);
      alert(error.message || "Gagal submit rencana studi. Silakan coba lagi.");
      throw error;
    }
  },
}));
