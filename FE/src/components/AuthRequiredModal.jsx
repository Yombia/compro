import { Link } from "react-router-dom";

export default function AuthRequiredModal({ open, onClose }) {
  if (!open) return null;

  return (
    // OVERLAY PERINGATAN LOGIN
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-[90%] max-w-3xl bg-white/90 rounded-3xl shadow-2xl px-6 py-10 text-center">
        <div className="mx-auto mb-6 flex items-center justify-center h-24 w-24 rounded-full border-[6px] border-amber-400 text-6xl text-amber-500 bg-amber-50">
          !
        </div>
        <p className="text-xl md:text-3xl font-semibold text-slate-800 mb-6">
          Silahkan Masuk Terlebih Dahulu!
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm md:text-base font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            Pergi ke Halaman Masuk
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm md:text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
