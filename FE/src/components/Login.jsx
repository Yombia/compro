// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import heroLogin from "../assets/PROPLOG.png";
import cloud from "../assets/white-cloud 5.png";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme"; // sync theme from landing

// Simple schema for form validation
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export default function Login() {
  // Sync theme to <html> class (dark/light mode)
  useTheme();

  const navigate = useNavigate();
  const { login } = useAuthStore(); // Access login action from the store
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    const email = values.email.toLowerCase();
    const isMahasiswa = email.includes("student");

    // Simpan data login ke store
    login({
      email,
      role: isMahasiswa ? "mahasiswa" : "dosen",
    });

    // Routing berdasarkan role login → SESUAI ROUTER DI App.jsx
    if (isMahasiswa) {
      navigate("/dashboard", { replace: true });        // dashboard mahasiswa
    } else {
      navigate("/dashboard-dosen", { replace: true });  // dashboard dosen
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4
                 bg-gradient-to-b from-[#0A4EC0] to-[#E6F4FF] text-slate-900
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Left side: text + form */}
        <div className="space-y-10">
          {/* Welcome text */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[#FACC15]">
              Holla,
              <br />
              Selamat Datang
            </h1>
            <p className="text-sm md:text-base mt-4 text-slate-800 dark:text-slate-200">
              Sudah siap atur rencana studimu?
              <br />
              Masuk Sekarang!
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Masukan Email SSO"
                className="w-full rounded-full px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password + toggle show */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukan Kata Sandi SSO"
                  className="w-full rounded-full px-4 py-3 pr-16 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-4 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#0052FF] to-[#0040C9] py-3 text-sm md:text-base font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.6)] hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Right side: Illustration + clouds */}
        <div className="relative flex justify-center md:justify-end mt-8 md:mt-0">
          <div className="relative w-[260px] md:w-[360px] lg:w-[420px]">
            {/* Cloud illustrations */}
            <img
              src={cloud}
              alt="Cloud"
              className="pointer-events-none select-none absolute -top-10 left-6 w-24 md:w-28 opacity-90"
            />
            <img
              src={cloud}
              alt="Cloud"
              className="pointer-events-none select-none absolute -bottom-12 right-2 w-28 md:w-36 opacity-95"
            />
            {/* Main login illustration */}
            <img
              src={heroLogin}
              alt="Smart Academic Planner login"
              className="relative w-full h-auto drop-shadow-[0_24px_60px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
