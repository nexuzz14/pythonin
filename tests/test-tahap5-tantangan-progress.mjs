import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const {
  getTantanganDetail,
  getTantanganByBab,
  getTantanganItem,
  getAllTantangan,
  validateTantanganBab,
} = await jiti.import('../src/lib/content.ts');

const {
  normalizeOutput,
  evaluateChallengeOutput,
  generateLineDiffs,
} = await jiti.import('../src/lib/challenge-checker.ts');

const {
  loadProgress,
  saveProgress,
  getProgress,
  updateChallengeAttempt,
  updateQuizResult,
  toggleReadSection,
  markChapterOpened,
  resetProgress,
  getChapterStatus,
  getChallengeStatus,
  getOverallStats,
  PROGRESS_STORAGE_KEY,
  BACKUP_STORAGE_KEY,
} = await jiti.import('../src/lib/progress.ts');

test('Tahap 5: Verifikasi integritas SSOT Tantangan (tantangan-bab-1 s.d. 5)', async (t) => {
  for (let babNum = 1; babNum <= 5; babNum++) {
    await t.test(`Bab ${babNum}: file tantangan valid dan skema lengkap`, () => {
      const res = getTantanganDetail(babNum);
      assert.equal(res.status, 'success', `Bab ${babNum} harus berstatus success`);

      const data = res.data;
      assert.equal(data.bab, `bab-${babNum}`);
      assert.ok(Array.isArray(data.tantangan) && data.tantangan.length === 3, 'Harus memiliki tepat 3 tantangan');

      const expectedLevels = ['mudah', 'sedang', 'sulit'];

      data.tantangan.forEach((ch, idx) => {
        assert.equal(ch.id, idx + 1, `ID tantangan ke-${idx + 1} harus konsisten`);
        assert.equal(ch.tingkat, expectedLevels[idx], `Tingkat tantangan ke-${idx + 1} harus ${expectedLevels[idx]}`);
        assert.ok(ch.judul && ch.judul.length > 0, `Judul ada pada tantangan ${idx + 1}`);
        assert.ok(ch.cerita && ch.cerita.length > 0, `Cerita ada pada tantangan ${idx + 1}`);
        assert.ok(ch.instruksi && ch.instruksi.length > 0, `Instruksi ada pada tantangan ${idx + 1}`);
        assert.ok(ch.kode_awal !== undefined, `kode_awal ada pada tantangan ${idx + 1}`);
        assert.ok(ch.output_diharapkan !== undefined, `output_diharapkan ada pada tantangan ${idx + 1}`);
        assert.ok(ch.contoh_solusi && ch.contoh_solusi.length > 0, `contoh_solusi ada pada tantangan ${idx + 1}`);
        assert.ok(Array.isArray(ch.petunjuk) && ch.petunjuk.length === 3, `Harus ada tepat 3 petunjuk bertahap pada tantangan ${idx + 1}`);
        assert.ok(Array.isArray(ch.kesalahan_umum), `kesalahan_umum berupa array pada tantangan ${idx + 1}`);
      });
    });
  }

  await t.test('getAllTantangan mengembalikan seluruh 5 bab kelompok tantangan', () => {
    const all = getAllTantangan();
    assert.equal(all.length, 5);
    all.forEach((g, idx) => {
      assert.equal(g.babNumber, idx + 1);
      assert.equal(g.data.tantangan.length, 3);
    });
  });

  await t.test('getTantanganItem dan getTantanganByBab mengambil tantangan dengan benar', () => {
    const bab1 = getTantanganByBab(1);
    assert.ok(bab1);
    assert.equal(bab1.bab, 'bab-1');

    const item = getTantanganItem(1, 2);
    assert.ok(item);
    assert.equal(item.babNumber, 1);
    assert.equal(item.item.id, 2);
    assert.equal(item.item.tingkat, 'sedang');
  });

  await t.test('Penanganan ID Bab tidak valid -> not-found', () => {
    const invalidIds = ['999', 'abc', 0, 6, -1];
    invalidIds.forEach((id) => {
      const res = getTantanganDetail(id);
      assert.equal(res.status, 'not-found');
    });
  });

  await t.test('Validasi skema tantangan mendeteksi error struktur', () => {
    assert.ok(validateTantanganBab(null)?.includes('bukan merupakan objek'));
    assert.ok(validateTantanganBab({ bab: '' })?.includes('bab'));
    assert.ok(validateTantanganBab({ bab: 'bab-1', tantangan: [] })?.includes('tidak boleh kosong'));
  });
});

