import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface AuthSession {
  userId: number;
  expiresAt: number;
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

/** Server-side opaque sessions used to authenticate bearer tokens. */
@Injectable()
export class AuthSessionService {
  private readonly sessions = new Map<string, AuthSession>();

  create(userId: number): string {
    const token = randomBytes(32).toString('base64url');
    this.sessions.set(token, { userId, expiresAt: Date.now() + SESSION_TTL_MS });
    return token;
  }

  getUserId(token: string): number | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt <= Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session.userId;
  }
}
