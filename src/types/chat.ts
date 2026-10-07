export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  message: string;
  history?: ChatHistoryItem[];
  context?: string;
}

export interface ChatApiResponse {
  reply?: string;
  error?: string;
}
