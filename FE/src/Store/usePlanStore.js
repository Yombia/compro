// src/store/usePlanStore.js
import { create } from "zustand";

export const usePlanStore = create((set) => ({
  // Data rencana studi yang sedang diisi
  currentPlan: {
    interests: [],          // ["IoT", "Robotics", ...]
    futureFocus: "",        // "s2" | "industri" | "startup"
    learningPreference: "", // "konsep" | "project" | "campuran"
    recommendedCourses: [], // list mata kuliah dari Step 4
    ipk: null,              // optional, kalau nanti mau diisi
    totalSks: null,         // optional, dari rencana atau sistem
  },

  // Riwayat seluruh pengajuan
  submissions: [],

  // Simpan data dari Step 2 (minat, fokus, gaya belajar, dll)
  setStep2Data: (data) =>
    set((state) => ({
      currentPlan: {
        ...state.currentPlan,
        ...data, // merge field yang dikirim dari Step 2
      },
    })),

  // Simpan daftar mata kuliah rekomendasi dari Step 4
  setRecommendedCourses: (courses) =>
    set((state) => ({
      currentPlan: {
        ...state.currentPlan,
        recommendedCourses: courses,
      },
    })),

  // Buat 1 pengajuan baru dari currentPlan
  submitCurrentPlan: () =>
    set((state) => {
      const plan = state.currentPlan;

      // kalau semua kosong, jangan bikin pengajuan
      if (
        !plan.interests?.length &&
        !plan.recommendedCourses?.length &&
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

      // hitung total SKS dari recommendedCourses kalau belum ada
      const totalSksFromCourses = Array.isArray(plan.recommendedCourses)
        ? plan.recommendedCourses.reduce(
            (sum, c) => sum + (c.sks || 0),
            0
          )
        : 0;

      const newSubmission = {
        id: Date.now().toString(),
        title: "Pengajuan Rencana Studi",
        status: "pending",
        createdAt, // buat sorting di Riwayat
        dateLabel, // tampilan tanggal di Riwayat
        ...plan,   // spread dulu plan
        // pakai totalSks di plan kalau ada, kalau tidak pakai hasil hitungan
        totalSks: plan.totalSks ?? (totalSksFromCourses || null),
      };

      return {
        submissions: [newSubmission, ...state.submissions],
        currentPlan: {
          ...plan, // kalau mau nanti bisa di-reset di sini
        },
      };
    }),
}));
