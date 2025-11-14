import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { ASSETS } from "../utils/assets";

function CTAButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a href="#mulai"
        className="inline-flex items-center gap-2 bg-white text-blue-700 font-medium px-4 py-2 rounded-full shadow hover:-translate-y-0.5 transition">
        Mulai Tracking →
      </a>
      <a href="#misi"
        className="inline-flex items-center gap-2 border border-white/60 text-white font-medium px-4 py-2 rounded-full hover:bg-white/10 transition">
        Pelajari Lebih Lanjut
      </a>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-b from-blue-50 to-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <img src={icon} alt={title} className="w-12 h-12 object-contain" />
        <div>
          <div className="font-semibold">{title}</div>
          <p className="text-xs text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="bg-slate-50">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500">
        <div className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-2 gap-8 items-center text-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              Smart Academic <br /> Planner
            </h1>
            <div className="mt-4 text-3xl md:text-4xl font-extrabold text-yellow-300">
              Siap Bantu <br /> Masa Studi Kuliahmu
            </div>
            <p className="mt-4 text-white/90 max-w-xl">
              Sistem rekomendasi rencana studi berbasis nilai & minat. Analisis cerdas untuk saran
              mata kuliah paling sesuai tiap semester.
            </p>
            <div className="mt-6"><CTAButtons /></div>
          </div>

          <div className="relative">
            <img src={ASSETS.hero} alt="Hero" className="w-full max-w-md mx-auto drop-shadow-xl" />
            {/* dekor gelombang */}
            <img src={ASSETS.cloud} alt="" className="pointer-events-none select-none absolute -bottom-10 -left-16 w-56 opacity-60" />
            <img src={ASSETS.cloud} alt="" className="pointer-events-none select-none absolute -bottom-14 right-0 w-72 opacity-40" />
          </div>
        </div>

        {/* wave footer hero */}
        <svg className="text-slate-50" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,64L60,74.7C120,85,240,107,360,112C480,117,600,107,720,96C840,85,960,75,1080,69.3C1200,64,1320,64,1380,64L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"/>
        </svg>
      </section>

      {/* MISI KAMI */}
      <section id="misi" className="mx-auto max-w-6xl px-4 py-12 grid md:grid-cols-[320px_1fr] gap-8">
        <div className="flex items-center justify-center">
          <img src={ASSETS.target} alt="Target" className="w-72 drop-shadow-lg" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-blue-800 mb-3">Misi Kami !</h2>
          <p className="text-slate-700 leading-relaxed">
            Smart Academic Planner adalah sistem rekomendasi berbasis data yang membantu mahasiswa
            menentukan mata kuliah terbaik untuk semester berikutnya berdasarkan performa akademik
            dan minat yang dimiliki.
          </p>

          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={ASSETS.people}
              title="Rekomendasi Otomatis"
              desc="Menganalisis nilai & minat untuk memberi saran rencana studi yang pas."
            />
            <FeatureCard
              icon={ASSETS.chart}
              title="Visualisasi Performa"
              desc="Grafik perkembangan akademik agar mudah memantau hasil belajarmu."
            />
            <FeatureCard
              icon={ASSETS.heroAlt}
              title="Panduan Akademik"
              desc="Tips memilih mata kuliah sesuai kemampuan dan tujuan."
            />
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-8">
            Ketahui Cara Kerja Kami
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <img src={ASSETS.heroAlt} alt="" className="w-64 md:justify-self-end drop-shadow-xl" />
            <div>
              <h3 className="text-xl font-semibold">Isi Data Nilai dan Minat</h3>
              <p className="text-white/90 mt-1">
                Inputkan nilai akademik dari semester sebelumnya serta pilih bidang minat yang ingin
                dikembangkan sebagai dasar analisis.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
            <div className="order-2 md:order-1">
              <h3 className="text-xl font-semibold">Sistem Menganalisis Profil Kamu</h3>
              <p className="text-white/90 mt-1">
                Algoritma cerdas mengenali pola kemampuan & preferensi belajar untuk tiap mahasiswa.
              </p>
            </div>
            <img src={ASSETS.people} alt="" className="order-1 md:order-2 w-64 md:justify-self-start drop-shadow-xl" />
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img src={ASSETS.gift} alt="" className="w-64 md:justify-self-end drop-shadow-xl" />
            <div>
              <h3 className="text-xl font-semibold">Terima Rencana Studi</h3>
              <p className="text-white/90 mt-1">
                Rekomendasi mata kuliah paling sesuai lengkap dengan alasan & tingkat relevansinya
                terhadap profilmu.
              </p>
              <a href="#mulai" className="inline-block mt-3 px-4 py-2 rounded bg-yellow-300 text-blue-900 font-semibold hover:bg-yellow-200">
                Riwayat Rencana Studi
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
