import fs from 'fs';
import path from 'path';
import type {
  BabMateri,
  BabSummary,
  KuisBab,
  TantanganBab,
  ItemTantangan,
} from '@/types/content';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Normalisasi id atau nomor bab ke format angka (1..5)
 */
function normalizeBabNumber(babIdOrNumber: string | number): number | null {
  if (typeof babIdOrNumber === 'number') {
    return Number.isInteger(babIdOrNumber) && babIdOrNumber >= 1 && babIdOrNumber <= 5
      ? babIdOrNumber
      : null;
  }

  const cleaned = babIdOrNumber.trim().toLowerCase();
  const match = cleaned.match(/^(?:bab-)?([1-5])$/);
  if (!match) return null;

  const num = parseInt(match[1], 10);
  return num >= 1 && num <= 5 ? num : null;
}

export type BabDetailResult =
  | { status: 'success'; data: BabMateri; babNumber: number }
  | { status: 'not-found'; babParam: string }
  | { status: 'file-not-found'; babNumber: number; filename: string; errorMessage: string }
  | { status: 'corrupt'; babNumber: number; filename: string; errorMessage: string };

/**
 * Validasi skema runtime untuk konten BabMateri.
 * Mengembalikan string pesan error jika tidak sesuai skema, atau null jika valid.
 */
export function validateBabMateri(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Data materi bukan merupakan objek JSON yang valid.';
  }

  const bab = data as Partial<BabMateri>;

  if (typeof bab.id !== 'string' || !bab.id.trim()) {
    return 'Properti "id" bab tidak ditemukan atau bukan teks.';
  }
  if (typeof bab.judul !== 'string' || !bab.judul.trim()) {
    return 'Properti "judul" bab tidak ditemukan atau bukan teks.';
  }
  if (!Array.isArray(bab.tujuan) || bab.tujuan.length === 0) {
    return 'Properti "tujuan" harus berupa daftar (array) tujuan pembelajaran.';
  }
  if (!Array.isArray(bab.prasyarat)) {
    return 'Properti "prasyarat" harus berupa daftar (array) prasyarat.';
  }
  if (typeof bab.ringkasan !== 'string') {
    return 'Properti "ringkasan" bab tidak ditemukan atau bukan teks.';
  }
  if (typeof bab.durasi_menit !== 'number') {
    return 'Properti "durasi_menit" harus berupa angka durasi menit.';
  }
  if (!Array.isArray(bab.bagian) || bab.bagian.length === 0) {
    return 'Properti "bagian" harus berupa daftar materi dan tidak boleh kosong.';
  }

  for (let i = 0; i < bab.bagian.length; i++) {
    const bag = bab.bagian[i];
    if (!bag || typeof bag !== 'object') {
      return `Bagian ke-${i + 1} bukan objek materi yang valid.`;
    }
    if (typeof bag.id !== 'string') return `Bagian ke-${i + 1} tidak memiliki properti "id".`;
    if (typeof bag.judul !== 'string') return `Bagian ke-${i + 1} tidak memiliki properti "judul".`;
    if (typeof bag.penjelasan !== 'string') return `Bagian ke-${i + 1} tidak memiliki "penjelasan".`;
    if (typeof bag.analogi !== 'string') return `Bagian ke-${i + 1} tidak memiliki "analogi".`;
    if (typeof bag.contoh_kode !== 'string') return `Bagian ke-${i + 1} tidak memiliki "contoh_kode".`;
    if (typeof bag.output_contoh !== 'string') return `Bagian ke-${i + 1} tidak memiliki "output_contoh".`;
    if (!Array.isArray(bag.penjelasan_kode)) return `Bagian ke-${i + 1} tidak memiliki "penjelasan_kode" yang valid.`;
    if (typeof bag.catatan_umum_salah !== 'string') return `Bagian ke-${i + 1} tidak memiliki "catatan_umum_salah".`;
    if (typeof bag.coba_sendiri !== 'string') return `Bagian ke-${i + 1} tidak memiliki "coba_sendiri".`;
  }

  if (!bab.latihan_editor || typeof bab.latihan_editor !== 'object') {
    return 'Properti "latihan_editor" tidak ditemukan.';
  }
  if (typeof bab.latihan_editor.instruksi !== 'string') {
    return 'Properti "latihan_editor.instruksi" tidak valid.';
  }
  if (typeof bab.latihan_editor.kode_awal !== 'string') {
    return 'Properti "latihan_editor.kode_awal" tidak valid.';
  }
  if (typeof bab.latihan_editor.output_diharapkan !== 'string') {
    return 'Properti "latihan_editor.output_diharapkan" tidak valid.';
  }

  if (!Array.isArray(bab.poin_penting)) {
    return 'Properti "poin_penting" harus berupa daftar poin penting.';
  }
  if (!Array.isArray(bab.istilah)) {
    return 'Properti "istilah" harus berupa daftar glosarium istilah.';
  }

  return null;
}

