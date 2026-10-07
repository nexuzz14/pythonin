export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 mb-3 border border-slate-200">
          <span>🎓</span>
          <span>Media Pembelajaran SMK RPL Kelas X</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
          Dibuat oleh Muhammad Nabil Cahya Firdaus (2604130156) dan Caesar Abrisam Ghanim Abbad (2604130063)
        </p>
      </div>
    </footer>
  );
}
