import fs from 'fs';
import path from 'path';
import type {
  BabMateri,
  BabSummary,
  KuisBab,
  TantanganBab,
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
function readJsonSafely<T>(filename: string): T | null {
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
 * Mengambil kuis berdasarkan nomor atau id bab
 */
export function getKuisByBab(babIdOrNumber: string | number): KuisBab | null {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) return null;

  return readJsonSafely<KuisBab>(`kuis-bab-${babNum}.json`);
}

/**
 * Mengambil tantangan koding berdasarkan nomor atau id bab
 */
export function getTantanganByBab(babIdOrNumber: string | number): TantanganBab | null {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) return null;

  return readJsonSafely<TantanganBab>(`tantangan-bab-${babNum}.json`);
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

