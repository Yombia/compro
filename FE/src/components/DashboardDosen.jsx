import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardDosen() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([
    {
      name: "Yesi Sukmawati",
      nim: "1301224570",
      submissionDate: "12/11/2025",
      status: "Tertunda",
      ipk: 3.89,
      totalSks: 102,
      interests: ["IoT", "Robotics", "Programming"],
      futureFocus: "startup",
      learningPreference: "project",
    },
    {
      name: "Jaya Saputra",
      nim: "1301225555",
      submissionDate: "10/11/2025",
      status: "Disetujui",
      ipk: 3.85,
      totalSks: 100,
      interests: ["IoT", "Robotics"],
      futureFocus: "industri",
      learningPreference: "konsep",
    },
    {
      name: "Dennis Rizky",
      nim: "1301221289",
      submissionDate: "10/11/2025",
      status: "Ditolak",
      ipk: 3.60,
      totalSks: 90,
      interests: ["Programming", "Networking"],
      futureFocus: "startup",
      learningPreference: "campuran",
    },
    {
      name: "Gagas Surya",
      nim: "1301223990",
      submissionDate: "10/11/2025",
      status: "Pending",
      ipk: 3.50,
      totalSks: 85,
      interests: ["Robotics", "Power System"],
      futureFocus: "s2",
      learningPreference: "project",
    },
  ]);

  const [activeDetail, setActiveDetail] = useState(null);

  const handleLogout = () => {
    navigate("/login");
  };

  const statusConfig = {
    pending: { label: "Pending", badgeClass: "bg-[#FACC15] text-slate-900" },
    delayed: { label: "Tertunda", badgeClass: "bg-[#F97316] text-slate-900" },
    approved: { label: "Disetujui", badgeClass: "bg-emerald-400 text-slate-900" },
    rejected: { label: "Ditolak", badgeClass: "bg-rose-400 text-slate-900" },
  };

  const handleApproveReject = (status, studentId) => {
    const updatedStudents = students.map((student) => {
      if (student.nim === studentId) {
        return { ...student, status };
      }
      return student;
    });
    setStudents(updatedStudents);
    setActiveDetail(null); // Close the modal after updating
  };

  return (
    <main className="min-h-screen flex bg-gradient-to-b from-[#E6F4FF] to-[#F5FAFF] text-slate-900 dark:from-[#020617] dark:via-[#020617] dark:to-[#020617] dark:text-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 flex flex-col px-4">
        <div className="mt-6 mb-6 w-full bg-[#0D3B9A] text-white rounded-[36px] px-6 pt-8 pb-6 shadow-[0_18px_40px_rgba(15,23,42,0.65)] flex flex-col justify-between">
          <div>
            <div className="mb-10">
              <p className="text-lg font-bold leading-tight">Smart Academic</p>
              <p className="text-lg font-bold leading-tight text-[#FACC15]">Planner</p>
            </div>
            <nav className="space-y-4 text-sm font-medium">
              <button
                type="button"
                onClick={() => navigate("/dashboard-dosen")}
                className="w-full flex items-center gap-3 rounded-[999px] bg-[#214A9A] px-4 py-3 shadow-md"
              >
                <span className="h-2 w-2 rounded-full bg-yellow-300" />
                <span>Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/riwayat")}
                className="w-full flex items-center gap-3 rounded-[999px] px-4 py-3 text-slate-100/80 hover:bg-[#214A9A] transition"
              >
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span>Riwayat</span>
              </button>
            </nav>
          </div>
          <div className="mt-10 flex items-center justify-between">
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
              className="h-11 w-11 rounded-full bg-[#FACC15] shadow-[0_12px_30px_rgba(0,0,0,0.45)] flex items-center justify-center text-xl hover:scale-105 transition-transform"
            >
              🌙
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="flex-1 px-10 py-8 overflow-y-auto">
        <header className="mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Halo, <span className="font-semibold text-[#FBBF24]">John Doe</span>
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
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusClass(student.status)}`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => setActiveDetail(student)}
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

      {/* Modal for Student Detail */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[#020617] text-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-700 px-6 py-6 md:px-8 md:py-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-1">
                  Detail Pengajuan Rencana Studi
                </h2>
                <p className="text-xs md:text-sm text-slate-300">
                  Tanggal pengajuan: {activeDetail.submissionDate ?? "-"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetail(null)}
                className="ml-3 text-slate-400 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Student Detail */}
            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">IPK Saat Pengajuan</span>
                <span className="font-semibold">{activeDetail.ipk}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Total SKS Rencana</span>
                <span className="font-semibold">{activeDetail.totalSks} SKS</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Minat Utama</span>
                <span className="font-semibold text-right">
                  {activeDetail.interests.join(", ")}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Fokus Setelah Lulus</span>
                <span className="font-semibold text-right">
                  {activeDetail.futureFocus}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">Gaya Belajar</span>
                <span className="font-semibold text-right">
                  {activeDetail.learningPreference}
                </span>
              </div>
            </div>

            <p className="mt-5 text-[11px] md:text-xs text-slate-400">
              Rencana studi ini disusun berdasarkan data IPK, total SKS, dan preferensi minat yang
              kamu isi pada formulir rencana studi.
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => handleApproveReject("approved", activeDetail.nim)}
                className="rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-7 py-2.5 text-xs md:text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(248,181,0,0.65)] hover:brightness-105 transition"
              >
                Setujui Pengajuan
              </button>
              <button
                type="button"
                onClick={() => handleApproveReject("rejected", activeDetail.nim)}
                className="ml-4 rounded-full bg-gradient-to-r from-[#F97316] to-[#FACC15] px-7 py-2.5 text-xs md:text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(248,181,0,0.65)] hover:brightness-105 transition"
              >
                Tolak Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

  // Helper function for status badges
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
