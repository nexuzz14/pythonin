import Link from 'next/link';
import { getAllBabSummaries } from '@/lib/content';

export default function HomePage() {
  const babList = getAllBabSummaries();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Hero Section */}
      <section className="text-center py-6 sm:py-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs sm:text-sm font-semibold text-blue-800 mb-4">
          <span>🚀</span>
          <span>Khusus Siswa SMK RPL Kelas X</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Selamat Datang di <span className="text-blue-600">Pythonin</span>
        </h1>
        
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-700 leading-relaxed">
          Media belajar dasar pemrograman Python yang interaktif, praktis, dan ramah pemula. Langsung jalankan kodemu di browser tanpa perlu instalasi.
        </p>

        {/* Tujuan Belajar */}
        <div className="mx-auto mt-6 max-w-xl rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5 text-left text-sm text-slate-800">
          <h2 className="font-semibold text-blue-900 flex items-center gap-2 mb-2 text-base">
            <span>🎯</span> Tujuan Pembelajaran:
          </h2>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Menulis dan menjalankan program Python dasar secara mandiri.</li>
            <li>Membaca pesan error dengan terjemahan ramah dan memperbaikinya.</li>
            <li>Menyelesaikan tantangan koding nyata langkah demi langkah.</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/materi/1"
            className="flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[160px] w-full sm:w-auto"
          >
            Mulai Misi 1
          </Link>
          <Link
            href="/materi"
            className="flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-slate-400 min-h-[44px] min-w-[160px] w-full sm:w-auto"
          >
            Lihat Semua Materi
          </Link>
        </div>
      </section>

      {/* 5 Kartu Bab Section */}
      <section className="mt-12 sm:mt-16">
        <div className="border-t border-slate-200 pt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                5 Misi Pembelajaran
              </h2>
              <p className="mt-1 text-sm sm:text-base text-slate-600">
                Pelajari konsep fundamental secara terstruktur dari Misi 1 hingga Misi 5.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Total {babList.length} Bab Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {babList.map((bab) => (
              <div
                key={bab.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-blue-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                      Misi {bab.nomor}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      ⏱️ {bab.durasi_menit} menit
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                    {bab.judul}
                  </h3>

                  <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {bab.ringkasan}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/materi/${bab.nomor}`}
                    className="flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-blue-600 hover:text-white min-h-[44px]"
                  >
                    Buka Materi Misi {bab.nomor} &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
