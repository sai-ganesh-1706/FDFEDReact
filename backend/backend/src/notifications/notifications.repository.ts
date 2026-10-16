import { Injectable } from '@nestjs/common';

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
  private notifications: Notification[] = [
    {
      id: 1, candidateId: 100, type: 'offer',
      title: 'Offer extended — CloudBase Inc',
      message: 'Congratulations! CloudBase Inc has extended an offer for the DevOps Intern role. Please accept it before February 15th.',
      href: 'applications', isRead: false, createdAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 2, candidateId: 100, type: 'status',
      title: 'Application shortlisted — Analytics Hub',
      message: 'You have been shortlisted for Data Analyst Intern at Analytics Hub. Watch this space for the assessment link.',
      href: 'applications', isRead: false, createdAt: '2026-10-11T09:00:00Z',
    },
    {
      id: 3, candidateId: 100, type: 'general',
      title: 'New opportunity: Software Engineer',
      message: 'Google is hiring for Software Engineer (Full-Time, 32 LPA). Apply before 2026-07-31.',
      href: 'opportunities', isRead: false, createdAt: '2026-10-10T11:00:00Z',
    },
    {
      id: 4, candidateId: 100, type: 'general',
      title: 'Pre-placement talk — Google',
      message: 'Google India will run a pre-placement talk for final-year students next week in the Main Auditorium.',
      href: '#', isRead: true, createdAt: '2026-10-08T09:00:00Z',
    },
    {
      id: 5, candidateId: 101, type: 'referral',
      title: 'New referral request',
      message: 'Isha Gupta asked you for a referral for Software Engineer at Google.',
      href: '#', isRead: false, createdAt: '2026-10-13T09:00:00Z',
    },
  ];

  private nextId = 6;

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
