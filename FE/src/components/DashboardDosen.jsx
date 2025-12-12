import { useState } from "react";
import { Link } from "react-router-dom";

export default function DashboardDosen() {
  const [students, setStudents] = useState([
    { name: "Yesi Sukmawati", nim: "1301224570", submissionDate: "12/11/2025", status: "Tertunda" },
    { name: "Jaya Saputra", nim: "1301225555", submissionDate: "10/11/2025", status: "Disetujui" },
    { name: "Dennis Rizky", nim: "1301221289", submissionDate: "10/11/2025", status: "Ditolak" },
    { name: "Gagas Surya", nim: "1301223990", submissionDate: "10/11/2025", status: "Pending" },
  ]);

  return (
    <main
      className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900
                 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50"
    >
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        {/* Sidebar Content */}
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] dark:bg-[#0B1F4B] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">
                Planner
              </p>
            </div>

            <nav className="space-y-4 text-sm font-medium">
              {/* Dashboard Navigation */}
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] bg-[#214A9A] px-4 py-3 shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Dashboard</span>
              </button>

              {/* Other links */}
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Rencana Studi</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Riwayat</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Profil</span>
              </button>
            </nav>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-slate-100/90 hover:text-white flex items-center gap-2"
            >
              <span className="text-lg">↩</span>
              <span>Keluar Akun</span>
            </button>

            <button
              type="button"
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              🌙
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        {/* Greeting */}
        <header className="mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Halo,{" "}
            <span className="font-semibold text-[#FBBF24]">John Doe</span>
          </p>
          <h1 className="text-lg md:text-xl font-semibold mt-1">
            Pantau dan verifikasi rencana studi mahasiswa
          </h1>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">Total Mahasiswa</p>
            <p className="mt-2 text-3xl font-bold">41</p>
          </div>
          <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">Menunggu Validasi</p>
            <p className="mt-2 text-3xl font-bold">10</p>
          </div>
          <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">Formulir Disetujui</p>
            <p className="mt-2 text-3xl font-bold">21</p>
          </div>
          <div className="bg-[#165DFF] text-white px-5 py-4 rounded-2xl shadow-lg">
            <p className="text-xs uppercase tracking-wide text-blue-100">Formulir Ditolak</p>
            <p className="mt-2 text-3xl font-bold">9</p>
          </div>
        </div>

        {/* Students' List Table */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700 mb-8">
          <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[10px]">
              i
            </span>
            <p className="text-sm font-semibold">Daftar mahasiswa yang Mengajukan Rencana Studi</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr className="text-left">
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-4 py-2">NIM</th>
                  <th className="px-4 py-2">Tanggal Pengajuan</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-2">{student.name}</td>
                    <td className="px-4 py-2">{student.nim}</td>
                    <td className="px-4 py-2">{student.submissionDate}</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => handleViewDetails(student.nim)}
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );

  function handleViewDetails(nim) {
    // Navigate to the student details page (could be implemented later)
    console.log("View details for:", nim);
  }

  function getStatusClass(status) {
    switch (status) {
      case "Disetujui":
        return "bg-green-100 text-green-700";
      case "Ditolak":
        return "bg-red-100 text-red-700";
      case "Tertunda":
        return "bg-yellow-100 text-yellow-700";
      case "Pending":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  }
}
