// src/store/usePlanStore.js
import { create } from "zustand";

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
  submitCurrentPlan: () =>
    set((state) => {
      const plan = state.currentPlan;

      // Jika ada data kosong, jangan lanjutkan submit
      if (
        !plan.interests?.length &&
        !plan.futureFocus &&
        !plan.learningPreference
      ) {
        return state;
      }

      const now = new Date();
      const createdAt = now.toISOString();
      const dateLabel = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Membuat pengajuan dengan data dari form
      const newSubmission = {
        id: Date.now().toString(),
        title: "Pengajuan Rencana Studi",
        status: "pending", // status awal "pending"
        createdAt, // tanggal pembuatan
        dateLabel, // format tanggal
        ...plan,   // menggunakan data form mahasiswa
      };

      return {
        submissions: [newSubmission, ...state.submissions], // Menambahkan pengajuan baru
        currentPlan: {
          ...plan, // reset form plan setelah submit
        },
      };
    }),
}));
