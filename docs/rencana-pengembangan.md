# Rencana Pengembangan — Pythonin

Dokumen ini memuat rencana kerja, arsitektur teknis, dan tahapan implementasi media pembelajaran Python interaktif untuk siswa kelas X SMK RPL. Dokumen ini menjadi rujukan kerja resmi tim pengembang.

---

## 1. Keputusan yang Disepakati

Berdasarkan tinjauan awal dan sesi kickoff, disepakati keputusan-keputusan kunci berikut:

1. **Sumber Kebenaran Tunggal (*Single Source of Truth*):**
   - File aktual di folder `content/` (`bab-N.json`, `kuis-bab-N.json`, dan `tantangan-bab-N.json`) adalah sumber kebenaran skema data dan isi pembelajaran karena telah lolos 90 pengujian pada skrip verifikasi.
   - Spesifikasi pada `PRD.md` dan tipe data aplikasi diselaraskan penuh dengan struktur `content/`.
2. **Strategi `input()`:**
   - Seluruh materi dan tantangan kurikulum SMK di `content/` menggunakan **simulasi masukan lewat inisialisasi variabel** di awal kode (misalnya `jajan_1 = 8000`).
   - Editor koding **tidak wajib mendukung fungsi `input()` interaktif asli** pada rilis versi ini.
   - Jika siswa menjalankan kode yang memanggil fungsi `input()`, editor menampilkan pesan ramah bahwa masukan program disimulasikan melalui variabel.
3. **Pemuatan Runtime Pyodide:**
   - Pyodide dimuat dari **CDN jsDelivr** dengan versi dipin secara **lazy** saat komponen editor pertama kali dibuka (di `/materi/[bab]` atau `/latihan`).
   - Di beranda (`/`), pemuatan ditunda untuk menjaga kecepatan waktu muat awal (target I-2). Pemuatan via CDN menjaga ukuran repositori tetap ringan dan mempercepat deployment ke Vercel.
4. **Isolasi Eksekusi & Timeout:**
   - Python dieksekusi di dalam **Web Worker** terpisah agar tab browser tidak membeku.
   - Diterapkan **hard timeout 5 detik** di main thread. Jika terjadi perulangan tak hingga (`while True: pass`), worker langsung dimatikan via `worker.terminate()`, pesan edukatif ditampilkan, dan worker baru diinisialisasi secara transparan.
5. **Inisialisasi Proyek Next.js:**
   - Gunakan `create-next-app` versi terbaru (App Router, TypeScript, Tailwind CSS, ESLint, `src/` directory, alias import `@/*`) di folder sementara, lalu salin hasilnya ke folder utama tanpa menimpa `PRD.md`, `docs/`, `content/`, `scripts/`, dan `.gitignore` (gabungkan `.gitignore` dengan hati-hati, pertahankan `node_modules/`, `.next/`, `.env*`, dan `!.env.example`). Konfigurasi tidak boleh ditulis tangan dari nol. Hapus folder sementara setelah selesai.
6. **Footer Identitas Pembuat:**
   - Seluruh halaman wajib menampilkan teks persis:
     > `"Dibuat oleh Muhammad Nabil Cahya Firdaus (2604130156) dan Caesar Abrisam Ghanim Abbad (2604130063)"`
   - Diletakkan pada layout root (`app/layout.tsx`) sehingga otomatis tampil di semua route termasuk halaman 404.
7. **Chatbot Tutor Gemini:**
   - Berjalan melalui Route Handler Next.js (`POST /api/chat`) di sisi server.
   - Kunci API (`GEMINI_API_KEY`) disimpan di variabel lingkungan server (bukan client).
   - Mode tutor: hanya memberikan petunjuk bertahap, menolak memberi jawaban kode lengkap secara langsung, dan menolak topik di luar Python dasar. Jika chatbot error, media inti tetap berfungsi normal.

---

## 2. Struktur Folder yang Disetujui

Struktur folder mengintegrasikan Next.js App Router (di dalam `src/`) bersama konten dan skrip yang sudah ada:

