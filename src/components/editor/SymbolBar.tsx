'use client';

import React from 'react';

interface SymbolBarProps {
  onInsert: (symbol: string) => void;
  className?: string;
}

interface SymbolItem {
  label: string;
  insertValue: string;
  ariaLabel: string;
}

const SYMBOLS: SymbolItem[] = [
  { label: ':', insertValue: ':', ariaLabel: 'Titik dua' },
  { label: '(', insertValue: '(', ariaLabel: 'Kurung buka' },
  { label: ')', insertValue: ')', ariaLabel: 'Kurung tutup' },
  { label: '"', insertValue: '"', ariaLabel: 'Tanda kutip ganda' },
  { label: "'", insertValue: "'", ariaLabel: 'Tanda petik tunggal' },
  { label: 'Tab', insertValue: '    ', ariaLabel: 'Indentasi empat spasi' },
  { label: '#', insertValue: '#', ariaLabel: 'Tanda pagar atau komentar' },
  { label: '=', insertValue: '=', ariaLabel: 'Tanda sama dengan' },
  { label: '_', insertValue: '_', ariaLabel: 'Garis bawah atau underscore' },
];

export default function SymbolBar({ onInsert, className = '' }: SymbolBarProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, symbol: string) => {
    // Mencegah hilangnya fokus kursor dari editor
    e.preventDefault();
    onInsert(symbol);
  };

  return (
    // Tampil di layar mobile dan tablet <= 768px (PRD M6)
    <div className={`relative w-full block min-[769px]:hidden ${className}`}>
      <div
        className="w-full overflow-x-auto py-1 px-1 bg-slate-800/90 rounded-t-xl border-t border-x border-slate-700/80 shadow-xs scrollbar-none"
        aria-label="Bilah tombol simbol pembantu untuk keyboard HP"
        role="toolbar"
      >
        <div className="flex items-center gap-1.5 w-max pr-6">
          {SYMBOLS.map((item) => (
            <button
              key={item.label}
              type="button"
              onMouseDown={(e) => handleClick(e, item.insertValue)}
              onClick={(e) => handleClick(e, item.insertValue)}
              aria-label={item.ariaLabel}
              className="flex items-center justify-center min-h-[44px] min-w-[44px] px-3 rounded-lg bg-slate-700 hover:bg-slate-600 active:bg-blue-600 text-slate-100 font-mono text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 select-none cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {/* Indikator Halus Geser Horizontal (Fade Hint) */}
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-800/90 to-transparent rounded-tr-xl"
        aria-hidden="true"
      />
    </div>
  );
}
