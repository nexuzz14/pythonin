'use client';

import React, { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/types/chat';
import SafeMarkdownView from './SafeMarkdownView';
import ChatQuickChips from './ChatQuickChips';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: (overrideText?: string) => void;
  onResetConversation: () => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  maxLength?: number;
}

export default function ChatPanel({
  isOpen,
  onClose,
  messages,
  inputText,
  setInputText,
  onSendMessage,
  onResetConversation,
  isLoading,
  errorMessage,
  onClearError,
  maxLength = 500,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll ke pesan terbawah saat ada pesan baru atau sedang loading
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Fokuskan kursor ke input saat panel dibuka
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const charCount = inputText.length;
  const isOverLimit = charCount > maxLength;
  const isInputEmpty = inputText.trim().length === 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isInputEmpty && !isOverLimit && !isLoading) {
        onSendMessage();
      }
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    onSendMessage(prompt);
  };

  return (
    <>
      {/* Backdrop overlay di layar ponsel */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-50 sm:hidden animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        aria-label="Panel Asisten Belajar Python"
        className="fixed inset-x-0 bottom-0 sm:bottom-20 sm:right-6 sm:inset-x-auto sm:w-[420px] h-[85dvh] sm:h-[580px] sm:max-h-[580px] z-50 flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20 overflow-hidden animate-fadeIn"
      >
        {/* Drag handle untuk HP */}
        <div className="sm:hidden bg-slate-900 pt-2 pb-0.5 flex justify-center">
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* 1. Header Panel */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 font-mono font-bold text-white shadow-xs">
              🐍
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold leading-tight">Tutor Python AI</h2>
                <span className="flex h-2 w-2 rounded-full bg-emerald-400" title="Online" />
              </div>
              <p className="text-[11px] text-slate-400">SMK RPL Kelas X • Siap Bantu</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Tombol Percakapan Baru */}
            <button
              type="button"
              onClick={onResetConversation}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-400 disabled:opacity-50 min-h-[44px]"
              title="Hapus riwayat dan mulai percakapan baru"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Reset</span>
            </button>

            {/* Tombol Tutup Panel */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-400 min-h-[44px] min-w-[44px]"
              aria-label="Tutup panel chat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

      {/* 2. Catatan / Disclaimer Singkat */}
      <div className="border-b border-amber-200/70 bg-amber-50/90 px-3 py-1.5 text-center text-[11px] text-amber-900 flex items-center justify-center gap-1.5">
        <span className="text-amber-600 font-bold">ℹ️</span>
        <span>Asisten AI bisa salah, selalu cek kembali ke materi & guru ya.</span>
      </div>

      {/* 3. Daftar Pesan Chat (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 px-1">
                <span className="font-semibold">{isUser ? 'Kamu' : 'Tutor Python'}</span>
                <span>•</span>
                <span>{timeStr}</span>
              </div>

              <div
                className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[90%] shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-slate-100'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                ) : (
                  <SafeMarkdownView content={msg.content} />
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start max-w-full animate-in fade-in duration-150">
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500 px-1">
              <span className="font-semibold">Tutor Python</span>
              <span>•</span>
              <span className="text-blue-600 animate-pulse">Mengetik...</span>
            </div>
            <div className="rounded-2xl rounded-tl-xs bg-white border border-slate-200/90 px-4 py-3 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span className="ml-2 text-xs font-medium text-slate-500">Menganalisis pertanyaan...</span>
              </div>
            </div>
          </div>
        )}

        {/* Banner Pesan Error (Ramah ke Siswa) */}
        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start justify-between gap-2">
            <div className="flex items-start gap-1.5">
              <span className="text-red-500 font-bold mt-0.5">⚠️</span>
              <p className="leading-snug">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-red-500 hover:text-red-700 font-bold text-sm px-1"
              aria-label="Tutup pesan error"
            >
              ✕
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Contoh Pertanyaan Cepat (Hanya muncul jika percakapan masih awal) */}
      {messages.length <= 1 && (
        <ChatQuickChips onSelectPrompt={handleQuickPrompt} disabled={isLoading} />
      )}

      {/* 5. Input Area */}
      <footer className="border-t border-slate-200/90 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isInputEmpty && !isOverLimit && !isLoading) {
              onSendMessage();
            }
          }}
          className="flex flex-col gap-1.5"
        >
          <div className="relative">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Tanya seputar Python (misal: apa itu variabel?)..."
              maxLength={maxLength + 10} // Beri sedikit toleransi agar hitungan terlihat merah jika lewat
              className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50/50 p-2.5 pr-14 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:opacity-60 min-h-[52px]"
            />
            {/* Tombol Kirim Melayang di Dalam Box */}
            <button
              type="submit"
              disabled={isInputEmpty || isOverLimit || isLoading}
              aria-label="Kirim pertanyaan"
              className="absolute right-1.5 bottom-1.5 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-blue-600 text-white transition-all hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-400 disabled:opacity-30 disabled:pointer-events-none active:scale-95 shadow-xs"
            >
              {isLoading ? (
                <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Bar Info Bawah: Hitungan Karakter & Tombol Pintasan */}
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
            <span>
              Tekan <kbd className="font-mono bg-slate-100 px-1 rounded text-[10px]">Enter ↵</kbd> untuk kirim
            </span>
            <span
              className={`font-mono text-[11px] font-medium ${
                isOverLimit
                  ? 'text-red-600 font-bold'
                  : charCount > 450
                  ? 'text-amber-600 font-semibold'
                  : 'text-slate-400'
              }`}
            >
              {charCount}/{maxLength}
            </span>
          </div>
        </form>
      </footer>
    </section>
  </>
  );
}
