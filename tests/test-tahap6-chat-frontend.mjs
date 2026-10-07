import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Tahap 6: Keamanan Frontend & Anti-XSS (Tanpa dangerouslySetInnerHTML)', () => {
  const safeMarkdownPath = path.resolve('src/components/chat/SafeMarkdownView.tsx');
  const chatPanelPath = path.resolve('src/components/chat/ChatPanel.tsx');
  const chatWidgetPath = path.resolve('src/components/chat/ChatWidget.tsx');

  const files = [safeMarkdownPath, chatPanelPath, chatWidgetPath];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(
      content.includes('dangerouslySetInnerHTML'),
      false,
      `File ${path.basename(file)} tidak boleh memuat dangerouslySetInnerHTML demi mencegah celah XSS`
    );
  }
});

test('Tahap 6: Perlindungan API Key (Tidak Bocor ke Klien)', () => {
  // Pastikan tidak ada NEXT_PUBLIC_GEMINI di seluruh kode sumber src/
  const checkDir = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDir(fullPath);
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');
        assert.equal(
          fileContent.includes('NEXT_PUBLIC_GEMINI'),
          false,
          `File ${fullPath} memuat NEXT_PUBLIC_GEMINI yang membocorkan key ke bundel klien!`
        );
        // Pastikan GEMINI_API_KEY hanya diakses di folder server (src/app/api atau file server)
        if (fileContent.includes('GEMINI_API_KEY')) {
          const isServerPath =
            fullPath.includes('src\\app\\api\\') ||
            fullPath.includes('src/app/api/') ||
            fullPath.includes('tests');
          assert.equal(
            isServerPath,
            true,
            `GEMINI_API_KEY tidak boleh diakses langsung di komponen klien: ${fullPath}`
          );
        }
      }
    }
  };

  checkDir(path.resolve('src'));
});

test('Tahap 6: Verifikasi Responsivitas dan Aksesibilitas Chat UI', () => {
  const chatPanelContent = fs.readFileSync(path.resolve('src/components/chat/ChatPanel.tsx'), 'utf8');
  const chatButtonContent = fs.readFileSync(path.resolve('src/components/chat/ChatButton.tsx'), 'utf8');

  // Periksa lebar layar kecil / HP (360px) didukung
  assert.ok(chatPanelContent.includes('inset-x-2'), 'Mendukung tampilan layar sempit (HP 360px)');
  assert.ok(chatPanelContent.includes('sm:w-[410px]'), 'Mendukung ukuran desktop responsif');

  // Periksa disclaimer penting
  assert.ok(chatPanelContent.includes('Asisten AI bisa salah'), 'Terdapat disclaimer bahwa asisten AI bisa salah');

  // Periksa hitungan karakter
  assert.ok(chatPanelContent.includes('maxLength'), 'Terdapat batasan maxLength');
  assert.ok(chatPanelContent.includes('{charCount}/{maxLength}'), 'Terdapat indikator hitungan karakter');

  // Periksa tombol percakapan baru / reset
  assert.ok(chatPanelContent.includes('onResetConversation'), 'Terdapat handler reset percakapan');

  // Periksa aksesibilitas ARIA
  assert.ok(chatButtonContent.includes('aria-label'), 'ChatButton memiliki atribut aria-label');
  assert.ok(chatButtonContent.includes('aria-expanded'), 'ChatButton memiliki atribut aria-expanded');
});
