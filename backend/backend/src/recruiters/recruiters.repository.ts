import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Recruiter {
  id: number;
  name: string;
  company: string;
  role: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  status: string;
  opps: number;
  joined: string;
  avatar?: string;
  collegeId?: number;
  message?: string;
  source?: 'contact-form' | 'manual';
  userId?: number;
  declineRemark?: string;
  submittedAt?: string;
  decidedAt?: string;
  isDemo?: boolean;
}

@Injectable()
export class RecruitersRepository {
  private recruiters: Recruiter[];
  private nextId: number;

  constructor() {
    this.recruiters = JSON.parse(readFileSync(join(process.cwd(), 'data', 'recruiters.demo.json'), 'utf8'));
    if (!Array.isArray(this.recruiters) || this.recruiters.some((r) => !Number.isInteger(r.id) || !r.email || !r.isDemo)) {
      throw new Error('Invalid recruiter demo data');
    }
    this.nextId = Math.max(0, ...this.recruiters.map((r) => r.id)) + 1;
  }

  findAll(): Recruiter[] { return this.recruiters; }
  findById(id: number): Recruiter | undefined { return this.recruiters.find((r) => r.id === id); }
  findByStatus(status: string): Recruiter[] { return this.recruiters.filter((r) => r.status === status); }

  create(data: Omit<Recruiter, 'id'>): Recruiter {
    const recruiter = { ...data, id: this.nextId++ };
    this.recruiters.push(recruiter);
    return recruiter;
  }

  update(id: number, data: Partial<Recruiter>): Recruiter | undefined {
    const idx = this.recruiters.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.recruiters[idx] = { ...this.recruiters[idx], ...data };
    return this.recruiters[idx];
  }

  remove(id: number): boolean {
    const idx = this.recruiters.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.recruiters.splice(idx, 1);
    return true;
  }

  getStats(): Record<string, number> {
    return { total: this.recruiters.length, active: this.findByStatus('active').length, pending: this.findByStatus('pending').length, declined: this.findByStatus('declined').length };
  }
}
