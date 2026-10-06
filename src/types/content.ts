/**
 * Definisi tipe data TypeScript untuk konten pembelajaran Pythonin.
 * Mengacu persis pada skema aktual di folder content/ (Single Source of Truth).
 */

export type TingkatKesulitan = 'mudah' | 'sedang' | 'sulit';

export interface BagianMateri {
  id: string;
  judul: string;
  penjelasan: string;
  analogi: string;
  contoh_kode: string;
  output_contoh: string;
  penjelasan_kode: string[];
  catatan_umum_salah: string;
  coba_sendiri: string;
}

export interface LatihanEditor {
  instruksi: string;
  kode_awal: string;
  output_diharapkan: string;
}

export interface IstilahGlosarium {
  istilah: string;
  arti: string;
}

export interface BabMateri {
  id: string;
  judul: string;
  tujuan: string[];
  prasyarat: string[];
  ringkasan: string;
  durasi_menit: number;
  bagian: BagianMateri[];
  latihan_editor: LatihanEditor;
  poin_penting: string[];
  istilah: IstilahGlosarium[];
}

export interface BabSummary {
  id: string;
  nomor: number;
  judul: string;
  ringkasan: string;
  durasi_menit: number;
  tujuan: string[];
}

export interface SoalKuis {
  id: number;
  tingkat: TingkatKesulitan;
  capaian: string;
  pertanyaan: string;
  kode: string | null;
  opsi: string[];
  jawaban_benar: number;
  pembahasan: string;
  petunjuk: string;
}

export interface KuisBab {
  bab: string;
  judul_kuis: string;
  soal: SoalKuis[];
}

export interface ItemTantangan {
  id: number;
  tingkat: TingkatKesulitan;
  judul: string;
  cerita: string;
  instruksi: string;
  kode_awal: string;
  output_diharapkan: string;
  contoh_solusi: string;
  petunjuk: string[];
  kesalahan_umum: string[];
}

export interface TantanganBab {
  bab: string;
  tantangan: ItemTantangan[];
}