```text
pythonin/
├── content/                     # [SSOT] Konten JSON materi, kuis, dan tantangan (bab 1-5)
│   ├── bab-1.json ... bab-5.json
│   ├── kuis-bab-1.json ... kuis-bab-5.json
│   └── tantangan-bab-1.json ... tantangan-bab-5.json
├── docs/                        # Dokumentasi kurikulum dan rencana pengembangan
│   ├── outline-bab.md
│   └── rencana-pengembangan.md
├── scripts/                     # Skrip otomasi & verifikasi
│   └── verifikasi_konten.py
├── PRD.md                       # Product Requirements Document
├── public/                      # File statis publik & Web Worker Pyodide
│   └── workers/
│       └── pyodide.worker.js
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Layout global (Navbar + Footer identitas pembuat)
│   │   ├── page.tsx             # Beranda (Hero, 5 kartu bab/misi)
│   │   ├── not-found.tsx        # Halaman 404 (tetap menyertakan Footer)
│   │   ├── materi/
│   │   │   ├── page.tsx         # Daftar 5 bab / misi
│   │   │   └── [bab]/
│   │   │       └── page.tsx     # Materi per bab (1–5)
│   │   ├── latihan/
│   │   │   └── page.tsx         # Playground editor bebas & daftar tantangan
│   │   ├── kuis/
│   │   │   └── [bab]/
│   │   │       └── page.tsx     # Kuis per bab (soal bertahap, skor, pembahasan)
│   │   ├── progress/
│   │   │   └── page.tsx         # Ringkasan progres belajar & tombol reset
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts     # Route handler proxy Gemini API (aman di server)
│   ├── components/              # Komponen antarmuka modular
│   │   ├── layout/              # Navbar, Footer (identitas pembuat), Container
│   │   ├── editor/              # CodeMirror wrapper, SymbolBar (HP), OutputPanel, ErrorPanel
│   │   ├── materi/              # ObjectiveCard, LessonSection, PracticeEditor, GlossaryList
│   │   ├── tantangan/           # ChallengeCard, HintAccordion, ResultCard
│   │   ├── kuis/                # QuizCard, OptionButton, QuizResult
│   │   ├── progress/            # ProgressSummary, ResetModal, SharedDeviceBanner
│   │   └── chat/                # ChatWidget, ChatDrawer, PromptNotice
│   ├── lib/                     # Utilitas dan logika bisnis
│   │   ├── pyodide/             # Singleton runner, Web Worker bridge, timeout controller
│   │   ├── content.ts           # Loader server-side untuk membaca content/*.json
│   │   ├── progress.ts          # Store localStorage, validasi skema, fallback memori
│   │   ├── error-friendly.ts    # Parser error ramah Indonesia & detektor kutip melengkung
│   │   └── gemini.ts            # Client Gemini server-side & system instruction
│   └── types/                   # Definisi tipe data TypeScript
│       ├── content.ts           # Interface Bab, Bagian, Kuis, Tantangan
│       ├── progress.ts          # Interface struktur progress belajar
│       └── runner.ts            # Interface pesan worker & hasil eksekusi
├── .env.example                 # Contoh template variabel lingkungan
├── .gitignore                   # Menjaga node_modules, .next, .env*
├── package.json                 # Manajemen dependensi dan skrip npm
├── tsconfig.json                # Konfigurasi TypeScript
├── tailwind.config.ts           # Konfigurasi Tailwind CSS
├── postcss.config.mjs           # Konfigurasi PostCSS
└── next.config.ts               # Konfigurasi Next.js & CSP header
```

---

## 3. Daftar Komponen dan Tanggung Jawabnya

1. **`Navbar` (`src/components/layout/Navbar.tsx`):**
   - Navigasi utama (`Materi`, `Latihan`, `Progress`), penanda route aktif, dan menu hamburger mobile (target sentuh ≥ 44×44 px).
2. **`Footer` (`src/components/layout/Footer.tsx`):**
   - Menampilkan teks identitas pembuat: *"Dibuat oleh Muhammad Nabil Cahya Firdaus (2604130156) dan Caesar Abrisam Ghanim Abbad (2604130063)"* di seluruh halaman.
