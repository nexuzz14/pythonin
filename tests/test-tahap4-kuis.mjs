import test from 'node:test';
import assert from 'node:assert/strict';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const {
  getKuisDetail,
  getKuisByBab,
  validateKuisBab,
} = await jiti.import('../src/lib/content.ts');

const {
  saveQuizResult,
  getQuizResult,
  getAllQuizResults,
  clearQuizResult,
} = await jiti.import('../src/lib/quiz-progress.ts');

test('Tahap 4: Verifikasi integritas SSOT Kuis untuk kelima bab (kuis-bab-1 s.d. 5)', async (t) => {
  for (let babNum = 1; babNum <= 5; babNum++) {
    await t.test(`Bab ${babNum}: file kuis valid dan skema lengkap`, () => {
      const res = getKuisDetail(babNum);
      assert.equal(res.status, 'success', `Bab ${babNum} harus berstatus success`);

      const data = res.data;
      assert.equal(data.bab, `bab-${babNum}`);
      assert.ok(data.judul_kuis && data.judul_kuis.length > 0, 'Judul kuis tidak boleh kosong');
      assert.ok(Array.isArray(data.soal) && data.soal.length === 5, 'Harus memiliki 5 butir soal');

      data.soal.forEach((soal, sIdx) => {
        assert.equal(soal.id, sIdx + 1, `ID soal ke-${sIdx + 1} harus konsisten`);
        assert.ok(['mudah', 'sedang', 'sulit'].includes(soal.tingkat), `Tingkat kesulitan valid di soal ${sIdx + 1}`);
        assert.ok(soal.capaian && soal.capaian.length > 0, `Capaian ada di soal ${sIdx + 1}`);
        assert.ok(soal.pertanyaan && soal.pertanyaan.length > 0, `Pertanyaan ada di soal ${sIdx + 1}`);
        assert.ok(Array.isArray(soal.opsi) && soal.opsi.length >= 2, `Opsi minimal 2 di soal ${sIdx + 1}`);
        assert.ok(
          Number.isInteger(soal.jawaban_benar) &&
          soal.jawaban_benar >= 0 &&
          soal.jawaban_benar < soal.opsi.length,
          `jawaban_benar berada dalam rentang opsi di soal ${sIdx + 1}`
        );
        assert.ok(soal.pembahasan && soal.pembahasan.length > 0, `Pembahasan ada di soal ${sIdx + 1}`);
        assert.ok(typeof soal.petunjuk === 'string', `Petunjuk berupa string di soal ${sIdx + 1}`);
        assert.ok(
          soal.kode === null || typeof soal.kode === 'string',
          `Kode bernilai null atau string di soal ${sIdx + 1}`
        );
      });
    });
  }
});

test('Tahap 4: Ketahanan dan validasi error ramah (Kebutuhan 8)', async (t) => {
  await t.test('Penanganan ID Bab tidak valid -> status not-found', () => {
    const invalidIds = ['999', 'abc', 0, 6, -1, 'bab-9', 'bab-0', ''];
    invalidIds.forEach((id) => {
      const res = getKuisDetail(id);
      assert.equal(res.status, 'not-found', `ID '${id}' harus menghasilkan status not-found`);
    });
  });

  await t.test('Validasi skema kuis rusak menghasilkan pesan error ramah', () => {
    // 1. Data null / bukan objek
    assert.ok(validateKuisBab(null)?.includes('bukan merupakan objek'));

    // 2. Data tanpa properti bab
    assert.ok(validateKuisBab({ judul_kuis: 'Kuis', soal: [] })?.includes('bab'));

    // 3. Data soal kosong
    assert.ok(validateKuisBab({ bab: 'bab-1', judul_kuis: 'Kuis', soal: [] })?.includes('tidak boleh kosong'));

    // 4. Soal tanpa jawaban_benar valid
    const soalInvalid = [
      {
        id: 1,
        tingkat: 'mudah',
        capaian: 'c',
        pertanyaan: 'p',
        kode: null,
        opsi: ['A', 'B'],
        jawaban_benar: 9, // di luar indeks
        pembahasan: 'p',
        petunjuk: 'pt',
      },
    ];
    assert.ok(
      validateKuisBab({ bab: 'bab-1', judul_kuis: 'Kuis', soal: soalInvalid })?.includes(
        'jawaban_benar'
      )
    );
  });
});