test('Tahap 5: Normalisasi Output & Evaluasi Otomatis (Kebutuhan 3)', async (t) => {
  await t.test('normalizeOutput memotong Windows CRLF, trailing spaces, dan empty trailing lines', () => {
    const raw = 'Halo Dunia   \r\nBaris Dua  \t\r\n\r\n\r\n';
    const normalized = normalizeOutput(raw);
    assert.equal(normalized, 'Halo Dunia\nBaris Dua');
  });

  await t.test('Skenario Benar: Output persis sama dinyatakan lolos (isCorrect: true)', () => {
    const student = 'Nama   : Andi Pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak\n';
    const expected = 'Nama   : Andi Pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak';
    const result = evaluateChallengeOutput(student, expected);
    assert.equal(result.isCorrect, true);
    assert.equal(result.isEmptyOutput, false);
  });

  await t.test('Skenario Salah: Beda huruf besar/kecil dideteksi dengan alasan kapitalisasi', () => {
    const student = 'nama   : andi pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak';
    const expected = 'Nama   : Andi Pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak';
    const result = evaluateChallengeOutput(student, expected);
    assert.equal(result.isCorrect, false);
    const diff1 = result.lineDiffs.find((d) => d.lineNumber === 1);
    assert.ok(diff1);
    assert.equal(diff1.status, 'mismatch');
    assert.ok(diff1.reason?.includes('kapitalisasi'));
  });

  await t.test('Skenario Salah: Beda jumlah spasi dideteksi', () => {
    const student = 'Nama : Andi Pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak';
    const expected = 'Nama   : Andi Pratama\nKelas  : X RPL 1\nJurusan: Rekayasa Perangkat Lunak';
    const result = evaluateChallengeOutput(student, expected);
    assert.equal(result.isCorrect, false);
    const diff1 = result.lineDiffs.find((d) => d.lineNumber === 1);
    assert.ok(diff1);
    assert.ok(diff1.reason?.includes('spasi'));
  });

  await t.test('Skenario Salah: Output kosong dideteksi dengan pesan edukatif', () => {
    const student = '';
    const expected = '*\n**\n***';
    const result = evaluateChallengeOutput(student, expected);
    assert.equal(result.isCorrect, false);
    assert.equal(result.isEmptyOutput, true);
    assert.ok(result.diffSummary?.includes('print()'));
  });

  await t.test('Skenario Kurang Baris dan Lebih Baris terdeteksi', () => {
    const studentKurang = 'Baris 1\nBaris 2';
    const expectedTiga = 'Baris 1\nBaris 2\nBaris 3';
    const resKurang = evaluateChallengeOutput(studentKurang, expectedTiga);
    assert.equal(resKurang.isCorrect, false);
    assert.ok(resKurang.diffSummary?.includes('kurang 1 baris'));

    const studentLebih = 'Baris 1\nBaris 2\nBaris 3\nBaris 4';
    const resLebih = evaluateChallengeOutput(studentLebih, expectedTiga);
    assert.equal(resLebih.isCorrect, false);
    assert.ok(resLebih.diffSummary?.includes('ekstra'));

    const directDiffs = generateLineDiffs(['A', 'B'], ['A', 'C']);
    assert.equal(directDiffs.length, 2);
    assert.equal(directDiffs[0].status, 'match');
    assert.equal(directDiffs[1].status, 'mismatch');
  });
});

