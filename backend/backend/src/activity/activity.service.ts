import { Injectable } from '@nestjs/common';

export type ActivityType =
  | 'college' | 'admin' | 'message' | 'system'
  | 'user' | 'opportunity' | 'application' | 'referral' | 'recruiter' | 'notification' | 'login';

export interface ActivityEntry {
  id: number;
  action: string;
  detail: string;
  actor: string;
  actorRole?: string;
  collegeId?: number | null;
  timestamp: string;
  type: ActivityType;
}

/**
 * Platform-wide activity log. Every module records what really happened here
 * (nothing is pre-seeded), and the super admin reads it back.
 */
@Injectable()
export class ActivityService {
  private entries: ActivityEntry[] = [];
  private nextId = 1;

  log(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): ActivityEntry {
    const e: ActivityEntry = { id: this.nextId++, ...entry, timestamp: new Date().toISOString() };
    this.entries.push(e);
    if (this.entries.length > 2000) this.entries.shift();
    return e;
  }

  findAll(): ActivityEntry[] {
    return [...this.entries].sort((a, b) => b.id - a.id);
  }
}
