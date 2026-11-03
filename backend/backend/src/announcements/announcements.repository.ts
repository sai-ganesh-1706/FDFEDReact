import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Announcement {
  id: number;
  collegeId: number;
  type: 'general' | 'urgent' | 'placement' | 'event';
  title: string;
  message: string;
  postedAt: string;
  author: string;
}

@Injectable()
export class AnnouncementsRepository {
  private announcements: Announcement[] = [];
  private nextId = 1;

  constructor() {
    this.announcements = JSON.parse(readFileSync(join(process.cwd(), 'data', 'announcements.demo.json'), 'utf8'));
    if (!Array.isArray(this.announcements)) throw new Error('Invalid demo announcements file');
    this.nextId = Math.max(0, ...this.announcements.map((item) => item.id)) + 1;
  }

  findByCollege(collegeId: number): Announcement[] {
    return this.announcements
      .filter(a => a.collegeId === collegeId)
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  create(data: Omit<Announcement, 'id' | 'postedAt'>): Announcement {
    const ann: Announcement = { id: this.nextId++, ...data, postedAt: new Date().toISOString() };
    this.announcements.push(ann);
    return ann;
  }

  delete(id: number, collegeId: number): boolean {
    const idx = this.announcements.findIndex(a => a.id === id && a.collegeId === collegeId);
    if (idx === -1) return false;
    this.announcements.splice(idx, 1);
    return true;
  }
}