3. **`CodeEditor` (`src/components/editor/CodeEditor.tsx`):**
   - Pembungkus CodeMirror 6 dengan tema gelap, nomor baris, auto-indent 4 spasi setelah `:`, auto-close brackets, dan font ≥ 16 px pada mobile untuk mencegah auto-zoom.
4. **`SymbolBar` (`src/components/editor/SymbolBar.tsx`):**
   - Bilah tombol simbol bantu di atas editor khusus layar mobile (≤ 768 px): `:`, `( )`, `" "`, `' '`, `Tab` (4 spasi), `#`, `=`, `_` dengan target sentuh ≥ 44×44 px.
5. **`OutputPanel` & `ErrorPanel` (`src/components/editor/OutputPanel.tsx`, `ErrorPanel.tsx`):**
   - `OutputPanel`: Menampilkan hasil cetak stdout sebagai teks murni (mencegah XSS).
   - `ErrorPanel`: Menampilkan terjemahan error ramah bahasa Indonesia, nomor baris yang salah, peringatan kutip melengkung, serta tombol lipat untuk traceback asli.
6. **`ObjectiveCard` (`src/components/materi/ObjectiveCard.tsx`):**
   - Menampilkan kartu "Tujuan Pembelajaran" dan "Prasyarat" di bagian paling atas sebelum materi bab dimulai.
7. **`LessonSection` (`src/components/materi/LessonSection.tsx`):**
   - Merender alur materi lengkap: penjelasan konsep, analogi kehidupan SMK, contoh kode interaktif (dengan tombol Run), penjelasan kode per baris, catatan umum salah, dan coba sendiri.
8. **`ChallengeCard` (`src/components/tantangan/ChallengeCard.tsx`):**
   - Menampilkan narasi cerita, instruksi, editor tantangan, tombol **Periksa** (evaluasi terhadap `output_diharapkan`), tombol **Run** (uji coba mandiri), serta status kelulusan (ikon + teks).
9. **`HintAccordion` (`src/components/tantangan/HintAccordion.tsx`):**
   - Menyajikan 3 tingkatan petunjuk bertahap yang dibuka berurutan satu per satu.
10. **`QuizCard` & `QuizResult` (`src/components/kuis/QuizCard.tsx`, `QuizResult.tsx`):**
    - `QuizCard`: Menampilkan 1 soal per layar, posisi opsi teracak, evaluasi instan saat opsi diklik, serta pembahasan edukatif dan petunjuk.
    - `QuizResult`: Rekap perolehan skor akhir, evaluasi jawaban, tombol ulangi kuis, dan navigasi ke bab berikutnya.
11. **`ProgressSummary` & `ResetModal` (`src/components/progress/ProgressSummary.tsx`, `ResetModal.tsx`):**
    - Ringkasan bab yang telah selesai, tantangan yang lulus, dan riwayat skor kuis dari `localStorage`.
    - Banner peringatan laptop bersama dan modal konfirmasi untuk menghapus seluruh progres.
12. **`ChatWidget` (`src/components/chat/ChatWidget.tsx`):**
    - Widget chatbot melayang di pojok kanan-bawah dengan disclaimer privasi, pembatasan karakter (≤ 500 karakter), dan toggle opsional "Sertakan kode saya".

---

## 4. Daftar Tahap Pengerjaan dan Definition of Done (DoD)

### Tahap 1: Inisialisasi Proyek, Layout Global, dan Footer Pembuat
- **Tujuan:** Kerangka aplikasi Next.js yang rapi, bisa dijalankan, dan memiliki layout global lengkap. Beranda hanya menampilkan Hero dan 5 kartu bab dari `content/` (tanpa MiniEditor).
- **DoD:**
  1. `npm run build` dan `npm run lint` sukses tanpa error TypeScript/ESLint.
  2. `python scripts/verifikasi_konten.py` tetap lolos 90 pengecekan (100% hijau).
  3. Seluruh route (`/`, `/materi`, `/materi/[bab]`, `/latihan`, `/kuis/[bab]`, `/progress`, dan `404`) dapat dibuka.
  4. Footer berisi nama dan NIM kedua pembuat tampil 100% di semua route.
  5. Navbar responsif berfungsi baik di desktop maupun layar HP (360 px).

