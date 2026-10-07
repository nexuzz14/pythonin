/**
 * Utilitas Normalisasi dan Pengecekan Otomatis Tantangan Koding Pythonin.
 * Sesuai PRD Seksi 9.1 dan skrip verifikasi_konten.py.
 */

export interface LineDiff {
  lineNumber: number;
  studentLine?: string;
  expectedLine?: string;
  status: 'match' | 'mismatch' | 'missing' | 'extra';
  reason?: string;
}

export interface ChallengeCheckResult {
  isCorrect: boolean;
  isEmptyOutput: boolean;
  rawStudentOutput: string;
  rawExpectedOutput: string;
  normalizedStudent: string;
  normalizedExpected: string;
  lineDiffs: LineDiff[];
  diffSummary?: string;
}

/**
 * Normalisasi output teks kode siswa dan output yang diharapkan:
 * 1. Mengubah format newline Windows \r\n menjadi \n
 * 2. Menghapus spasi/tab di akhir tiap baris (rstrip)
 * 3. Menghapus baris kosong di akhir teks
 */
export function normalizeOutput(text: string): string {
  if (typeof text !== 'string') return '';
  const lines = text.replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines.join('\n');
}

/**
 * Menganalisis alasan perbedaan spesifik antara dua baris string.
 */
function analyzeLineDifference(studentLine: string, expectedLine: string): string {
  if (studentLine.toLowerCase() === expectedLine.toLowerCase()) {
    return 'Perbedaan huruf besar/kecil (kapitalisasi).';
  }

  // Cek apakah hanya beda spasi
  const sNoSpaces = studentLine.replace(/\s+/g, ' ');
  const eNoSpaces = expectedLine.replace(/\s+/g, ' ');
  if (sNoSpaces === eNoSpaces) {
    return 'Jumlah spasi di antara teks tidak cocok persis.';
  }

  // Cek jika ada tanda baca yang kurang atau beda
  if (studentLine.replace(/[.,:;!?'"()]/g, '') === expectedLine.replace(/[.,:;!?'"()]/g, '')) {
    return 'Periksa tanda baca seperti titik dua (:), titik, atau tanda kutip.';
  }

  return 'Teks baris tidak sesuai dengan target output.';
}

/**
 * Membandingkan baris per baris output siswa dan output yang diharapkan.
 */
export function generateLineDiffs(
  studentLines: string[],
  expectedLines: string[]
): LineDiff[] {
  const diffs: LineDiff[] = [];
  const maxLines = Math.max(studentLines.length, expectedLines.length);

  for (let i = 0; i < maxLines; i++) {
    const sLine = studentLines[i];
    const eLine = expectedLines[i];
    const lineNum = i + 1;

    if (sLine !== undefined && eLine !== undefined) {
      if (sLine === eLine) {
        diffs.push({
          lineNumber: lineNum,
          studentLine: sLine,
          expectedLine: eLine,
          status: 'match',
        });
      } else {
        diffs.push({
          lineNumber: lineNum,
          studentLine: sLine,
          expectedLine: eLine,
          status: 'mismatch',
          reason: analyzeLineDifference(sLine, eLine),
        });
      }
    } else if (eLine !== undefined && sLine === undefined) {
      diffs.push({
        lineNumber: lineNum,
        expectedLine: eLine,
        status: 'missing',
        reason: 'Baris ini belum tercetak pada output kodemu.',
      });
    } else if (sLine !== undefined && eLine === undefined) {
      diffs.push({
        lineNumber: lineNum,
        studentLine: sLine,
        status: 'extra',
        reason: 'Baris tambahan yang tidak diminta pada output target.',
      });
    }
  }

  return diffs;
}

/**
 * Evaluasi utama hasil tantangan:
 * Mengembalikan objek perbandingan lengkap beserta status lolos dan diff baris.
 */
export function evaluateChallengeOutput(
  rawStudentOutput: string,
  rawExpectedOutput: string
): ChallengeCheckResult {
  const normalizedStudent = normalizeOutput(rawStudentOutput);
  const normalizedExpected = normalizeOutput(rawExpectedOutput);

  const isEmptyOutput = !rawStudentOutput || rawStudentOutput.trim() === '';
  const isCorrect = normalizedStudent === normalizedExpected;

  const sLines = normalizedStudent ? normalizedStudent.split('\n') : [];
  const eLines = normalizedExpected ? normalizedExpected.split('\n') : [];

  const lineDiffs = generateLineDiffs(sLines, eLines);

  let diffSummary: string | undefined;
  if (!isCorrect) {
    if (isEmptyOutput) {
      diffSummary =
        'Program tidak menghasilkan keluaran teks apa pun. Gunakan perintah print() untuk menampilkan hasil.';
    } else if (sLines.length < eLines.length) {
      diffSummary = `Output kodemu kurang ${eLines.length - sLines.length} baris dibanding target output.`;
    } else if (sLines.length > eLines.length) {
      diffSummary = `Output kodemu memiliki ${sLines.length - eLines.length} baris ekstra lebih banyak dibanding target output.`;
    } else {
      const mismatchCount = lineDiffs.filter((d) => d.status === 'mismatch').length;
      diffSummary = `Terdapat ${mismatchCount} baris yang belum sesuai dengan target output.`;
    }
  }

  return {
    isCorrect,
    isEmptyOutput,
    rawStudentOutput,
    rawExpectedOutput,
    normalizedStudent,
    normalizedExpected,
    lineDiffs,
    diffSummary,
  };
}
