import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ASSETS } from "../utils/assets";

const schema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data) => {
    // TODO: sambungkan ke API SSO/Backend kamu
    console.log("Login payload:", data);
    alert("Login dummy sukses. Sambungkan ke API nanti ya.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 relative overflow-hidden">
      {/* clouds dekor */}
      <img src={ASSETS.cloud} className="pointer-events-none select-none absolute -left-10 top-24 w-40 opacity-70" />
      <img src={ASSETS.cloud} className="pointer-events-none select-none absolute right-10 top-16 w-40 opacity-60" />
      <img src={ASSETS.cloud} className="pointer-events-none select-none absolute right-24 bottom-10 w-44 opacity-70" />

      <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-2 gap-10 items-center">
        {/* kiri: teks + form */}
        <div className="text-white">
          {/* Logo placeholder – ganti dengan logo kampus kalau ada */}
          <div className="mb-8">
            <div className="font-semibold leading-tight">
              <div className="text-lg">Fakultas Teknik Elektro</div>
              <div className="text-xs opacity-90">School of Electrical Engineering · Telkom University</div>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold leading-tight">
            <span className="block">Holla,</span>
            <span className="block text-yellow-300">Selamat Datang</span>
          </h1>
          <p className="mt-3 text-white/90">Sudah siap atur rencana studimu?</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4 max-w-md">
            <div>
              <input
                type="email"
                placeholder="Email (SSO)"
                className="w-full rounded-full px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none ring-2 ring-white/50 focus:ring-white"
                {...register("email")}
              />
              {errors.email && <p className="text-yellow-200 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-full px-4 py-2.5 text-slate-900 placeholder-slate-500 outline-none ring-2 ring-white/50 focus:ring-white"
                {...register("password")}
              />
              {errors.password && <p className="text-yellow-200 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <button type="button" className="text-xs text-yellow-200/90 hover:text-yellow-100">
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-yellow-300 text-blue-900 font-semibold py-2.5 hover:bg-yellow-200 disabled:opacity-70"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        {/* kanan: ilustrasi */}
        <div className="relative">
          <img src={ASSETS.login} alt="Login Illustration" className="w-full max-w-xl mx-auto drop-shadow-2xl" />
        </div>
      </div>
    </div>
  );
}