### Tahap 2: Engine Eksekusi Python (Pyodide Worker) & Komponen Editor
- **Tujuan:** Eksekusi kode Python yang stabil, aman, cepat, dan ramah pengguna di browser. Inti pengerjaan: tombol Run, penangkapan output, timeout 5 detik, bilah tombol simbol (`SymbolBar`), dan pesan error ramah.
- **DoD:**
  1. Eksekusi `print("Halo, dunia!")` menghasilkan output di layar.
  2. Eksekusi loop tak hingga (`while True: pass`) berhenti otomatis dalam ≤ 5 detik tanpa membekukan halaman, dan editor siap digunakan kembali.
  3. Terjemahan error ramah bahasa Indonesia mencakup minimal 8 jenis error (SyntaxError, NameError, IndentationError, TypeError, ValueError, ZeroDivisionError, EOFError, Timeout).
  4. Kutip melengkung (`“ ”`) terdeteksi sebelum/saat eksekusi dengan pesan edukatif.
  5. Tombol `SymbolBar` di mobile (360 px) berfungsi menyisipkan karakter di posisi kursor.
  6. *(Opsional jika waktu cukup)* Mode baca (M15) jika Pyodide gagal dimuat (network diblokir), serta MiniEditor di beranda.

### Tahap 3: Halaman Materi 5 Bab (Integrasi `content/bab-N.json`)
- **Tujuan:** 5 bab materi pembelajaran terbaca utuh dan dapat dijalankan secara interaktif.
- **DoD:**
  1. Kelima bab dapat diakses melalui `/materi` dan `/materi/[1-5]`.
  2. Urutan komponen per bab tampil lengkap: Tujuan Pembelajaran → Prasyarat → Bagian Materi (Penjelasan, Analogi, Contoh Kode Runnable, Penjelasan Kode, Catatan Salah, Coba Sendiri) → Latihan Editor → Poin Penting → Glosarium Istilah.
  3. Seluruh contoh kode pada 5 bab dapat dijalankan dan menghasilkan output yang cocok dengan `output_contoh`.
  4. Tidak ada konten materi yang di-hardcode di komponen React (100% dibaca dari `content/`).

### Tahap 4: Sistem Kuis Interaktif (Integrasi `content/kuis-bab-N.json`)
- **Tujuan:** Kuis per bab dapat dikerjakan, dievaluasi instan, dan memiliki pembahasan mendalam.
- **DoD:**
  1. Halaman `/kuis/[1-5]` menampilkan 5 soal per bab, satu soal per layar dengan opsi teracak.
  2. Jawaban diperiksa langsung saat diklik; pembahasan dan petunjuk tampil.
  3. Skor akhir terhitung akurat berdasarkan `jawaban_benar` (indeks 0–3).
  4. Pengecekan jawaban tetap akurat setelah opsi diacak (diuji untuk skenario semua benar, semua salah, dan campuran).
  5. Kuis dapat diulang tanpa batas dan riwayat skor tersimpan.

### Tahap 5: Sistem Tantangan Koding & Progress Belajar (Integrasi `content/tantangan-bab-N.json`)
- **Tujuan:** Evaluasi otomatis tantangan koding dan pencatatan progres mandiri siswa.
- **DoD:**
  1. Tombol **Periksa** memvalidasi kode tantangan terhadap `output_diharapkan` dengan normalisasi spasi/baris; jawaban benar menghasilkan status Lolos (ikon + teks hijau).
  2. Tiga tingkat petunjuk bertahap terbuka satu per satu.
  3. Progres belajar tersimpan di `localStorage` (`pythonin:v1:progress`).
  4. Lulus 4 skenario ketahanan data: key kosong, JSON rusak, versi tak dikenal, dan ID bab tak ada (tidak menyebabkan layar putih).
  5. Halaman `/progress` merangkum status bab dan tantangan secara akurat; tombol Reset berfungsi setelah konfirmasi.