/**
 * Membaca file JSON konten dengan penanganan error yang ramah.
 * File yang hilang atau rusak tidak akan melempar exception fatal atau membuat halaman putih.
 */
export function readJsonSafely<T>(filename: string): T | null {
  try {
    const filePath = path.join(CONTENT_DIR, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Content Loader] File tidak ditemukan: ${filePath}`);
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent) as T;
  } catch (error) {
    console.error(`[Content Loader] Gagal membaca atau mem-parsing ${filename}:`, error);
    return null;
  }
}

/**
 * Mengambil materi bab dengan status rinci (sukses, id salah, file hilang, atau json rusak).
 * Digunakan oleh halaman materi untuk menampilkan 404 jika ID salah,
 * atau tampilan error ramah jika file JSON hilang/rusak.
 */
export function getBabDetail(babIdOrNumber: string | number): BabDetailResult {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) {
    return {
      status: 'not-found',
      babParam: String(babIdOrNumber),
    };
  }

  const filename = `bab-${babNum}.json`;
  const filePath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `File konten "${filename}" tidak ditemukan di direktori content.`,
    };
  }

  let rawContent: string;
  try {
    rawContent = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `Gagal membaca file "${filename}": ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Sintaks JSON pada file "${filename}" tidak valid atau rusak: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const schemaError = validateBabMateri(parsed);
  if (schemaError) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Struktur data pada "${filename}" tidak sesuai: ${schemaError}`,
    };
  }

  return {
    status: 'success',
    data: parsed as BabMateri,
    babNumber: babNum,
  };
}

/**
 * Mengambil materi bab berdasarkan nomor atau id bab (misal 1 atau 'bab-1')
 */
export function getBabById(babIdOrNumber: string | number): BabMateri | null {
  const result = getBabDetail(babIdOrNumber);
  return result.status === 'success' ? result.data : null;
}

/**
 * Mengambil semua materi bab (1 s.d. 5) yang berhasil dimuat
 */
export function getAllBab(): BabMateri[] {
  const result: BabMateri[] = [];

  for (let i = 1; i <= 5; i++) {
    const bab = getBabById(i);
    if (bab) {
      result.push(bab);
    }
  }

  return result;
}

/**
 * Mengambil ringkasan semua bab untuk kartu beranda dan daftar materi
 */
export function getAllBabSummaries(): BabSummary[] {
  const allBab = getAllBab();

  return allBab.map((bab, index) => ({
    id: bab.id,
    nomor: index + 1,
    judul: bab.judul,
    ringkasan: bab.ringkasan,
    durasi_menit: bab.durasi_menit,
    tujuan: bab.tujuan,
  }));
}

/**
 * Validasi skema runtime untuk konten KuisBab.
 * Mengembalikan string pesan error jika tidak sesuai skema, atau null jika valid.
 */
export function validateKuisBab(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Data kuis bukan merupakan objek JSON yang valid.';
  }

  const kuis = data as Partial<KuisBab>;

  if (typeof kuis.bab !== 'string' || !kuis.bab.trim()) {
    return 'Properti "bab" kuis tidak ditemukan atau bukan teks.';
  }
  if (typeof kuis.judul_kuis !== 'string' || !kuis.judul_kuis.trim()) {
    return 'Properti "judul_kuis" kuis tidak ditemukan atau bukan teks.';
  }
  if (!Array.isArray(kuis.soal) || kuis.soal.length === 0) {
    return 'Properti "soal" harus berupa daftar (array) soal dan tidak boleh kosong.';
  }

  for (let i = 0; i < kuis.soal.length; i++) {
    const s = kuis.soal[i];
    if (!s || typeof s !== 'object') {
      return `Soal ke-${i + 1} bukan objek soal yang valid.`;
    }
    if (typeof s.id !== 'number') {
      return `Soal ke-${i + 1} tidak memiliki properti "id" berupa angka.`;
    }
    if (!s.tingkat || !['mudah', 'sedang', 'sulit'].includes(s.tingkat)) {
      return `Soal ke-${i + 1} memiliki "tingkat" kesulitan yang tidak valid.`;
    }
    if (typeof s.pertanyaan !== 'string' || !s.pertanyaan.trim()) {
      return `Soal ke-${i + 1} tidak memiliki properti "pertanyaan" teks.`;
    }
    if (!Array.isArray(s.opsi) || s.opsi.length < 2) {
      return `Soal ke-${i + 1} harus memiliki minimal 2 pilihan opsi jawaban.`;
    }
    if (
      typeof s.jawaban_benar !== 'number' ||
      !Number.isInteger(s.jawaban_benar) ||
      s.jawaban_benar < 0 ||
      s.jawaban_benar >= s.opsi.length
    ) {
      return `Soal ke-${i + 1} memiliki indeks "jawaban_benar" yang tidak valid (di luar rentang opsi).`;
    }
    if (typeof s.pembahasan !== 'string' || !s.pembahasan.trim()) {
      return `Soal ke-${i + 1} tidak memiliki properti "pembahasan".`;
    }
  }

  return null;
}

export type KuisDetailResult =
  | { status: 'success'; data: KuisBab; babNumber: number }
  | { status: 'not-found'; babParam: string }
  | { status: 'file-not-found'; babNumber: number; filename: string; errorMessage: string }
  | { status: 'corrupt'; babNumber: number; filename: string; errorMessage: string };

/**
 * Mengambil kuis bab dengan status rinci (sukses, id salah, file hilang, atau json rusak).
 */
export function getKuisDetail(babIdOrNumber: string | number): KuisDetailResult {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) {
    return {
      status: 'not-found',
      babParam: String(babIdOrNumber),
    };
  }

  const filename = `kuis-bab-${babNum}.json`;
  const filePath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `File kuis "${filename}" tidak ditemukan di direktori content.`,
    };
  }

  let rawContent: string;
  try {
    rawContent = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `Gagal membaca file "${filename}": ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Sintaks JSON pada file "${filename}" tidak valid atau rusak: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const schemaError = validateKuisBab(parsed);
  if (schemaError) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Struktur data pada "${filename}" tidak sesuai: ${schemaError}`,
    };
  }

  return {
    status: 'success',
    data: parsed as KuisBab,
    babNumber: babNum,
  };
}

/**
 * Mengambil kuis berdasarkan nomor atau id bab
 */
export function getKuisByBab(babIdOrNumber: string | number): KuisBab | null {
  const result = getKuisDetail(babIdOrNumber);
  return result.status === 'success' ? result.data : null;
}

export type TantanganDetailResult =
  | { status: 'success'; data: TantanganBab; babNumber: number }
  | { status: 'not-found'; babParam: string }
  | { status: 'file-not-found'; babNumber: number; filename: string; errorMessage: string }
  | { status: 'corrupt'; babNumber: number; filename: string; errorMessage: string };

/**
 * Validasi skema runtime untuk konten TantanganBab.
 */
export function validateTantanganBab(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Data tantangan bukan merupakan objek JSON yang valid.';
  }

  const tantanganData = data as Partial<TantanganBab>;

  if (typeof tantanganData.bab !== 'string' || !tantanganData.bab.trim()) {
    return 'Properti "bab" tantangan tidak ditemukan atau bukan teks.';
  }
  if (!Array.isArray(tantanganData.tantangan) || tantanganData.tantangan.length === 0) {
    return 'Properti "tantangan" harus berupa daftar (array) tantangan dan tidak boleh kosong.';
  }

  for (let i = 0; i < tantanganData.tantangan.length; i++) {
    const t = tantanganData.tantangan[i];
    if (!t || typeof t !== 'object') {
      return `Tantangan ke-${i + 1} bukan objek tantangan yang valid.`;
    }
    if (typeof t.id !== 'number') {
      return `Tantangan ke-${i + 1} tidak memiliki properti "id" berupa angka.`;
    }
    if (!t.tingkat || !['mudah', 'sedang', 'sulit'].includes(t.tingkat)) {
      return `Tantangan ke-${i + 1} memiliki "tingkat" kesulitan yang tidak valid.`;
    }
    if (typeof t.judul !== 'string' || !t.judul.trim()) {
      return `Tantangan ke-${i + 1} tidak memiliki properti "judul" teks.`;
    }
    if (typeof t.cerita !== 'string') {
      return `Tantangan ke-${i + 1} tidak memiliki properti "cerita".`;
    }
    if (typeof t.instruksi !== 'string' || !t.instruksi.trim()) {
      return `Tantangan ke-${i + 1} tidak memiliki properti "instruksi".`;
    }
    if (typeof t.kode_awal !== 'string') {
      return `Tantangan ke-${i + 1} tidak memiliki properti "kode_awal".`;
    }
    if (typeof t.output_diharapkan !== 'string') {
      return `Tantangan ke-${i + 1} tidak memiliki properti "output_diharapkan".`;
    }
    if (typeof t.contoh_solusi !== 'string') {
      return `Tantangan ke-${i + 1} tidak memiliki properti "contoh_solusi".`;
    }
    if (!Array.isArray(t.petunjuk) || t.petunjuk.length === 0) {
      return `Tantangan ke-${i + 1} harus memiliki minimal 1 petunjuk.`;
    }
    if (!Array.isArray(t.kesalahan_umum)) {
      return `Tantangan ke-${i + 1} tidak memiliki properti "kesalahan_umum" berupa array.`;
    }
  }

  return null;
}

/**
 * Mengambil tantangan bab dengan status rinci (sukses, id salah, file hilang, atau json rusak).
 */
export function getTantanganDetail(babIdOrNumber: string | number): TantanganDetailResult {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) {
    return {
      status: 'not-found',
      babParam: String(babIdOrNumber),
    };
  }

  const filename = `tantangan-bab-${babNum}.json`;
  const filePath = path.join(CONTENT_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `File tantangan "${filename}" tidak ditemukan di direktori content.`,
    };
  }

  let rawContent: string;
  try {
    rawContent = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    return {
      status: 'file-not-found',
      babNumber: babNum,
      filename,
      errorMessage: `Gagal membaca file "${filename}": ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch (err) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Sintaks JSON pada file "${filename}" tidak valid atau rusak: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const schemaError = validateTantanganBab(parsed);
  if (schemaError) {
    return {
      status: 'corrupt',
      babNumber: babNum,
      filename,
      errorMessage: `Struktur data pada "${filename}" tidak sesuai: ${schemaError}`,
    };
  }

  return {
    status: 'success',
    data: parsed as TantanganBab,
    babNumber: babNum,
  };
}

/**
 * Mengambil tantangan koding berdasarkan nomor atau id bab
 */
export function getTantanganByBab(babIdOrNumber: string | number): TantanganBab | null {
  const result = getTantanganDetail(babIdOrNumber);
  return result.status === 'success' ? result.data : null;
}

/**
 * Mengambil satu tantangan spesifik berdasarkan bab dan ID tantangan
 */
export function getTantanganItem(
  babIdOrNumber: string | number,
  tantanganId: number
): { babNumber: number; item: ItemTantangan } | null {
  const tantanganBab = getTantanganByBab(babIdOrNumber);
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!tantanganBab || !babNum) return null;

  const item = tantanganBab.tantangan.find((t) => t.id === tantanganId);
  if (!item) return null;

  return { babNumber: babNum, item };
}

