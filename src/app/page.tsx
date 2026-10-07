import Link from 'next/link';
import {
  getAllBabSummaries,
  getKuisByBab,
  getTantanganByBab,
  getBabById,
} from '@/lib/content';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import HeroCodeDemo from '@/components/ui/HeroCodeDemo';
import HomeProgressBadge from '@/components/ui/HomeProgressBadge';
import HomeProgressBanner from '@/components/ui/HomeProgressBanner';

export default function HomePage() {
  // 100% data dihitung dari SSOT content/
  const summaries = getAllBabSummaries();

  const babList = summaries.map((bab) => {
    const kuis = getKuisByBab(bab.nomor);
    const tantangan = getTantanganByBab(bab.nomor);
    return {
      ...bab,
      jumlah_soal: kuis ? kuis.soal.length : 0,
      jumlah_tantangan: tantangan ? tantangan.tantangan.length : 0,
    };
  });

  const totalMisi = babList.length;
  const totalTantangan = babList.reduce((acc, curr) => acc + curr.jumlah_tantangan, 0);
  const totalSoal = babList.reduce((acc, curr) => acc + curr.jumlah_soal, 0);

  // Ambil contoh kode dan output asli dari Bab 1
  const bab1 = getBabById(1);
  const contohKode = bab1?.bagian[0]?.contoh_kode ?? 'print("Halo, selamat datang di Python!")';
  const outputContoh = bab1?.bagian[0]?.output_contoh ?? 'Halo, selamat datang di Python!';

  // Varian warna badge kartu misi sebagai penanda dekoratif
  const badgeVariants: Array<'blue' | 'emerald' | 'amber' | 'purple' | 'rose'> = [
    'blue',
    'emerald',
    'amber',
    'purple',
    'rose',
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero Section dengan Dekorasi SVG Halus */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 p-6 sm:p-10 lg:p-12 shadow-xs">
        {/* Dekorasi Visual SVG Latar Belakang (Inline, Ringan, Tanpa Gambar Eksternal) */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
        <svg
          className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 text-blue-600/5 opacity-80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1" />
          <path d="M70 90L50 100L70 110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M130 90L150 100L130 110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M105 85L95 115" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Sisi Kiri: Narasi dan Call to Action */}
          <div className="text-left lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/90 px-3.5 py-1 text-xs sm:text-sm font-bold text-blue-900 mb-5 border border-blue-200/60 shadow-xs">
              <span aria-hidden="true">🚀</span>
              <span>Khusus Siswa SMK RPL Kelas X</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Taklukkan Pemrograman Python Lewat <span className="text-blue-600">5 Misi Nyata</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl">
              Media belajar dasar pemrograman Python yang praktis, ramah pemula, dan terstruktur. Mulai dari nol, taklukkan tantangan kode, dan bangun pondasi koding yang kuat.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
              <span aria-hidden="true">⚡</span>
              <span>Tanpa instalasi, langsung di browser</span>
            </div>

            {/* Statistik Riil dari SSOT content/ */}
            <div className="mt-7 grid grid-cols-3 gap-1.5 sm:gap-3 max-w-md border-y border-slate-200/80 py-4">
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-3xl font-extrabold text-blue-600">
                  {totalMisi}
                </div>
                <div className="text-[11px] sm:text-sm font-medium text-slate-600 leading-tight mt-0.5">
                  Misi Belajar
                </div>
              </div>
              <div className="text-center sm:text-left border-x border-slate-200 px-1.5 sm:px-4">
                <div className="text-xl sm:text-3xl font-extrabold text-blue-600">
                  {totalTantangan}
                </div>
                <div className="text-[11px] sm:text-sm font-medium text-slate-600 leading-tight mt-0.5">
                  Tantangan Koding
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xl sm:text-3xl font-extrabold text-blue-600">
                  {totalSoal}
                </div>
                <div className="text-[11px] sm:text-sm font-medium text-slate-600 leading-tight mt-0.5">
                  Soal Kuis
                </div>
              </div>
            </div>

            {/* Tombol Aksi Utama */}
            <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
              <Button href="/materi/1" variant="primary" size="lg" className="w-full sm:w-auto">
                <span>Mulai Misi 1</span>
                <span aria-hidden="true" className="ml-2">&rarr;</span>
              </Button>
              <Button href="/materi" variant="outline" size="lg" className="w-full sm:w-auto">
                Lihat Semua Materi
              </Button>
            </div>
          </div>

          {/* Sisi Kanan: Panel Kode Interaktif Ringan */}
          <div className="lg:col-span-5 w-full">
            <HeroCodeDemo contohKode={contohKode} outputContoh={outputContoh} />
          </div>
        </div>
      </section>

      {/* Bagian Jalur 5 Misi Pembelajaran */}
      <section className="mt-14 sm:mt-20">
        {/* Banner Progres Aktif jika siswa sudah mulai belajar */}
        <HomeProgressBanner />

        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 mb-3 border border-slate-200">
            <span>🗺️</span>
            <span>Rute Perjalanan Belajar</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Jalur Petualangan 5 Misi
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Setiap misi dirancang saling berkesinambungan untuk membentuk pemahaman yang kokoh.
          </p>
        </div>

        {/* Jalur Peta Alur Visual (Desktop Timeline Bar) */}
        <div className="hidden md:flex items-center justify-between max-w-4xl mx-auto mb-12 px-6" aria-hidden="true">
          {babList.map((bab, index) => (
            <div key={bab.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                  {bab.nomor}
                </span>
                <span className="mt-1.5 text-xs font-semibold text-slate-600">
                  Misi {bab.nomor}
                </span>
              </div>
              {index < babList.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-blue-500 to-blue-200 border-t border-dashed border-blue-400" />
              )}
            </div>
          ))}
        </div>

        {/* Daftar Kartu Misi dengan Jalur Konektor Visual Mobile & Desktop */}
        <div className="relative">
          {/* Jalur Konektor Garis Vertikal Khusus Mobile */}
          <div
            className="md:hidden absolute left-7 top-6 bottom-6 w-0.5 border-l-2 border-dashed border-blue-300"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {babList.map((bab, index) => {
              const variant = badgeVariants[index % badgeVariants.length];

              return (
                <div
                  key={bab.id}
                  className="relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-300 pl-14 md:pl-6"
                >
                  {/* Pin Node Nomor Misi (Konektor di Layar Mobile) */}
                  <div
                    className="md:hidden absolute left-4 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs ring-4 ring-white"
                    aria-hidden="true"
                  >
                    {bab.nomor}
                  </div>

                  <div>
                    {/* Header Kartu: Badge Misi & Durasi Nyata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={variant} size="sm">
                          Misi {bab.nomor}
                        </Badge>
                        <HomeProgressBadge babNomor={bab.nomor} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        ⏱️ {bab.durasi_menit} menit
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {bab.judul}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {bab.ringkasan}
                    </p>

                    {/* Metrik Nyata Bab dari content/ */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                        🧩 {bab.jumlah_tantangan} Tantangan
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
                        📝 {bab.jumlah_soal} Soal Kuis
                      </span>
                    </div>
                  </div>

                  {/* Tombol Akses Misi */}
                  <div className="mt-5 pt-3">
                    <Link
                      href={`/materi/${bab.nomor}`}
                      className="inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-100 text-slate-800 hover:bg-blue-600 hover:text-white min-h-[44px] w-full text-xs sm:text-sm"
                    >
                      <span>Buka Materi Misi {bab.nomor}</span>
                      <span aria-hidden="true" className="ml-1.5">&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
