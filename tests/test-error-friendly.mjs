import assert from 'node:assert';
import { createJiti } from 'jiti';

const jiti = createJiti(import.meta.url);
const { formatFriendlyError } = await jiti.import('../src/lib/error-friendly.ts');

console.log('=== PENGUJIAN OTOMATIS: formatFriendlyError (src/lib/error-friendly.ts) ===\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err);
    failCount++;
  }
}

// 1. SyntaxError Umum
runTest('1. SyntaxError umum (kurung / titik dua)', () => {
  const result = formatFriendlyError({
    type: 'SyntaxError',
    message: 'unexpected EOF while parsing',
    line: 3,
    rawTraceback: '  File "<exec>", line 3\n    print("Halo\n               ^\nSyntaxError: unexpected EOF while parsing',
  });

  assert.strictEqual(result.type, 'SyntaxError');
  assert.strictEqual(result.line, 3);
  assert.ok(result.title.includes('Penulisan Kode'));
  assert.ok(result.suggestion.includes('tanda kurung'));
});

// 2. SyntaxError dengan Kutip Melengkung
runTest('2. SyntaxError dengan kutip melengkung dari keyboard HP', () => {
  const code = 'print(“Halo, dunia!”)';
  const result = formatFriendlyError(
    {
      type: 'SyntaxError',
      message: "invalid character '“' (U+201C)",
      line: 1,
      rawTraceback: '  File "<exec>", line 1\n    print(“Halo, dunia!”)\n          ^\nSyntaxError: invalid character \'“\' (U+201C)',
    },
    code
  );

  assert.strictEqual(result.type, 'SyntaxError');
  assert.strictEqual(result.line, 1);
  assert.ok(result.title.includes('Kutip Melengkung'));
  assert.ok(result.suggestion.includes('kutip lurus'));
});

// 3. NameError
runTest('3. NameError (variabel belum didefinisikan)', () => {
  const result = formatFriendlyError({
    type: 'NameError',
    message: "name 'nama' is not defined",
    line: 2,
    rawTraceback: '  File "<exec>", line 2, in <module>\n    print(nama)\nNameError: name \'nama\' is not defined',
  });

  assert.strictEqual(result.type, 'NameError');
  assert.strictEqual(result.line, 2);
  assert.ok(result.title.includes('Nama Belum Dikenal'));
  assert.ok(result.message.includes("'nama'"));
  assert.ok(result.suggestion.includes('ejaan'));
});

// 4. IndentationError
runTest('4. IndentationError (blok tanpa indentasi)', () => {
  const result = formatFriendlyError({
    type: 'IndentationError',
    message: 'expected an indented block after "if" statement on line 1',
    line: 2,
    rawTraceback: '  File "<exec>", line 2\n    print("lulus")\n    ^\nIndentationError: expected an indented block after "if" statement on line 1',
  });

  assert.strictEqual(result.type, 'IndentationError');
  assert.strictEqual(result.line, 2);
  assert.ok(result.title.includes('Indentasi'));
  assert.ok(result.suggestion.includes('4 spasi'));
});

// 5. TypeError
runTest('5. TypeError (gabungan tipe data tidak sesuai)', () => {
  const result = formatFriendlyError({
    type: 'TypeError',
    message: 'can only concatenate str (not "int") to str',
    line: 4,
    rawTraceback: '  File "<exec>", line 4, in <module>\n    total = "5" + 3\nTypeError: can only concatenate str (not "int") to str',
  });

  assert.strictEqual(result.type, 'TypeError');
  assert.strictEqual(result.line, 4);
  assert.ok(result.title.includes('Tipe Data Tidak Cocok'));
  assert.ok(result.suggestion.includes('str(') || result.suggestion.includes('f-string'));
});

// 6. ValueError
runTest('6. ValueError (nilai teks tidak bisa diubah ke angka)', () => {
  const result = formatFriendlyError({
    type: 'ValueError',
    message: "invalid literal for int() with base 10: 'abc'",
    line: 1,
    rawTraceback: '  File "<exec>", line 1, in <module>\n    angka = int("abc")\nValueError: invalid literal for int() with base 10: \'abc\'',
  });

  assert.strictEqual(result.type, 'ValueError');
  assert.strictEqual(result.line, 1);
  assert.ok(result.title.includes('Nilai Data Tidak Sesuai'));
  assert.ok(result.suggestion.includes('int('));
});

// 7. ZeroDivisionError
runTest('7. ZeroDivisionError (pembagian dengan angka nol)', () => {
  const result = formatFriendlyError({
    type: 'ZeroDivisionError',
    message: 'division by zero',
    line: 2,
    rawTraceback: '  File "<exec>", line 2, in <module>\n    hasil = 10 / 0\nZeroDivisionError: division by zero',
  });

  assert.strictEqual(result.type, 'ZeroDivisionError');
  assert.strictEqual(result.line, 2);
  assert.ok(result.title.includes('Pembagian dengan Nol'));
  assert.ok(result.message.includes('membagi angka dengan nol'));
});

// 8. EOFError (Simulasi input())
runTest('8. EOFError (pemanggilan fungsi input() yang tidak didukung)', () => {
  const result = formatFriendlyError({
    type: 'EOFError',
    message: 'input() tidak didukung di media ini.',
    line: 1,
    rawTraceback: '  File "<exec>", line 1, in <module>\n    nama = input("Nama: ")\nEOFError: input() tidak didukung di media ini.',
  });

  assert.strictEqual(result.type, 'EOFError');
  assert.ok(result.title.includes('Input Program Disimulasikan'));
  assert.ok(result.suggestion.includes('variabel'));
});

// 9. Timeout
runTest('9. Timeout (> 5 detik eksekusi)', () => {
  const result = formatFriendlyError({
    type: 'Timeout',
    message: 'Program running time exceeded 5 seconds limit.',
    line: null,
    rawTraceback: 'TimeoutError: Program running time exceeded 5 seconds limit.',
  });

  assert.strictEqual(result.type, 'Timeout');
  assert.ok(result.title.includes('Timeout'));
  assert.ok(result.message.includes('5 detik'));
  assert.ok(result.suggestion.includes('perulangan'));
});

// 10. Fallback Error Lainnya
runTest('10. Fallback Error Lainnya (contoh: KeyError)', () => {
  const result = formatFriendlyError({
    type: 'KeyError',
    message: "'kunci_rahasia'",
    line: 5,
    rawTraceback: 'KeyError: \'kunci_rahasia\'',
  });

  assert.strictEqual(result.type, 'KeyError');
  assert.strictEqual(result.line, 5);
  assert.ok(result.title.includes('KeyError'));
  assert.ok(result.suggestion.includes('detail teknis'));
});

console.log(`\nRingkasan Hasil Pengujian: ${passCount} Lolos, ${failCount} Gagal.`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('Semua 10 pengujian otomatis error ramah 100% HIJAU!');
}
