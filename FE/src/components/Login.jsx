// src/components/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import heroLogin from "../assets/PROPLOG.png";
import cloud from "../assets/white-cloud 5.png";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme"; // sinkronkan tema dari landing

// Schema sederhana untuk validasi form
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export default function Login() {
  // jalankan hook tema supaya <html> sudah ada/tidak ada class "dark"
  useTheme();

  const navigate = useNavigate();
  const { login } = useAuthStore(); // asumsi store punya action "login"
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
    // TODO: ganti dengan call API beneran kalau sudah siap
    // sementara cukup tandai sudah login di zustand
    login?.(values); // atau login?.(); kalau function-mu tidak butuh argumen
    navigate("/dashboard"); // setelah login langsung ke halaman dashboard
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4
                 bg-gradient-to-b from-[#0A4EC0] to-[#E6F4FF] text-slate-900
                 dark:bg-gradient-to-b dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Kiri: teks + form */}
        <div className="space-y-10">
          {/* Teks sambutan */}
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

          {/* Form login */}
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

            {/* Password + toggle lihat */}
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

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-gradient-to-r from-[#0052FF] to-[#0040C9] py-3 text-sm md:text-base font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.6)] hover:brightness-110 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* Kanan: Ilustrasi + awan dikelompokkan */}
        <div className="relative flex justify-center md:justify-end mt-8 md:mt-0">
          <div className="relative w-[260px] md:w-[360px] lg:w-[420px]">
            {/* Awan atas dekat hero */}
            <img
              src={cloud}
              alt="Cloud"
              className="pointer-events-none select-none absolute -top-10 left-6 w-24 md:w-28 opacity-90"
            />
            {/* Awan bawah dekat hero */}
            <img
              src={cloud}
              alt="Cloud"
              className="pointer-events-none select-none absolute -bottom-12 right-2 w-28 md:w-36 opacity-95"
            />
            {/* Ilustrasi utama login */}
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
