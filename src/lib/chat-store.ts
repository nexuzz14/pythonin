import type { ChatMessage } from '@/types/chat';

export const CHAT_STORAGE_KEY = 'pythonin_chat_session_history';

export const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-tutor',
  role: 'assistant',
  content:
    'Halo! Aku **Pythonin Bot**, tutor belajarmu untuk materi Python dasar kelas X SMK RPL. Ada materi variabel, percabangan, perulangan, atau kode yang bikin kamu bingung? Tanyakan saja di sini ya!',
  timestamp: 0,
};

const listeners = new Set<() => void>();
let memoryMessages: ChatMessage[] = [INITIAL_MESSAGE];
let hasHydrated = false;

function hydrateFromStorage(): void {
  if (typeof window === 'undefined' || hasHydrated) return;
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryMessages = parsed;
      }
    }
  } catch {
    // Abaikan jika sessionStorage tidak dapat diakses
  }
  hasHydrated = true;
}

export function getChatMessagesSnapshot(): ChatMessage[] {
  hydrateFromStorage();
  return memoryMessages;
}

const SERVER_SNAPSHOT: ChatMessage[] = [INITIAL_MESSAGE];

export function getChatServerSnapshot(): ChatMessage[] {
  return SERVER_SNAPSHOT;
}

export function updateChatMessages(newMessages: ChatMessage[]): void {
  memoryMessages = newMessages;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(newMessages));
    } catch {
      // Abaikan bila storage diblokir
    }
  }
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Abaikan error pada listener
    }
  });
}

export function resetChatMessages(): void {
  const fresh = [
    {
      ...INITIAL_MESSAGE,
      timestamp: Date.now(),
    },
  ];
  updateChatMessages(fresh);
}

export function subscribeChat(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