### Tahap 6: Chatbot Tutor Gemini (Mode Petunjuk via API Route)
- **Tujuan:** Asisten tutor AI yang aman, edukatif, dan tidak merusak alur belajar.
- **DoD:**
  1. Pertanyaan konsep Python dijawab ringkas (≤ 120 kata) dan ramah.
  2. Uji prompt permintaan jawaban ("berikan kodenya", "apa jawaban tantangan ini") ditolak dengan sopan dan hanya dibalas pertanyaan pemandu/petunjuk konsep.
  3. Topik di luar materi Python dasar ditolak dengan sopan.
  4. `GEMINI_API_KEY` hanya ada di server, tidak pernah bocor ke bundle client.
  5. Jika API key dikosongkan atau kuota habis, media pembelajaran inti tetap berfungsi 100% tanpa gangguan.

### Tahap 7: Polish, Aksesibilitas, Verifikasi Final, & Persiapan Produksi
- **Tujuan:** Aplikasi siap digunakan dan didemokan tanpa kendala.
- **DoD:**
  1. Lolos audit kontras WCAG AA (≥ 4.5:1) dan navigasi keyboard (Esc lalu Tab untuk keluar dari editor).
  2. Uji responsif 360 px berjalan mulus tanpa scroll horizontal.
  3. Skrip `python scripts/verifikasi_konten.py` tetap lolos 90 pengecekan (100% hijau).
  4. Build produksi `npm run build` sukses tanpa warning linter/TypeScript.

---

## 5. Risiko Teknis dan Penanganannya

| # | Risiko Teknis | Dampak | Mitigasi |
|---|---|---|---|
| 1 | **Unduhan Pyodide lambat di HP/jaringan lemah** | Siswa mengira aplikasi macet saat membuka editor | Muat secara *lazy* hanya saat editor pertama kali dibuka; tampilkan indikator loading jelas; sediakan Mode Baca statis (M15) jika koneksi gagal. |
| 2 | **Loop tak hingga membekukan browser (`while True: pass`)** | Tab browser crash atau harus ditutup paksa | Jalankan Python di Web Worker terpisah; pasang hard timeout 5 detik; hentikan via `worker.terminate()` dan buat worker baru otomatis. |
| 3 | **Penyimpangan skema konten JSON vs komponen UI** | Runtime error atau halaman putih (*blank screen*) | Kunci folder `content/` sebagai SSOT; tulis tipe data TypeScript yang mengacu persis ke field `content/`; validasi berkala via `scripts/verifikasi_konten.py`. |
| 4 | **Kebocoran API key Gemini ke bundle browser** | Kuota API dicuri dan disalahgunakan | Simpan API key di server environment variable (`GEMINI_API_KEY`, tanpa awalan `NEXT_PUBLIC_`); batasi akses hanya melalui API Route Next.js. |
| 5 | **Kutip melengkung dari keyboard HP menyebabkan error** | Pemula frustrasi dengan `SyntaxError` yang membingungkan | Pasang atribut `autocorrect="off"` pada editor; deteksi karakter `“ ” ‘ ’` sebelum eksekusi dan beri pesan ramah; sediakan bilah tombol simbol `SymbolBar`. |

---

## 6. Tabel Status Tahap

| Tahap | Keterangan | Status | Tanggal Selesai | Commit |
|---|---|---|---|---|
| **0. Persiapan** | Pembacaan PRD, sinkronisasi skema konten, verifikasi script, penyusunan rencana | **Selesai** | 2026-10-06 | a795a6c |
| **Tahap 1** | Inisialisasi Proyek, Layout Global, dan Footer Pembuat | **Selesai** | 2026-10-06 | diisi di commit berikutnya |
| **Tahap 2** | Engine Eksekusi Python (Pyodide Worker) & Komponen Editor | Belum | — | — |
| **Tahap 3** | Halaman Materi 5 Bab (Integrasi `content/bab-N.json`) | Belum | — | — |
| **Tahap 4** | Sistem Kuis Interaktif (Integrasi `content/kuis-bab-N.json`) | Belum | — | — |
| **Tahap 5** | Sistem Tantangan Koding & Progress Belajar (Integrasi `content/tantangan-bab-N.json`) | Belum | — | — |
| **Tahap 6** | Chatbot Tutor Gemini (Mode Petunjuk via API Route) | Belum | — | — |
| **Tahap 7** | Polish, Aksesibilitas, Verifikasi Final, & Persiapan Produksi | Belum | — | — |
