import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Referral {
  id: number;
  opportunityId: number;
  candidateId: number;
  candidateName: string;
  candidateInitials: string;
  alumniId: number;
  alumniName: string;
  alumniInitials: string;
  alumniAvatarColor: string;
  alumniCompany: string;
  alumniBatch: string;
  status: string;
  appliedRole: string;
  appliedCompany: string;
  requestedDate: string;
  userMessage: string;
  alumniResponse: string | null;
  department?: string;
  cgpa?: number;
  skills?: string[];
  applicationId?: number;
  decidedAt?: string;
}

@Injectable()
export class ReferralsRepository {
  private referrals: Referral[] = [];
  private nextId = 6;

  constructor() {
    this.referrals = JSON.parse(readFileSync(join(process.cwd(), 'data', 'referrals.demo.json'), 'utf8'));
    if (!Array.isArray(this.referrals)) throw new Error('Invalid demo referrals file');
    this.nextId = Math.max(0, ...this.referrals.map((item) => item.id)) + 1;
  }

  findAll(): Referral[] {
    return this.referrals;
  }

  findByCandidate(candidateId: number): Referral[] {
    return this.referrals.filter((r) => r.candidateId === candidateId);
  }

  findByAlumni(alumniId: number): Referral[] {
    return this.referrals.filter((r) => r.alumniId === alumniId);
  }

  findById(id: number): Referral | undefined {
    return this.referrals.find((r) => r.id === id);
  }

  create(data: Omit<Referral, 'id'>): Referral {
    const ref: Referral = { id: this.nextId++, ...data };
    this.referrals.push(ref);
    return ref;
  }

  update(id: number, data: Partial<Referral>): Referral | undefined {
    const idx = this.referrals.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.referrals[idx] = { ...this.referrals[idx], ...data };
    return this.referrals[idx];
  }

  remove(id: number): boolean {
    const idx = this.referrals.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.referrals.splice(idx, 1);
    return true;
  }
}