test('Tahap 5: Ketahanan Modul Progres & LocalStorage (Kebutuhan 6-10)', async (t) => {
  // Mock window.localStorage untuk pengujian Node.js
  const mockStorage = new Map();
  let storageShouldThrow = false;

  const mockWindow = {
    localStorage: {
      getItem(key) {
        if (storageShouldThrow) throw new Error('QuotaExceededError');
        return mockStorage.get(key) ?? null;
      },
      setItem(key, val) {
        if (storageShouldThrow) throw new Error('QuotaExceededError');
        mockStorage.set(key, String(val));
      },
      removeItem(key) {
        if (storageShouldThrow) throw new Error('QuotaExceededError');
        mockStorage.delete(key);
      },
    },
    dispatchEvent() {},
    addEventListener() {},
    removeEventListener() {},
  };

  globalThis.window = mockWindow;

  await t.test('Skenario 1: Data kosong di localStorage menghasilkan progres default', () => {
    mockStorage.clear();
    const p = loadProgress();
    assert.equal(p.version, 1);
    assert.ok(p.updatedAt);
    assert.deepEqual(p.chapters, {});
  });

  await t.test('Skenario 2: JSON rusak tidak membuat aplikasi crash & dicadangkan ke backup key', () => {
    mockStorage.set(PROGRESS_STORAGE_KEY, '{"version": 1, chapters: INVALID_JSON');
    const p = loadProgress();
    assert.equal(p.version, 1);
    assert.deepEqual(p.chapters, {});
    // Pastikan data rusak tersimpan di backup key
    assert.equal(mockStorage.get(BACKUP_STORAGE_KEY), '{"version": 1, chapters: INVALID_JSON');
  });

  await t.test('Skenario 3: Versi data tak dikenal dicadangkan & direset aman', () => {
    mockStorage.set(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 999, data: 'old' }));
    const p = loadProgress();
    assert.equal(p.version, 1);
    assert.ok(mockStorage.has(BACKUP_STORAGE_KEY));
  });

  await t.test('Skenario 4: Mode privat / localStorage throw error tidak crash aplikasi', () => {
    mockStorage.clear();
    storageShouldThrow = true;
    assert.doesNotThrow(() => {
      updateChallengeAttempt(1, 1, true, 2);
    });
    storageShouldThrow = false;
  });

  await t.test('Skenario 5: Update tantangan mencatat attempts, passed, dan hintsUsed', () => {
    mockStorage.clear();
    resetProgress();

    // Coba tantangan 1 Bab 1 gagal dulu
    updateChallengeAttempt(1, 1, false, 1);
    assert.equal(getChallengeStatus(1, 1), 'dicoba');

    // Coba lagi dan berhasil
    updateChallengeAttempt(1, 1, true, 2);
    assert.equal(getChallengeStatus(1, 1), 'selesai');

    const progressObj = getProgress();
    const chal1 = progressObj.chapters['bab-1'].challenges['1'];
    assert.equal(chal1.passed, true);
    assert.equal(chal1.attempts, 2);
    assert.equal(chal1.hintsUsed, 2);
  });

  await t.test('Skenario 6: Update kuis mencatat skor terbaik dan riwayat percobaan', () => {
    resetProgress();
    updateQuizResult(1, 4, 5); // Percobaan 1: 4/5
    updateQuizResult(1, 3, 5); // Percobaan 2: 3/5 (skor turun)

    const p = getProgress();
    const q = p.chapters['bab-1'].quiz;
    assert.equal(q.lastScore, 3);
    assert.equal(q.bestScore, 4); // Tetap mempertahankan skor terbaik
    assert.equal(q.attempts, 2);
  });

  await t.test('Skenario 7: Status bab selesai hanya saat semua 3 tantangan lolos DAN kuis pernah dicoba', () => {
    resetProgress();
    assert.equal(getChapterStatus(1), 'belum');

    // Tandai 2 tantangan lulus
    updateChallengeAttempt(1, 1, true, 0);
    updateChallengeAttempt(1, 2, true, 0);
    assert.equal(getChapterStatus(1), 'sedang');

    // Tandai tantangan ke-3 lulus
    updateChallengeAttempt(1, 3, true, 0);
    // Belum selesai karena kuis belum pernah dikerjakan
    assert.equal(getChapterStatus(1), 'sedang');

    // Kerjakan kuis 1x
    updateQuizResult(1, 5, 5);
    // Sekarang status bab menjadi 'selesai'
    assert.equal(getChapterStatus(1), 'selesai');
  });

  await t.test('Skenario 7b: toggleReadSection, markChapterOpened, dan saveProgress mutasi state dengan benar', () => {
    resetProgress();
    markChapterOpened(2);
    assert.equal(getProgress().chapters['bab-2']?.opened, true);

    toggleReadSection(2, 'bab-2-1');
    assert.ok(getProgress().chapters['bab-2']?.readSections?.includes('bab-2-1'));

    toggleReadSection(2, 'bab-2-1');
    assert.ok(!getProgress().chapters['bab-2']?.readSections?.includes('bab-2-1'));

    const custom = getProgress();
    custom.chapters['bab-3'] = { opened: true, readSections: ['bab-3-1'], challenges: {} };
    saveProgress(custom);
    assert.equal(getProgress().chapters['bab-3']?.readSections?.length, 1);
  });

  await t.test('Skenario 8: Perhitungan overall stats akurat', () => {
    resetProgress();
    // Bab 1 selesai
    updateChallengeAttempt(1, 1, true);
    updateChallengeAttempt(1, 2, true);
    updateChallengeAttempt(1, 3, true);
    updateQuizResult(1, 5, 5);

    const stats = getOverallStats();
    assert.equal(stats.completedChapters, 1);
    assert.equal(stats.passedChallenges, 3);
    assert.equal(stats.attemptedQuizzes, 1);
    assert.ok(stats.overallPercentage > 0);
  });

  await t.test('Skenario 9: Reset progress menghapus seluruh data dan key', () => {
    resetProgress();
    const stats = getOverallStats();
    assert.equal(stats.completedChapters, 0);
    assert.equal(stats.passedChallenges, 0);
    assert.equal(stats.attemptedQuizzes, 0);
    assert.equal(stats.overallPercentage, 0);
  });

  // Bersihkan mock window
  delete globalThis.window;
});
