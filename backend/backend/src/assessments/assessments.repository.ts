import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface Assessment {
  id: number;
  title: string;
  role: string;
  date: string;
  time: string;
  duration: string;
  candidates: number;
  platform: string;
  link: string;
  type: string;
  isDraft: boolean;
  opportunityId?: number;
  recruiterId?: number;
  applicationId?: number;
  applicationIds?: number[];
  candidateIds?: number[];
  candidateName?: string;
  company?: string;
  createdAt?: string;
}

@Injectable()
export class AssessmentsRepository {
  private assessments: Assessment[] = [];

  private nextId = 1;

  constructor() {
    this.assessments = JSON.parse(readFileSync(join(process.cwd(), 'data', 'assessments.demo.json'), 'utf8'));
    if (!Array.isArray(this.assessments)) throw new Error('Invalid demo assessments file');
    this.nextId = Math.max(0, ...this.assessments.map((item) => item.id)) + 1;
  }

  findAll(): Assessment[] {
    return this.assessments;
  }

  findById(id: number): Assessment | undefined {
    return this.assessments.find((a) => a.id === id);
  }

  findByOpportunity(opportunityId: number): Assessment[] {
    return this.assessments.filter(
      (a) => a.opportunityId === opportunityId && !a.isDraft,
    );
  }

  create(data: Omit<Assessment, 'id'>): Assessment {
    const assessment: Assessment = { id: this.nextId++, ...data };
    this.assessments.push(assessment);
    return assessment;
  }

  update(id: number, data: Partial<Assessment>): Assessment | undefined {
    const idx = this.assessments.findIndex((a) => a.id === id);
    if (idx === -1) return undefined;
    this.assessments[idx] = { ...this.assessments[idx], ...data };
    return this.assessments[idx];
  }

  remove(id: number): boolean {
    const idx = this.assessments.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.assessments.splice(idx, 1);
    return true;
  }
}
