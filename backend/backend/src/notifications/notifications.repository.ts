import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Notification {
  id: number;
  candidateId: number;
  type?: string;          // 'assessment' | 'status' | 'offer' | 'general'
  title: string;
  message: string;
  href?: string;          // deep-link route for click navigation
  isRead: boolean;
  createdAt: string;
}

@Injectable()
export class NotificationsRepository {
  private notifications: Notification[] = [];

  private nextId = 1;

  constructor() {
    this.notifications = JSON.parse(readFileSync(join(process.cwd(), 'data', 'notifications.demo.json'), 'utf8'));
    if (!Array.isArray(this.notifications)) throw new Error('Invalid demo notifications file');
    this.nextId = Math.max(0, ...this.notifications.map((item) => item.id)) + 1;
  }

  findByCandidate(candidateId: number): Notification[] {
    return this.notifications
      .filter((n) => n.candidateId === candidateId)
      .sort((a, b) => b.id - a.id);   // newest first
  }

  findByType(candidateId: number, type: string): Notification[] {
    return this.notifications.filter(
      (n) => n.candidateId === candidateId && n.type === type,
    );
  }

  findById(id: number): Notification | undefined {
    return this.notifications.find((n) => n.id === id);
  }

  create(data: Omit<Notification, 'id'>): Notification {
    const notif: Notification = { id: this.nextId++, ...data };
    this.notifications.push(notif);
    return notif;
  }

  update(id: number, data: Partial<Notification>): Notification | undefined {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    this.notifications[idx] = { ...this.notifications[idx], ...data };
    return this.notifications[idx];
  }

  markAllRead(candidateId: number): void {
    this.notifications
      .filter((n) => n.candidateId === candidateId)
      .forEach((n) => (n.isRead = true));
  }

  remove(id: number): boolean {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.notifications.splice(idx, 1);
    return true;
  }
}
