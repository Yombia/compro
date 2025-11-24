// src/components/Riwayat.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useTheme } from "../hooks/useTheme";

export default function RiwayatPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  // ---------------------------------------------------------------------------
  // DATA DUMMY RIWAYAT
  // ---------------------------------------------------------------------------
  const semesters = [
    {
      id: "2023-2",
      year: "2023",
      label: "Semester 2",
      ipSemester: 4.0,
      totalSks: 18,
      displaySks: 20,
      courses: [
        { name: "Sensor Kabel", sks: 4, grade: "A" },
        { name: "Fisika", sks: 3, grade: "A" },
        { name: "Dasar IoT", sks: 4, grade: "A" },
        { name: "Robotika", sks: 4, grade: "A" },
        { name: "Kalkulus", sks: 3, grade: "A" },
      ],
    },
    {
      id: "2023-1",
      year: "2023",
      label: "Semester 1",
      ipSemester: 3.75,
      totalSks: 20,
      displaySks: 20,
      courses: [
        { name: "Probabilitas dan Statistika", sks: 3, grade: "A" },
        { name: "Persamaan Diferensial", sks: 3, grade: "AB" },
        { name: "Elektromagnetika", sks: 3, grade: "A" },
        { name: "Rangkaian Listrik 2", sks: 3, grade: "A" },
        { name: "Praktikum Rangkaian Listrik", sks: 1, grade: "AB" },
        { name: "Matematika Lanjut", sks: 3, grade: "A" },
        { name: "Logika Digital", sks: 4, grade: "A" },
      ],
    },
    {
      id: "2022-2",
      year: "2022",
      label: "Semester 2",
      ipSemester: 3.6,
      totalSks: 20,
      displaySks: 20,
      courses: [
        { name: "Aljabar Linear", sks: 3, grade: "A" },
        { name: "Sinyal dan Sistem", sks: 3, grade: "AB" },
        { name: "Elektronika Dasar", sks: 3, grade: "A" },
        { name: "Pemrograman Dasar", sks: 3, grade: "A" },
        { name: "Praktikum Elektronika", sks: 1, grade: "AB" },
        { name: "Pengantar Telekomunikasi", sks: 3, grade: "A" },
        { name: "Praktikum Sinyal", sks: 4, grade: "A" },
      ],
    },
  ];

  // ID semester yang sedang dibuka (bisa null = semua ketutup)
  const [expandedId, setExpandedId] = useState(semesters[0].id);

  const toggleSemester = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Stats global (dummy)
  const totalSks = 120;
  const ipk = 3.89;
  const tak = 107;
  const ikk = 3.07;

  const menuButtonBase =
    "w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-sm transition";

  return (
    <main
      className="min-h-screen flex
                 bg-gradient-to-b from-[#0A4EC0] via-[#7AB6FF] to-[#E6F4FF]
                 text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* SIDEBAR – sama seperti dashboard & rencana studi */}
      <aside className="w-64 flex flex-col">
        <div className="flex-1 mx-4 my-6 rounded-[32px] bg-[#0D3B9A] text-white flex flex-col shadow-2xl dark:bg-[#0B1F4B]">
          <div className="pt-8 px-6 pb-4">
            <div className="mb-10">
              <p className="text-sm font-semibold leading-tight">
                Smart Academic
              </p>
              <p className="text-sm font-semibold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/rencana-studi")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Rencana Studi</span>
              </button>

              {/* Riwayat aktif */}
              <button
                type="button"
                className={`${menuButtonBase} bg-[#1E4AAE] shadow-md`}
              >
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="font-semibold">Riwayat</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/profil")}
                className={`${menuButtonBase} text-slate-100/80 hover:bg-[#1E4AAE]/70`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-300/70" />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          <div className="mt-auto px-6 pb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-100/90 hover:text-white flex items-center gap-2"
            >
              <span className="text-lg">↩</span>
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === "dark" ? "Ubah ke mode terang" : "Ubah ke mode gelap"
              }
              className="h-10 w-10 rounded-full bg-[#FACC15] shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </aside>

      {/* KONTEN RIWAYAT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-semibold">
            Riwayat Studi dan Nilai Akademik
          </h1>
        </header>

        {/* Summary SKS / IPK / TAK / IKK */}
        <div
          className="mb-6 rounded-3xl bg-[#0F172A] text-white px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4
                     shadow-[0_18px_40px_rgba(15,23,42,0.75)]
                     dark:bg-[#020617]"
        >
          <div className="flex gap-10 text-sm md:text-base">
            <div>
              <p className="uppercase text-xs tracking-wide text-slate-300">
                SKS
              </p>
              <p className="text-2xl font-bold mt-1">{totalSks}</p>
            </div>
            <div>
              <p className="uppercase text-xs tracking-wide text-slate-300">
                IPK
              </p>
              <p className="text-2xl font-bold mt-1">{ipk}</p>
            </div>
          </div>

          <div className="flex gap-10 text-sm md:text-base">
            <div className="text-right">
              <p className="uppercase text-xs tracking-wide text-slate-300">
                TAK
              </p>
              <p className="text-2xl font-bold mt-1">{tak}</p>
            </div>
            <div className="text-right">
              <p className="uppercase text-xs tracking-wide text-slate-300">
                IKK
              </p>
              <p className="text-2xl font-bold mt-1">{ikk}</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-semibold text-base md:text-lg">
            Periode Semester
          </p>
        </div>

        {/* LIST SEMESTER – tiap card bisa dibuka/tutup */}
        <div className="space-y-4">
          {semesters.map((sem) => {
            const isOpen = expandedId === sem.id;
            return (
              <div
                key={sem.id}
                className={`rounded-[28px] overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.8)]
                ${
                  isOpen
                    ? "bg-[#0F172A]"
                    : "bg-[#0F172A]"
                }`}
              >
                {/* HEADER CARD – klik untuk toggle */}
                <button
                  type="button"
                  onClick={() => toggleSemester(sem.id)}
                  className={`w-full text-left px-7 py-4 flex items-center justify-between text-white text-base md:text-lg transition
                  ${
                    isOpen
                      ? "bg-[#2563EB]"
                      : "bg-transparent hover:bg-[#1E293B]"
                  }`}
                >
                  <div>
                    <p className="font-semibold">{sem.year}</p>
                    <p className="text-sm md:text-base mt-1">{sem.label}</p>
                    {isOpen && (
                      <p className="text-xs md:text-sm mt-1 opacity-90">
                        IP Semester: {sem.ipSemester.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm md:text-base font-semibold">
                    {sem.displaySks} SKS
                  </p>
                </button>

                {/* DETAIL – hanya muncul kalau open */}
                {isOpen && (
                  <div className="px-7 pb-5 pt-3 bg-slate-900 text-white">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs md:text-sm text-left">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="pb-2 pr-4">Mata Kuliah</th>
                            <th className="pb-2 pr-4 w-20">SKS</th>
                            <th className="pb-2 pr-4 w-24">Nilai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sem.courses.map((c) => (
                            <tr
                              key={`${sem.id}-${c.name}`}
                              className="border-b border-slate-800 last:border-0"
                            >
                              <td className="py-2 pr-4">{c.name}</td>
                              <td className="py-2 pr-4">{c.sks}</td>
                              <td className="py-2 pr-4">{c.grade}</td>
                            </tr>
                          ))}
                          <tr className="font-semibold">
                            <td className="pt-3 pr-4">Total SKS</td>
                            <td className="pt-3 pr-4">{sem.totalSks}</td>
                            <td className="pt-3 pr-4" />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
