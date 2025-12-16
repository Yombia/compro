import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearApiCache } from "../api/api";

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      role: null, // mahasiswa | dosen
      user: null,

      login: (userData) =>
        set({
          isAuthenticated: true,
          role: userData.role,
          user: userData,
        }),

      logout: () => {
        // Hapus auth_token dari localStorage
        localStorage.removeItem('auth_token');
        clearApiCache();
        // Reset state
        set({ isAuthenticated: false, role: null, user: null });
      },
    }),
    {
      name: "auth-storage", // nama key di localStorage
      // Hanya persist fields yang penting
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        role: state.role,
        user: state.user,
      }),
    }
  )
);
