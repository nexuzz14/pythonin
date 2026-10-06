import type { SoalKuis, TingkatKesulitan } from './content';

/**
 * Representasi opsi pilihan ganda yang telah dipetakan dengan indeks aslinya.
 * Memastikan bahwa saat opsi diacak (shuffled), pemeriksaan jawaban tetap 100% akurat.
 */
export interface OpsiTersusun {
  teks: string;
  indeksAsli: number;
}

/**
 * Data satu butir soal beserta daftar opsinya yang siap ditampilkan ke pengguna.
 */
export interface SoalTersusun {
  soal: SoalKuis;
  opsi: OpsiTersusun[];
}

/**
 * Rekam jejak jawaban yang dipilih siswa untuk setiap butir soal.
 */
export interface JawabanSiswa {
  soalId: number;
  indeksAsliDipilih: number;
  indeksAsliBenar: number;
  isBenar: boolean;
  menggunakanPetunjuk: boolean;
}

/**
 * Rangkuman statistik per tingkat kesulitan kuis.
 */
export interface RincianKesulitan {
  benar: number;
  total: number;
}

/**
 * Rincian butir soal yang salah untuk ditampilkan di bagian pembahasan hasil kuis.
 */
export interface SoalSalahReview {
  soal: SoalKuis;
  opsiDipilihTeks: string;
  opsiBenarTeks: string;
}

/**
 * Hasil akhir pengerjaan kuis yang dikirimkan ke onFinish dan disimpan ke state progres.
 */
export interface HasilKuis {
  babNumber: number;
  judulKuis: string;
  skor: number;
  totalSoal: number;
  persentase: number;
  rincianKesulitan: Record<TingkatKesulitan, RincianKesulitan>;
  soalSalah: SoalSalahReview[];
  waktuSelesai: string;
}
