export default function Footer() {
  return (
    <footer className="mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-4">
        <div className="text-sm text-slate-600">
          <div className="font-semibold text-slate-900 mb-2">Fakultas Teknik Elektro</div>
          <p>
            Smart Academic Planner membantu menentukan mata kuliah terbaik untuk semester berikutnya.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-2">Navigasi</div>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>Beranda</li>
            <li>Rekomendasi Studi</li>
            <li>Riwayat</li>
            <li>Tentang</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Kontak</div>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>studyacademicplanner@info.id</li>
            <li>+62 812-345-6789</li>
            <li>Jl. Telekomunikasi No. 1, Bandung</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Mulai Rencana Studi</div>
          <p className="text-sm text-slate-600">Dapatkan rekomendasi studi sesuai minat & kemampuan.</p>
          <button className="mt-3 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
            Rekomendasi Studi
          </button>
        </div>
      </div>
      <div className="border-t py-3 text-center text-xs text-slate-500">
        ©2025 Fakultas Teknik Elektro Telkom University
      </div>
    </footer>
  );
}
