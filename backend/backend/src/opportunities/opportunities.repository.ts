import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Opportunity {
  id: number;
  jobId?: string;
  changedAfterApproval?: boolean;
  changedAfterApprovalAt?: string;
  changedAfterApprovalFields?: string[];
  title: string;
  company: string;
  location: string;
  deadline: string;
  applications: number;
  salary: string;
  openings: number;
  cgpa: number;
  branches: string[];
  type: string;
  status: string;
  tags?: string[];
  description?: string;
  rounds?: string;
  backlogs?: string;
  submittedBy?: string;
  recruiterId?: number;
  collegeId?: number;
  createdAt?: string;
  rejectionRemark?: string;
  duration?: string;
  isDemo?: boolean;
  reviewDemo?: boolean;
  avatar?: string;
  avatarBg?: string;
}

@Injectable()
export class OpportunitiesRepository {
  constructor() {
    // Seed opportunities all belong to the demo college.
    this.opportunities.forEach((o, index) => {
      o.isDemo = true;
      o.collegeId ??= 1;
      // Older seed entries predate the timestamp field. Give them a stable
      // chronological order so dashboard lists behave like newly-created data.
      if (!o.createdAt) {
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - (this.opportunities.length - index));
        o.createdAt = createdAt.toISOString();
      }
    });
    // JSON supplies initial demo records only. Every mutation after startup
    // stays in this repository's memory and resets when the backend restarts.
    const demoFile = join(process.cwd(), 'data', 'review-opportunities.demo.json');
    const demos: unknown = JSON.parse(readFileSync(demoFile, 'utf8'));
    if (!Array.isArray(demos) || demos.some((o) => !o || !Number.isInteger(o.id) || o.id < 21 || !o.reviewDemo)) {
      throw new Error('Invalid review demo opportunities file');
    }
    const ids = new Set(this.opportunities.map((o) => o.id));
    for (const demo of demos as Opportunity[]) {
      if (ids.has(demo.id)) throw new Error(`Duplicate demo opportunity ID: ${demo.id}`);
      ids.add(demo.id);
      this.opportunities.push(demo);
    }
    this.nextId = Math.max(this.nextId, ...this.opportunities.map((o) => o.id + 1));
  }

  private opportunities: Opportunity[] = [];

  private nextId = 21;

  findAll(): Opportunity[] {
    return this.opportunities.filter((o) => !o.isDemo);
  }

  findPublished(): Opportunity[] {
    return this.findAll().filter((o) => o.status === 'Published');
  }

  findById(id: number): Opportunity | undefined {
    return this.opportunities.find((o) => o.id === id);
  }

  create(data: Omit<Opportunity, 'id'>): Opportunity {
    const opp: Opportunity = { ...data, id: this.nextId, applications: data.applications ?? 0, createdAt: new Date().toISOString() };
    this.opportunities.push(opp);
    this.nextId++;
    return opp;
  }

  update(id: number, data: Partial<Opportunity>): Opportunity | undefined {
    const idx = this.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    const updated = { ...this.opportunities[idx], ...data };
    this.opportunities[idx] = updated;
    return this.opportunities[idx];
  }

  remove(id: number): boolean {
    const idx = this.opportunities.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.opportunities.splice(idx, 1);
    return true;
  }
}
