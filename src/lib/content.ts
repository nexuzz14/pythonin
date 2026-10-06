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
 * Mengambil materi bab berdasarkan nomor atau id bab (misal 1 atau 'bab-1')
 */
export function getBabById(babIdOrNumber: string | number): BabMateri | null {
  const babNum = normalizeBabNumber(babIdOrNumber);
  if (!babNum) return null;

  return readJsonSafely<BabMateri>(`bab-${babNum}.json`);
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

