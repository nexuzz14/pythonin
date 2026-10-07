interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

/**
 * Simple in-memory rate limiter per IP address.
 * Catatan untuk lingkungan serverless (Vercel):
 * In-memory map ini disimpan per instance/container container serverless.
 * Jika fungsi berpindah instance baru, limit di-reset. Namun cukup untuk
 * meredam spam cepat (rapid-fire) dalam 1 koneksi.
 */
export function checkRateLimit(
  ip: string,
  limit = 200,
  windowMs = 10 * 60 * 1000
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
} {
  const now = Date.now();

  // Bersihkan data usang setiap 5 menit agar memori tetap hemat
  if (now - lastCleanup > 5 * 60 * 1000) {
    for (const [key, record] of ipMap.entries()) {
      if (record.resetAt <= now) {
        ipMap.delete(key);
      }
    }
    lastCleanup = now;
  }

  const record = ipMap.get(ip);

  if (!record || record.resetAt <= now) {
    ipMap.set(ip, { count: 1, resetAt: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(record.resetAt / 1000),
    };
  }

  record.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - record.count,
    reset: Math.ceil(record.resetAt / 1000),
  };
}

/**
 * Ekstrak IP klien dari Next.js / Vercel request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Ambil IP pertama jika melalui rantai proxy
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

/**
 * Utility untuk testing: reset store
 */
export function _resetRateLimiter(): void {
  ipMap.clear();
}
