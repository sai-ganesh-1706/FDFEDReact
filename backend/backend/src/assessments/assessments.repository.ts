import { Injectable } from '@nestjs/common';

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
  candidateIds?: number[];
  candidateName?: string;
  company?: string;
  createdAt?: string;
}

@Injectable()
export class AssessmentsRepository {
  private assessments: Assessment[] = [
    {
      id: 1,
      title: 'Coding Assessment — Round 1',
      role: 'Software Engineer',
      date: '2026-10-22',
      time: '10:00 AM',
      duration: '90 minutes',
      candidates: 12,
      platform: 'HackerRank',
      link: 'https://hackerrank.com/test/x',
      type: 'Online Test',
      isDraft: false,
      opportunityId: 1,
    },
    {
      id: 2,
      title: 'Technical Interview — Round 2',
      role: 'Software Engineer',
      date: '2026-10-29',
      time: '2:00 PM',
      duration: '60 minutes',
      candidates: 5,
      platform: 'Google Meet',
      link: 'https://meet.google.com/x/y',
      type: 'Technical Interview',
      isDraft: false,
      opportunityId: 1,
    },
    {
      id: 3,
      title: 'HR Interview — Final Round',
      role: 'Software Engineer',
      date: '2026-11-03',
      time: '11:00 AM',
      duration: '45 minutes',
      candidates: 3,
      platform: 'Zoom',
      link: 'https://zoom.us/j/xy',
      type: 'HR Interview',
      isDraft: true,
      opportunityId: 1,
    },
    {
      id: 4,
      title: 'Data Analysis Test',
      role: 'Data Analyst Intern',
      date: '2026-10-25',
      time: '3:00 PM',
      duration: '120 minutes',
      candidates: 8,
      platform: 'Codility',
      link: 'https://codility.com/test/data',
      type: 'Online Test',
      isDraft: false,
      opportunityId: 2,
    },
  ];

  private nextId = 5;

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
