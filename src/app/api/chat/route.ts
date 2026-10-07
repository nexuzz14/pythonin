import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import {
  CHAT_CONFIG,
  SYSTEM_INSTRUCTION,
  FRIENDLY_ERROR_MESSAGES,
} from '@/lib/chat-config';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import type { ChatApiRequest, ChatApiResponse } from '@/types/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('host');
  if (!host) return true;
  try {
    const originHost = new URL(origin).host;
    return (
      originHost === host ||
      originHost.includes('localhost') ||
      originHost.includes('127.0.0.1')
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request): Promise<NextResponse<ChatApiResponse>> {
  // 1. Validasi Origin (Cegah penyalahgunaan lintas-domain / CSRF)
  if (!isAllowedOrigin(req)) {
    return NextResponse.json(
      { error: 'Akses ditolak: origin permintaan tidak diizinkan.' },
      { status: 403 }
    );
  }

  // 2. Pembatasan Laju (Rate Limiting) per IP Pengunjung
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(
    clientIp,
    CHAT_CONFIG.RATE_LIMIT_MAX_REQUESTS,
    CHAT_CONFIG.RATE_LIMIT_WINDOW_MS
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: FRIENDLY_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimitResult.reset - Math.floor(Date.now() / 1000)),
        },
      }
    );
  }

  // 3. Validasi Keberadaan GEMINI_API_KEY di Sisi Server
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: FRIENDLY_ERROR_MESSAGES.MISSING_API_KEY },
      { status: 500 }
    );
  }

  // 4. Parsing dan Validasi Payload Request
  let body: ChatApiRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Payload tidak valid: format data harus JSON.' },
      { status: 400 }
    );
  }

  const message = body?.message;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json(
      { error: 'Pesan tidak boleh kosong.' },
      { status: 400 }
    );
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      {
        error: `Pesan terlalu panjang (${trimmedMessage.length} karakter). Maksimal ${CHAT_CONFIG.MAX_MESSAGE_LENGTH} karakter.`,
      },
      { status: 400 }
    );
  }

  // 5. Susun Riwayat Percakapan (Dibatasi 10 pesan terakhir)
  const contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }> = [];

  if (Array.isArray(body.history)) {
    const recentHistory = body.history.slice(-CHAT_CONFIG.MAX_HISTORY_MESSAGES);
    for (const item of recentHistory) {
      if (
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        item.content.trim().length > 0
      ) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content.slice(0, 1000) }],
        });
      }
    }
  }

  // Sisipkan konteks materi jika ada (maks 100 karakter)
  let userText = trimmedMessage;
  if (body.context && typeof body.context === 'string' && body.context.trim().length > 0) {
    userText = `[Konteks Pembelajaran: ${body.context.trim().slice(0, 100)}]\n\n${userText}`;
  }

  contents.push({
    role: 'user',
    parts: [{ text: userText }],
  });

  // 6. Inisialisasi SDK Resmi Google Gen AI dan Panggil Model
  const ai = new GoogleGenAI({ apiKey });

  try {
    let replyText = '';

    try {
      const response = await ai.models.generateContent({
        model: CHAT_CONFIG.PRIMARY_MODEL,
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          temperature: 0.6,
          maxOutputTokens: 800,
        },
      });
      replyText = response.text?.trim() || '';
    } catch (primaryErr: unknown) {
      const errObj = primaryErr as { status?: number; code?: number; message?: string };
      const status = errObj?.status || errObj?.code;
      const msg = errObj?.message || '';

      // Bila primary model sedang kelebihan beban (503 / UNAVAILABLE), alihkan ke fallback model
      if (status === 503 || status === 404 || msg.includes('demand') || msg.includes('UNAVAILABLE')) {
        const fallbackResponse = await ai.models.generateContent({
          model: CHAT_CONFIG.FALLBACK_MODEL,
          contents,
          config: {
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            temperature: 0.6,
            maxOutputTokens: 800,
          },
        });
        replyText = fallbackResponse.text?.trim() || '';
      } else {
        throw primaryErr;
      }
    }

    // 7. Cek Jika Respons Kosong atau Terblokir Filter
    if (!replyText) {
      return NextResponse.json(
        { reply: FRIENDLY_ERROR_MESSAGES.SAFETY_BLOCKED },
        { status: 200 }
      );
    }

    return NextResponse.json({ reply: replyText }, { status: 200 });
  } catch (err: unknown) {
    const errObj = err as { status?: number; code?: number; message?: string };
    const status = errObj?.status || errObj?.code;
    const msg = errObj?.message || '';

    if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: FRIENDLY_ERROR_MESSAGES.QUOTA_EXCEEDED },
        { status: 429 }
      );
    }

    if (status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
      return NextResponse.json(
        { error: FRIENDLY_ERROR_MESSAGES.OVERLOADED_OR_NETWORK },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: FRIENDLY_ERROR_MESSAGES.GENERIC_ERROR },
      { status: 500 }
    );
  }
}
