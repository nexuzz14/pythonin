'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import type { ChatMessage, ChatHistoryItem } from '@/types/chat';
import {
  subscribeChat,
  getChatMessagesSnapshot,
  getChatServerSnapshot,
  updateChatMessages,
  resetChatMessages,
} from '@/lib/chat-store';
import ChatButton from './ChatButton';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pathname = usePathname();

  // Sinkronisasi riwayat pesan secara aman tanpa cascading render
  const messages = useSyncExternalStore(
    subscribeChat,
    getChatMessagesSnapshot,
    getChatServerSnapshot
  );

  // Reset percakapan ke kondisi awal
  const handleResetConversation = () => {
    resetChatMessages();
    setErrorMessage(null);
    setInputText('');
  };

  // Deteksi ringkas konteks halaman saat ini
  const getCurrentPageContext = (): string | undefined => {
    if (!pathname) return undefined;
    if (pathname.startsWith('/materi/bab-1')) return 'Materi Bab 1: Berkenalan dengan Python & Variabel';
    if (pathname.startsWith('/materi/bab-2')) return 'Materi Bab 2: Tipe Data & Operator Dasar';
    if (pathname.startsWith('/materi/bab-3')) return 'Materi Bab 3: Percabangan Logika (if, elif, else)';
    if (pathname.startsWith('/materi/bab-4')) return 'Materi Bab 4: Perulangan (for & while loop)';
    if (pathname.startsWith('/materi/bab-5')) return 'Materi Bab 5: Fungsi Dasar & Mini Proyek';
    if (pathname.startsWith('/kuis')) return 'Sesi Kuis Pemahaman Python';
    if (pathname.startsWith('/latihan')) return 'Sesi Tantangan Menulis Kode Python';
    return undefined;
  };

  // Kirim pesan ke Backend API /api/chat
  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = (overrideText ?? inputText).trim();
    if (!textToSend || isLoading) return;

    if (textToSend.length > 500) {
      setErrorMessage('Pesan melebihi batas 500 karakter. Mohon persingkat ya.');
      return;
    }

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const nextMessages = [...messages, userMessage];
    updateChatMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Susun 10 riwayat percakapan terakhir (kecuali pesan pembuka awal)
      const recentHistory: ChatHistoryItem[] = nextMessages
        .filter((m) => m.id !== 'welcome-tutor')
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Kirim ke API route Next.js
      const context = getCurrentPageContext();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          history: recentHistory,
          context,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghubungi asisten AI.');
      }

      const botReply = data.reply || 'Maaf, tidak ada respons dari tutor.';
      const botMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        content: botReply,
        timestamp: Date.now(),
      };

      const finalMessages = [...nextMessages, botMessage];
      updateChatMessages(finalMessages);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Terjadi gangguan jaringan saat menghubungi tutor. Silakan coba lagi.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        inputText={inputText}
        setInputText={setInputText}
        onSendMessage={handleSendMessage}
        onResetConversation={handleResetConversation}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onClearError={() => setErrorMessage(null)}
        maxLength={500}
      />
    </>
  );
}
