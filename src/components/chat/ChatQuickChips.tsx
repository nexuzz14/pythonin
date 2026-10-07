'use client';

import React from 'react';

interface ChatQuickChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  'Apa bedanya for dan while di Python?',
  'Kenapa muncul IndentationError dan cara aturnya?',
  'Bagaimana cara kerja percabangan if-else?',
  'Beri petunjuk cara membuat variabel dan cetak nilainya',
];

export default function ChatQuickChips({ onSelectPrompt, disabled }: ChatQuickChipsProps) {
  return (
    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
      <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
        <span>💡</span> Pertanyaan cepat untuk dicoba:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700 focus:outline-hidden focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:pointer-events-none active:scale-98"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
