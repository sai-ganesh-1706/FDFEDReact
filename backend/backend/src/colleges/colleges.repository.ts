import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * CareerNest Revenue Model — College Subscription Only
 *
 * BASIC    — ₹15,000/month  → Essential placement management
 * STANDARD — ₹30,000/month  → Advanced analytics + automation
 * PREMIUM  — ₹50,000/month  → Enterprise intelligence + multi-officer
 *
 * Recruiters are FREE partners. No recruiter payment model.
 */

export type SubscriptionTier = 'basic' | 'standard' | 'premium';

export const SUBSCRIPTION_PRICING: Record<SubscriptionTier, number> = {
  basic:    15000,
  standard: 30000,
  premium:  50000,
};

/**
 * Feature availability per tier.
 * Used by the backend subscription endpoint and frontend lock-UI.
 */
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, {
  allowed: string[];
  locked: Array<{ feature: string; availableIn: SubscriptionTier }>;
}> = {
  basic: {
    allowed: [
      'student_management',
      'recruiter_management',
      'placement_drives',
      'applications',
      'eligibility_management',
      'placement_tracking',
      'basic_reports',
      'basic_statistics',
    ],
    locked: [
      { feature: 'advanced_analytics',       availableIn: 'standard' },
      { feature: 'department_analytics',      availableIn: 'standard' },
      { feature: 'bulk_notifications',        availableIn: 'standard' },
      { feature: 'interview_scheduling',      availableIn: 'standard' },
      { feature: 'advanced_shortlisting',     availableIn: 'standard' },
      { feature: 'detailed_reports',          availableIn: 'standard' },
      { feature: 'alumni_engagement',         availableIn: 'standard' },
      { feature: 'advanced_filtering',        availableIn: 'standard' },
      { feature: 'ai_candidate_matching',     availableIn: 'premium' },
      { feature: 'custom_reports',            availableIn: 'premium' },
      { feature: 'multiple_officers',         availableIn: 'premium' },
      { feature: 'real_time_analytics',       availableIn: 'premium' },
    ],
  },
  standard: {
    allowed: [
      'student_management',
      'recruiter_management',
      'placement_drives',
      'applications',
      'eligibility_management',
      'placement_tracking',
      'basic_reports',
      'basic_statistics',
      'advanced_analytics',
      'department_analytics',
      'bulk_notifications',
      'interview_scheduling',
      'advanced_shortlisting',
      'detailed_reports',
      'alumni_engagement',
      'advanced_filtering',
    ],
    locked: [
      { feature: 'ai_candidate_matching',     availableIn: 'premium' },
      { feature: 'custom_reports',            availableIn: 'premium' },
      { feature: 'multiple_officers',         availableIn: 'premium' },
      { feature: 'real_time_analytics',       availableIn: 'premium' },
    ],
  },
  premium: {
    allowed: [
      'student_management',
      'recruiter_management',
      'placement_drives',
      'applications',
      'eligibility_management',
      'placement_tracking',
      'basic_reports',
      'basic_statistics',
      'advanced_analytics',
      'department_analytics',
      'bulk_notifications',
      'interview_scheduling',
      'advanced_shortlisting',
      'detailed_reports',
      'alumni_engagement',
      'advanced_filtering',
      'custom_reports',
      'multiple_officers',
      'real_time_analytics',
      // AI matching & multi-campus are UI-only locks (not genuinely implementable)
    ],
    locked: [
      { feature: 'ai_candidate_matching',     availableIn: 'premium' }, // UI only – shows as "powered by AI" badge
      { feature: 'multicampus_management',    availableIn: 'premium' }, // Architecture not supported yet
    ],
  },
};

export interface College {
  id: number;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  website?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscriptionTier: SubscriptionTier;
  subscriptionFee: number;    // monthly fee in ₹
  studentLimit: number;       // max students on plan
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class CollegesRepository {
  /** Shared repository instance for request guards registered across feature modules. */
  static current: CollegesRepository | null = null;
  private colleges: College[] = [];

  private nextId = 1;

  constructor() {
    CollegesRepository.current = this;
    this.colleges = JSON.parse(readFileSync(join(process.cwd(), 'data', 'colleges.demo.json'), 'utf8'));
    if (!Array.isArray(this.colleges)) throw new Error('Invalid demo colleges file');
    this.nextId = Math.max(0, ...this.colleges.map((item) => item.id)) + 1;
  }

  findAll(): College[] {
    return this.colleges;
  }

  findById(id: number): College | undefined {
    return this.colleges.find(c => c.id === id);
  }

  findByCode(code: string): College | undefined {
    return this.colleges.find(c => c.code === code);
  }

  create(data: Omit<College, 'id'>): College {
    const college: College = { id: this.nextId++, ...data };
    this.colleges.push(college);
    return college;
  }

  update(id: number, data: Partial<College>): College | undefined {
    const idx = this.colleges.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.colleges[idx] = {
      ...this.colleges[idx],
      ...data,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    return this.colleges[idx];
  }

  remove(id: number): boolean {
    const idx = this.colleges.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.colleges.splice(idx, 1);
    return true;
  }
}