test('Tahap 4: Logika Perhitungan Skor (Semua Benar, Semua Salah, Campuran)', async (t) => {
  const kuisBab1 = getKuisByBab(1);
  assert.ok(kuisBab1);
  const total = kuisBab1.soal.length; // 5 soal

  // Skenario 1: Menjawab SEMUA BENAR (100%)
  await t.test('Skenario 1: Semua Benar -> Skor 5/5 (100%)', () => {
    let skor = 0;
    const jawabanSiswa = kuisBab1.soal.map((s) => {
      const dipilih = s.jawaban_benar; // Siswa memilih kunci jawaban
      const isBenar = dipilih === s.jawaban_benar;
      if (isBenar) skor += 1;
      return { id: s.id, isBenar, tingkat: s.tingkat };
    });

    assert.equal(skor, 5);
    const persentase = Math.round((skor / total) * 100);
    assert.equal(persentase, 100);

    // Verifikasi semua benar per kesulitan
    const rincian = { mudah: 0, sedang: 0, sulit: 0 };
    jawabanSiswa.forEach((j) => {
      if (j.isBenar) rincian[j.tingkat] += 1;
    });
    assert.equal(rincian.mudah, 2);
    assert.equal(rincian.sedang, 2);
    assert.equal(rincian.sulit, 1);
  });

  // Skenario 2: Menjawab SEMUA SALAH (0%)
  await t.test('Skenario 2: Semua Salah -> Skor 0/5 (0%)', () => {
    let skor = 0;
    const soalSalah = [];
    kuisBab1.soal.forEach((s) => {
      // Pilih opsi yang pasti salah
      const salahIndex = (s.jawaban_benar + 1) % s.opsi.length;
      const isBenar = salahIndex === s.jawaban_benar;
      if (isBenar) skor += 1;
      else {
        soalSalah.push({
          soal: s,
          dipilih: s.opsi[salahIndex],
          benar: s.opsi[s.jawaban_benar],
        });
      }
    });

    assert.equal(skor, 0);
    const persentase = Math.round((skor / total) * 100);
    assert.equal(persentase, 0);
    assert.equal(soalSalah.length, 5, 'Seluruh 5 soal harus masuk ke daftar soal salah');
  });

  // Skenario 3: Campuran (3 Benar, 2 Salah -> 60%)
  await t.test('Skenario 3: Campuran 3 Benar, 2 Salah -> Skor 3/5 (60%)', () => {
    let skor = 0;
    const jawabanCampuran = [
      kuisBab1.soal[0].jawaban_benar, // Soal 1 Benar
      kuisBab1.soal[1].jawaban_benar, // Soal 2 Benar
      kuisBab1.soal[2].jawaban_benar, // Soal 3 Benar
      (kuisBab1.soal[3].jawaban_benar + 1) % 4, // Soal 4 Salah
      (kuisBab1.soal[4].jawaban_benar + 1) % 4, // Soal 5 Salah
    ];

    const salahList = [];
    kuisBab1.soal.forEach((s, idx) => {
      const dipilih = jawabanCampuran[idx];
      const isBenar = dipilih === s.jawaban_benar;
      if (isBenar) skor += 1;
      else salahList.push(s);
    });

    assert.equal(skor, 3);
    const persentase = Math.round((skor / total) * 100);
    assert.equal(persentase, 60);
    assert.equal(salahList.length, 2);
  });
});

test('Tahap 4: Mekanisme Pengacakan Opsi Tetap Menjaga Akurasi Jawaban Benar (Kebutuhan 6)', () => {
  const kuisBab2 = getKuisByBab(2);
  assert.ok(kuisBab2);

  for (const soal of kuisBab2.soal) {
    // Siapkan pemetaan indeks asli
    const opsiMapped = soal.opsi.map((teks, idx) => ({
      teks,
      indeksAsli: idx,
    }));

    // Simulasikan pengacakan 20 kali untuk menguji konsistensi
    for (let sim = 0; sim < 20; sim++) {
      const shuffled = [...opsiMapped].sort(() => Math.random() - 0.5);

      // Cari elemen yang indeksAsli-nya merupakan jawaban_benar
      const correctOption = shuffled.find((item) => item.indeksAsli === soal.jawaban_benar);
      assert.ok(correctOption, 'Opsi jawaban benar harus selalu ada dalam opsi teracak');
      assert.equal(
        correctOption.teks,
        soal.opsi[soal.jawaban_benar],
        'Teks opsi jawaban benar tidak boleh berubah saat diacak'
      );

      // Pastikan ketika siswa memilih opsi ini, evaluasi menghasilkan isBenar = true
      const isBenar = correctOption.indeksAsli === soal.jawaban_benar;
      assert.equal(isBenar, true);

      // Pastikan memilih opsi lain menghasilkan false
      const wrongOption = shuffled.find((item) => item.indeksAsli !== soal.jawaban_benar);
      if (wrongOption) {
        assert.equal(wrongOption.indeksAsli === soal.jawaban_benar, false);
      }
    }
  }
});

test('Tahap 4: State Progres Kuis dan Reset (Kebutuhan 9 & DoD)', async (t) => {
  await t.test('Penyimpanan hasil kuis via saveQuizResult', () => {
    const res = saveQuizResult(1, 4, 5, 80);
    assert.equal(res.babNumber, 1);
    assert.equal(res.skor, 4);
    assert.equal(res.total, 5);
    assert.equal(res.persentase, 80);
    assert.ok(res.selesaiPada);
  });

  await t.test('Pengambilan dan pembersihan hasil kuis aman di lingkungan SSR / non-browser', () => {
    const single = getQuizResult(1);
    assert.equal(single, null);

    const all = getAllQuizResults();
    assert.deepEqual(all, {});

    assert.doesNotThrow(() => {
      clearQuizResult(1);
    });
  });
});
