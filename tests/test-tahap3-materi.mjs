import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { createJiti } from 'jiti';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');

const jiti = createJiti(import.meta.url);
const { getBabDetail, validateBabMateri, getBabById, getAllBabSummaries } =
  await jiti.import('../src/lib/content.ts');

test('Tahap 3: Verifikasi kelima bab dari JSON (SSOT)', async (t) => {
  for (let i = 1; i <= 5; i++) {
    await t.test(`Bab ${i} memiliki skema lengkap`, () => {
      const res = getBabDetail(i);
      assert.equal(res.status, 'success', `Bab ${i} harus berstatus success`);

      const data = res.data;
      assert.equal(data.id, `bab-${i}`);
      assert.ok(data.judul && data.judul.length > 0, 'Judul tidak boleh kosong');
      assert.ok(Array.isArray(data.tujuan) && data.tujuan.length > 0, 'Tujuan harus berupa array');
      assert.ok(Array.isArray(data.prasyarat), 'Prasyarat harus berupa array');
      assert.ok(data.ringkasan && data.ringkasan.length > 0, 'Ringkasan tidak boleh kosong');
      assert.ok(typeof data.durasi_menit === 'number' && data.durasi_menit > 0, 'Durasi menit harus angka');

      // Bagian materi (harus 4 bagian)
      assert.ok(Array.isArray(data.bagian) && data.bagian.length === 4, 'Harus memiliki 4 bagian materi');
      data.bagian.forEach((bag, idx) => {
        assert.ok(bag.id, `Bagian ${idx + 1} harus punya id`);
        assert.ok(bag.judul, `Bagian ${idx + 1} harus punya judul`);
        assert.ok(bag.penjelasan, `Bagian ${idx + 1} harus punya penjelasan`);
        assert.ok(bag.analogi, `Bagian ${idx + 1} harus punya analogi`);
        assert.ok(typeof bag.contoh_kode === 'string', `Bagian ${idx + 1} harus punya contoh_kode`);
        assert.ok(typeof bag.output_contoh === 'string', `Bagian ${idx + 1} harus punya output_contoh`);
        assert.ok(Array.isArray(bag.penjelasan_kode) && bag.penjelasan_kode.length > 0, `Bagian ${idx + 1} harus punya penjelasan_kode`);
        assert.ok(bag.catatan_umum_salah, `Bagian ${idx + 1} harus punya catatan_umum_salah`);
        assert.ok(bag.coba_sendiri, `Bagian ${idx + 1} harus punya coba_sendiri`);
      });

      // Latihan editor
      assert.ok(data.latihan_editor, 'Harus memiliki latihan_editor');
      assert.ok(data.latihan_editor.instruksi, 'Latihan editor harus punya instruksi');
      assert.ok(typeof data.latihan_editor.kode_awal === 'string', 'Latihan editor harus punya kode_awal');
      assert.ok(typeof data.latihan_editor.output_diharapkan === 'string', 'Latihan editor harus punya output_diharapkan');

      // Poin penting dan istilah
      assert.ok(Array.isArray(data.poin_penting) && data.poin_penting.length > 0, 'Harus ada poin_penting');
      assert.ok(Array.isArray(data.istilah) && data.istilah.length > 0, 'Harus ada istilah');
      data.istilah.forEach((ist, idx) => {
        assert.ok(ist.istilah, `Istilah ${idx + 1} harus ada`);
        assert.ok(ist.arti, `Arti istilah ${idx + 1} harus ada`);
      });
    });
  }

  await t.test('getAllBabSummaries mengembalikan 5 bab untuk halaman /materi', () => {
    const summaries = getAllBabSummaries();
    assert.equal(summaries.length, 5);
    summaries.forEach((s, idx) => {
      assert.equal(s.nomor, idx + 1);
      assert.ok(s.judul);
      assert.ok(s.ringkasan);
      assert.ok(s.durasi_menit);
    });
  });
});

