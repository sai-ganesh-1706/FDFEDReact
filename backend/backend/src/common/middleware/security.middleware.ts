import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * SecurityMiddleware — router-level middleware that adds HTTP security headers
 * to every response and enforces a basic per-IP rate limit.
 *
 * Security headers set:
 *   X-Frame-Options            — prevents clickjacking
 *   X-Content-Type-Options     — prevents MIME sniffing
 *   X-XSS-Protection           — legacy XSS filter hint
 *   Referrer-Policy            — controls referrer information
 *   Content-Security-Policy    — restricts resource origins
 *   Strict-Transport-Security  — enforces HTTPS (HSTS)
 *   Permissions-Policy         — restricts browser features
 *
 * Rate limiting:
 *   Max 100 requests per IP per minute. Exceeding returns 429.
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  // Simple in-memory rate-limit store: ip → { count, windowStart }
  private readonly rateLimitStore = new Map<string, { count: number; windowStart: number }>();
  private readonly MAX_REQUESTS_PER_WINDOW = 100;
  private readonly WINDOW_MS = 60 * 1000; // 1 minute

  use(req: Request, res: Response, next: NextFunction): void {
    // ── Security Headers ────────────────────────────────────────────────────
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
    );
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // ── Rate Limiting ────────────────────────────────────────────────────────
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    const now = Date.now();
    const entry = this.rateLimitStore.get(ip);

    if (!entry || now - entry.windowStart > this.WINDOW_MS) {
      // New window
      this.rateLimitStore.set(ip, { count: 1, windowStart: now });
    } else {
      entry.count += 1;
      if (entry.count > this.MAX_REQUESTS_PER_WINDOW) {
        res.setHeader('Retry-After', '60');
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests. Please try again after 60 seconds.',
          error: 'Too Many Requests',
        });
        return;
      }
    }

    next();
  }
}