export interface TantanganBabGroup {
  babNumber: number;
  babJudul: string;
  data: TantanganBab;
}

/**
 * Mengambil seluruh tantangan dari Bab 1 s.d. 5 untuk halaman daftar tantangan
 */
export function getAllTantangan(): TantanganBabGroup[] {
  const allBab = getAllBab();
  const groups: TantanganBabGroup[] = [];

  allBab.forEach((bab, index) => {
    const babNum = index + 1;
    const tData = getTantanganByBab(babNum);
    if (tData) {
      groups.push({
        babNumber: babNum,
        babJudul: bab.judul,
        data: tData,
      });
    }
  });

  return groups;
}

export interface ContohMateriItem {
  id: string;
  babNomor: number;
  babJudul: string;
  bagianJudul: string;
  label: string;
  contoh_kode: string;
  output_contoh: string;
}

/**
 * Mengambil seluruh contoh kode dari semua bab dan bagiannya untuk dropdown playground
 */
export function getAllContohMateri(): ContohMateriItem[] {
  const allBab = getAllBab();
  const list: ContohMateriItem[] = [];

  allBab.forEach((bab, babIndex) => {
    const babNomor = babIndex + 1;
    bab.bagian.forEach((bag, bagIndex) => {
      list.push({
        id: `${bab.id}-bag-${bagIndex + 1}`,
        babNomor,
        babJudul: bab.judul,
        bagianJudul: bag.judul,
        label: `Misi ${babNomor}: ${bag.judul}`,
        contoh_kode: bag.contoh_kode,
        output_contoh: bag.output_contoh,
      });
    });
  });

  return list;
}