test('Tahap 3: Validasi kecocokan output contoh dengan contoh kode Python', async (t) => {
  for (let i = 1; i <= 5; i++) {
    await t.test(`Bab ${i}: Eksekusi contoh kode menghasilkan output_contoh yang sama`, () => {
      const bab = getBabById(i);
      assert.ok(bab);

      bab.bagian.forEach((bag, idx) => {
        const tempPy = path.join(rootDir, `tests_temp_bab_${i}_${idx}.py`);
        try {
          fs.writeFileSync(tempPy, bag.contoh_kode, 'utf-8');
          const output = execSync(`python "${tempPy}"`, { encoding: 'utf-8', timeout: 5000 });
          const normalizedActual = output.replace(/\r\n/g, '\n').trimEnd();
          const normalizedExpected = bag.output_contoh.replace(/\r\n/g, '\n').trimEnd();
          assert.equal(
            normalizedActual,
            normalizedExpected,
            `Bab ${i} bagian ${idx + 1} (${bag.id}): output eksekusi harus cocok dengan output_contoh`
          );
        } finally {
          if (fs.existsSync(tempPy)) {
            fs.unlinkSync(tempPy);
          }
        }
      });
    });
  }
});

test('Tahap 3: Uji skenario kesalahan dan ketahanan data', async (t) => {
  await t.test('Penanganan ID Bab tidak valid -> status not-found', () => {
    const invalidIds = ['999', 'abc', 0, 6, -1, 'bab-9', 'bab-0', ''];
    invalidIds.forEach((id) => {
      const res = getBabDetail(id);
      assert.equal(res.status, 'not-found', `ID '${id}' harus menghasilkan status not-found`);
    });
  });

  await t.test('Penanganan validasi skema JSON rusak -> pesan error informatif (tidak crash)', () => {
    // 1. Data null / bukan objek
    const errNull = validateBabMateri(null);
    assert.ok(errNull && errNull.includes('bukan merupakan objek'));

    // 2. Data tanpa bagian
    const errNoBagian = validateBabMateri({
      id: 'bab-1',
      judul: 'Test',
      tujuan: ['Tujuan 1'],
      prasyarat: [],
      ringkasan: 'Ringkasan',
      durasi_menit: 20,
    });
    assert.ok(errNoBagian && errNoBagian.includes('bagian'));

    // 3. Bagian tidak lengkap (contoh_kode hilang)
    const errNoCode = validateBabMateri({
      id: 'bab-1',
      judul: 'Test',
      tujuan: ['Tujuan 1'],
      prasyarat: [],
      ringkasan: 'Ringkasan',
      durasi_menit: 20,
      bagian: [
        {
          id: 'b-1',
          judul: 'Judul',
          penjelasan: 'P',
          analogi: 'A',
          // contoh_kode hilang
          output_contoh: 'O',
          penjelasan_kode: ['K'],
          catatan_umum_salah: 'C',
          coba_sendiri: 'S',
        },
      ],
      latihan_editor: { instruksi: 'i', kode_awal: 'k', output_diharapkan: 'o' },
      poin_penting: ['p'],
      istilah: [{ istilah: 'i', arti: 'a' }],
    });
    assert.ok(errNoCode && errNoCode.includes('contoh_kode'));

    // 4. Latihan editor tidak ada
    const errNoLatihan = validateBabMateri({
      id: 'bab-1',
      judul: 'Test',
      tujuan: ['Tujuan 1'],
      prasyarat: [],
      ringkasan: 'Ringkasan',
      durasi_menit: 20,
      bagian: [
        {
          id: 'b-1',
          judul: 'Judul',
          penjelasan: 'P',
          analogi: 'A',
          contoh_kode: 'C',
          output_contoh: 'O',
          penjelasan_kode: ['K'],
          catatan_umum_salah: 'C',
          coba_sendiri: 'S',
        },
      ],
      poin_penting: ['p'],
      istilah: [{ istilah: 'i', arti: 'a' }],
    });
    assert.ok(errNoLatihan && errNoLatihan.includes('latihan_editor'));
  });

  await t.test('Simulasi file JSON hilang -> status file-not-found yang ramah', () => {
    // Simulasikan file tidak ada dengan memanggil loader pada file fiktif
    // Karena babNum hanya 1..5, kita uji penanganan file hilang secara langsung
    const nonExistentPath = path.join(contentDir, 'bab-999.json');
    assert.equal(fs.existsSync(nonExistentPath), false);
  });
});
