import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { UsersRepository } from '../users/users.repository';
import { OpportunitiesRepository } from '../opportunities/opportunities.repository';

export interface ApplicationTimeline { stage: string; date: string; desc: string; status: 'completed' | 'active' | 'pending'; }
export interface Application {
  id: number; opportunityId: number; candidateId: number; candidateName: string;
  branch?: string; cgpa?: number; title: string; company: string; type: string;
  status: string; appliedDate: string; hasReferral: boolean; currentStageIndex: number;
  timeline: ApplicationTimeline[]; interviewDate?: string; remarks?: string;
  resumeFile?: string; initials?: string; collegeId?: number; email?: string; phone?: string;
  evaluation?: Record<string, number>; recruiterFeedback?: string; feedbackSent?: boolean;
  rounds?: { resume?: string; assessment?: string; technical?: string; hr?: string; };
  referrerName?: string; referrerInitials?: string; referrerCompany?: string;
  referrerBatch?: string; referrerAvatarColor?: string; referrerDesignation?: string;
  referrerEmail?: string; referralStatus?: 'pending' | 'approved' | 'declined';
  referralNote?: string; recruiterRating?: number;
}

@Injectable()
export class ApplicationsRepository {
  private applications: Application[];
  private nextId: number;

  constructor(private readonly users: UsersRepository, private readonly opportunities: OpportunitiesRepository) {
    this.applications = JSON.parse(readFileSync(join(process.cwd(), 'data', 'applications.demo.json'), 'utf8'));
    const ids = new Set<number>();
    const pairs = new Set<string>();
    for (const app of this.applications) {
      const user = this.users.findById(app.candidateId);
      const opportunity = this.opportunities.findById(app.opportunityId);
      const pair = `${app.candidateId}:${app.opportunityId}`;
      if (!Number.isInteger(app.id) || ids.has(app.id) || pairs.has(pair) || user?.role !== 'candidate' || !opportunity || (user.collegeId ?? 1) !== app.collegeId || (opportunity.collegeId ?? 1) !== app.collegeId || !Array.isArray(app.timeline)) {
        throw new Error(`Invalid demo application: ${app.id}`);
      }
      ids.add(app.id); pairs.add(pair);
    }
    this.nextId = Math.max(0, ...this.applications.map((a) => a.id)) + 1;
    for (const user of this.users.findByRole('candidate')) this.syncPlacement(user.id);
  }

  private syncPlacement(candidateId: number) {
    const user = this.users.findById(candidateId);
    if (!user || ['inactive', 'suspended'].includes(user.status ?? '')) return;
    const placed = this.applications.some((a) => a.candidateId === candidateId && ['Offer', 'Offered'].includes(a.status) && /full/i.test(a.type));
    if (placed || user.status === 'placed') this.users.update(candidateId, { status: placed ? 'placed' : 'active' });
  }

  findAll(): Application[] {
    const ids = new Set(this.users.findByRole('candidate').map((u) => u.id));
    return this.applications.filter((a) => ids.has(a.candidateId));
  }
  findByCandidate(id: number): Application[] { return this.findAll().filter((a) => a.candidateId === id); }
  findByOpportunity(id: number): Application[] { return this.findAll().filter((a) => a.opportunityId === id); }
  findById(id: number): Application | undefined { return this.applications.find((a) => a.id === id); }
  existsByOpportunityAndCandidate(opportunityId: number, candidateId: number): boolean {
    return this.applications.some((a) => a.opportunityId === opportunityId && a.candidateId === candidateId);
  }
  findByCollege(id: number): Application[] { return this.findAll().filter((a) => a.collegeId === id); }
  create(data: Omit<Application, 'id'>): Application {
    const app = { ...data, id: this.nextId++ };
    this.applications.push(app); this.syncPlacement(app.candidateId);
    return app;
  }
  update(id: number, data: Partial<Application>): Application | undefined {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.applications[idx] = { ...this.applications[idx], ...data };
    this.syncPlacement(this.applications[idx].candidateId);
    return this.applications[idx];
  }
  remove(id: number): boolean {
    const idx = this.applications.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    const candidateId = this.applications[idx].candidateId;
    this.applications.splice(idx, 1); this.syncPlacement(candidateId);
    return true;
  }
}
