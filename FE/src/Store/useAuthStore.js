import { create } from "zustand";

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  role: null, // mahasiswa | dosen
  user: null,

  login: (userData) =>
    set({
      isAuthenticated: true,
      role: userData.role,
      user: userData,
    }),

  logout: () => set({ isAuthenticated: false, role: null, user: null }),
}));
