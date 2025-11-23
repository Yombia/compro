// src/store/useAuthStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  // ⬇️ PASTIKAN default-nya false
  isAuthenticated: false,

  // nanti kalau sudah ada API beneran, kamu bisa ganti logic di sini
  login: () => set({ isAuthenticated: true }),

  logout: () => {
    // kalau suatu saat kamu simpan token di localStorage / cookie, bisa dibersihkan di sini
    set({ isAuthenticated: false });
  },
}));
