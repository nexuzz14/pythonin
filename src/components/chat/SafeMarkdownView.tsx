'use client';

import React, { useState } from 'react';

interface SafeMarkdownViewProps {
  content: string;
}

/**
 * Komponen rendering teks markdown aman tanpa manipulasi innerHTML langsung.
 * Mencegah celah XSS dengan merender teks murni ke elemen-elemen React (React text nodes).
 * Mendukung: blok kode (dengan tombol salin), kode inline, bullet/numbered list, bold, italic.
 */
export default function SafeMarkdownView({ content }: SafeMarkdownViewProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-800 break-words">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} language={block.language} code={block.text} />;
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc list-outside pl-4 space-y-1 text-slate-700 my-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="pl-1">
                  <InlineFormattedText text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal list-outside pl-4 space-y-1 text-slate-700 my-1">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="pl-1">
                  <InlineFormattedText text={item} />
                </li>
              ))}
            </ol>
          );
        }
        return (
          <p key={idx} className="my-1.5">
            <InlineFormattedText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

// ---------------- Helper Components ----------------

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback jika clipboard API gagal
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs">
        <span className="font-mono text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {language || 'python'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-400"
          title="Salin kode ke papan klip"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-400">Tersalin!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs text-slate-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Parsing teks sebaris untuk mendeteksi `inline code`, **bold**, dan *italic*
 */
function InlineFormattedText({ text }: { text: string }) {
  // Regex untuk token inline code (`...`), bold (**...**), italic (*...*)
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;

        if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
          const raw = token.slice(1, -1);
          return (
            <code
              key={i}
              className="mx-0.5 rounded-md border border-blue-200/60 bg-blue-50/70 px-1.5 py-0.5 font-mono text-xs font-semibold text-blue-700"
            >
              {raw}
            </code>
          );
        }

        if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
          const raw = token.slice(2, -2);
          return (
            <strong key={i} className="font-semibold text-slate-900">
              {raw}
            </strong>
          );
        }

        if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
          const raw = token.slice(1, -1);
          return <em key={i} className="italic text-slate-800">{raw}</em>;
        }

        return <React.Fragment key={i}>{token}</React.Fragment>;
      })}
    </>
  );
}

// ---------------- Block Parser ----------------

type ParsedBlock =
  | { type: 'code'; language: string; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'paragraph'; text: string };

function parseBlocks(raw: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = raw.split('\n');
  let inCode = false;
  let codeLang = '';
  let codeBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      const text = paragraphBuffer.join(' ').trim();
      if (text) {
        blocks.push({ type: 'paragraph', text });
      }
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0 && listType) {
      blocks.push({ type: listType, items: [...listBuffer] });
      listBuffer = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Cek batas blok kode ```
    if (trimmed.startsWith('```')) {
      if (inCode) {
        // Akhir blok kode
        blocks.push({
          type: 'code',
          language: codeLang || 'python',
          text: codeBuffer.join('\n'),
        });
        codeBuffer = [];
        inCode = false;
        codeLang = '';
      } else {
        // Awal blok kode
        flushParagraph();
        flushList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    // Cek baris kosong -> pemisah paragraf
    if (trimmed === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // Cek bullet list (* atau -)
    const bulletMatch = line.match(/^(\s*)[*-]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listBuffer.push(bulletMatch[2]);
      continue;
    }

    // Cek numbered list (1. atau 2.)
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);
    if (numberMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listBuffer.push(numberMatch[2]);
      continue;
    }

    // Teks biasa / kelanjutan paragraf
    flushList();
    paragraphBuffer.push(trimmed);
  }

  // Sisa buffer di akhir
  if (inCode) {
    blocks.push({
      type: 'code',
      language: codeLang || 'python',
      text: codeBuffer.join('\n'),
    });
  }
  flushParagraph();
  flushList();

  return blocks;
}
