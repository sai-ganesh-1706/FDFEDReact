import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * SecurityMiddleware — router-level middleware that adds HTTP security headers
 * to every response.
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
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
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

    next();
  }
}
