import type { FriendlyError, PythonErrorDetail } from '../types/runner';

/**
 * Karakter kutip melengkung yang sering dimasukkan oleh keyboard HP/mobile
 */
const CURLY_QUOTES_REGEX = /[\u201C\u201D\u2018\u2019]/;

/**
 * Mengubah pesan error Python teknis menjadi penjelasan ramah pemula berbahasa Indonesia.
 *
 * @param error Detail error dari runner atau string error
 * @param code Kode Python siswa (opsional, untuk mengecek karakter pada baris terkait)
 * @returns Objek FriendlyError dengan judul, pesan ramah, saran perbaikan, dan nomor baris
 */
export function formatFriendlyError(
  error: PythonErrorDetail | { type?: string; message: string; line?: number | null; rawTraceback?: string } | string,
  code?: string
): FriendlyError {
  let errorType = 'Error';
  let errorMessage = '';
  let errorLine: number | null = null;
  let rawTraceback = '';

  if (typeof error === 'string') {
    errorMessage = error;
    rawTraceback = error;
    // Coba tebak errorType dari string
    const match = error.match(/([A-Za-z_][A-Za-z0-9_]*Error|[A-Za-z_][A-Za-z0-9_]*Exception|Timeout)/);
    if (match) errorType = match[1];

    const lineMatch = error.match(/line\s+(\d+)/i);
    if (lineMatch) errorLine = parseInt(lineMatch[1], 10);
  } else {
    errorType = error.type || 'Error';
    errorMessage = error.message || '';
    errorLine = error.line ?? null;
    rawTraceback = error.rawTraceback || error.message || '';
  }

  // Cek nomor baris jika belum ada
  if (errorLine === null && rawTraceback) {
    const lineMatch = rawTraceback.match(/line\s+(\d+)/i);
    if (lineMatch) {
      errorLine = parseInt(lineMatch[1], 10);
    }
  }

  // 1. Timeout
  if (errorType === 'Timeout' || errorMessage.toLowerCase().includes('timeout') || rawTraceback.toLowerCase().includes('timeout')) {
    return {
      type: 'Timeout',
      title: 'Waktu Eksekusi Habis (Timeout)',
      message: 'Programmu berjalan lebih dari 5 detik dan dihentikan otomatis. Ini biasanya terjadi karena ada perulangan tanpa henti (looping tak berhingga).',
      suggestion: 'Periksa kondisi pada perulangan while atau for. Pastikan nilai variabel berubah di dalam perulangan agar kondisi berhenti tercapai.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 2. Deteksi Kutip Melengkung pada SyntaxError
  let hasCurlyQuotes = false;
  if (code && errorLine !== null && errorLine > 0) {
    const codeLines = code.split('\n');
    const targetLine = codeLines[errorLine - 1] || '';
    if (CURLY_QUOTES_REGEX.test(targetLine)) {
      hasCurlyQuotes = true;
    }
  }
  if (!hasCurlyQuotes && CURLY_QUOTES_REGEX.test(rawTraceback + errorMessage)) {
    hasCurlyQuotes = true;
  }
  // Deteksi pesan Python untuk karakter invalid (misal: "invalid character '“'")
  if (rawTraceback.includes('invalid character') && CURLY_QUOTES_REGEX.test(rawTraceback)) {
    hasCurlyQuotes = true;
  }

  if (errorType === 'SyntaxError' && hasCurlyQuotes) {
    return {
      type: 'SyntaxError',
      title: 'Tanda Kutip Melengkung Terdeteksi',
      message: errorLine
        ? `Tanda kutip melengkung (“ ” atau ‘ ’) terdeteksi di baris ${errorLine}. Keyboard HP sering mengetik kutip melengkung secara otomatis.`
        : 'Tanda kutip melengkung (“ ” atau ‘ ’) terdeteksi. Keyboard HP sering mengetik kutip melengkung secara otomatis.',
      suggestion: 'Ganti semua tanda kutip melengkung dengan tanda kutip lurus biasa (" atau \') agar Python dapat membaca teks tersebut.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 3. SyntaxError Umum
  if (errorType === 'SyntaxError') {
    return {
      type: 'SyntaxError',
      title: 'Penulisan Kode Belum Sesuai Aturan',
      message: errorLine
        ? `Ada penulisan yang tidak sesuai aturan Python di baris ${errorLine}.`
        : 'Ada penulisan yang tidak sesuai aturan Python.',
      suggestion: 'Periksa tanda kurung ( ), tanda kutip (" "), atau titik dua (:) di akhir baris if/for/while/def yang mungkin lupa ditutup atau terlewat.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 4. IndentationError
  if (errorType === 'IndentationError') {
    return {
      type: 'IndentationError',
      title: 'Indentasi (Spasi Awal) Belum Rapi',
      message: errorLine
        ? `Spasi di awal baris ${errorLine} tidak konsisten. Python mewajibkan baris di dalam blok kode untuk menjorok ke dalam.`
        : 'Spasi di awal baris tidak konsisten. Python mewajibkan baris di dalam blok kode untuk menjorok ke dalam.',
      suggestion: 'Gunakan 4 spasi (atau tombol Tab) di awal baris blok if, for, while, atau fungsi. Pastikan jumlah spasinya rata.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 5. NameError
  if (errorType === 'NameError') {
    // Ekstrak nama variabel jika ada: name 'x' is not defined
    const nameMatch = errorMessage.match(/name '([^']+)' is not defined/i);
    const varName = nameMatch ? `'${nameMatch[1]}'` : 'yang kamu panggil';

    return {
      type: 'NameError',
      title: 'Nama Belum Dikenal',
      message: errorLine
        ? `Python tidak mengenal nama ${varName} di baris ${errorLine}.`
        : `Python tidak mengenal nama ${varName}.`,
      suggestion: 'Periksa ejaan huruf besar-kecil (Python membedakan huruf besar dan kecil), pastikan variabel sudah dibuat sebelumnya, atau periksa apakah kamu lupa tanda kutip ("...") jika maksudmu adalah teks.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 6. TypeError
  if (errorType === 'TypeError') {
    return {
      type: 'TypeError',
      title: 'Tipe Data Tidak Cocok',
      message: errorLine
        ? `Operasi tipe data tidak cocok di baris ${errorLine}, misalnya menjumlahkan teks dan angka.`
        : 'Operasi tipe data tidak cocok, misalnya menjumlahkan teks dan angka secara langsung.',
      suggestion: 'Ubah jenis data dengan fungsi str(...) atau int(...), atau gunakan f-string seperti f"{teks} {angka}".',
      line: errorLine,
      rawTraceback,
    };
  }


  // 7. ValueError
  if (errorType === 'ValueError') {
    return {
      type: 'ValueError',
      title: 'Nilai Data Tidak Sesuai',
      message: errorLine
        ? `Nilai data tidak dapat diubah atau diproses di baris ${errorLine} (contoh: int("abc")).`
        : 'Nilai data tidak dapat diubah atau diproses (contoh: mengubah teks berisi huruf menjadi angka).',
      suggestion: 'Pastikan isi data sesuai dengan format yang diminta, misalnya fungsi int(...) hanya menerima teks yang isinya murni angka.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 8. ZeroDivisionError
  if (errorType === 'ZeroDivisionError') {
    return {
      type: 'ZeroDivisionError',
      title: 'Pembagian dengan Nol',
      message: errorLine
        ? `Program mencoba membagi angka dengan nol di baris ${errorLine}.`
        : 'Program mencoba membagi angka dengan nol.',
      suggestion: 'Dalam matematika dan pemrograman, angka tidak bisa dibagi dengan nol (0). Pastikan angka pembagi bernilai lebih besar atau lebih kecil dari nol.',
      line: errorLine,
      rawTraceback,
    };
  }

  // 9. EOFError (Simulasi input())
  if (errorType === 'EOFError' || errorMessage.includes('input() tidak didukung')) {
    return {
      type: 'EOFError',
      title: 'Input Program Disimulasikan',
      message: 'Fungsi input() interaktif tidak didukung di media belajar ini.',
      suggestion: 'Simulasikan masukan program lewat inisialisasi variabel di baris awal kode, misalnya: nama = "Budi" atau nilai = 85.',
      line: errorLine,
      rawTraceback,
    };
  }

  // Fallback: Error lainnya
  return {
    type: errorType,
    title: `Terjadi ${errorType}`,
    message: errorLine
      ? `Program terhenti karena kendala di baris ${errorLine}: ${errorMessage || errorType}`
      : `Program terhenti karena kendala: ${errorMessage || errorType}`,
    suggestion: 'Periksa kembali baris kode tersebut dan lihat detail teknis di bagian bawah untuk petunjuk lebih lanjut.',
    line: errorLine,
    rawTraceback,
  };
}
