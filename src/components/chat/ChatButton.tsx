'use client';

import React from 'react';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export default function ChatButton({ isOpen, onClick, unreadCount = 0 }: ChatButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Tutup panel tutor Python' : 'Buka panel tanya tutor AI'}
      aria-expanded={isOpen}
      className={`fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-4 sm:right-6 z-40 h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 focus:outline-hidden focus:ring-4 focus:ring-blue-300 active:scale-95 ${
        isOpen
          ? 'hidden sm:flex bg-slate-800 text-white shadow-slate-900/20 rotate-90'
          : 'flex bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5'
      }`}
    >
      {isOpen ? (
        // X Close Icon
        <svg
          className="h-6 w-6 transition-transform -rotate-90"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        // Chatbot / Tutor AI Icon
        <div className="relative flex items-center justify-center">
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {/* Status Indicator Green Dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
}
