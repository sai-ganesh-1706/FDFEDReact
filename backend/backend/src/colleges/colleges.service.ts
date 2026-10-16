import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CollegesRepository, College, SubscriptionTier, SUBSCRIPTION_FEATURES, SUBSCRIPTION_PRICING } from './colleges.repository';
import { CreateCollegeDto } from './dto/create-college.dto';
import { UpdateCollegeDto } from './dto/update-college.dto';

const TIER_LABEL: Record<SubscriptionTier, string> = {
  basic:    'BASIC',
  standard: 'STANDARD',
  premium:  'PREMIUM',
};

const TIER_DESCRIPTION: Record<SubscriptionTier, string> = {
  basic:    'Essential placement management',
  standard: 'Advanced analytics + automation',
  premium:  'Enterprise intelligence + multi-officer',
};

const FEATURE_LABEL: Record<string, string> = {
  student_management:     'Student Management',
  recruiter_management:   'Recruiter Management',
  placement_drives:       'Placement Drives',
  applications:           'Applications',
  eligibility_management: 'Eligibility Management',
  placement_tracking:     'Placement Tracking',
  basic_reports:          'Basic Reports',
  basic_statistics:       'Basic Statistics',
  advanced_analytics:     'Advanced Placement Analytics',
  department_analytics:   'Department-wise Analytics',
  bulk_notifications:     'Bulk Notifications',
  interview_scheduling:   'Interview Scheduling',
  advanced_shortlisting:  'Advanced Shortlisting',
  detailed_reports:       'Detailed Reports',
  alumni_engagement:      'Alumni Engagement',
  advanced_filtering:     'Advanced Candidate Filtering',
  ai_candidate_matching:  'AI Candidate Matching',
  custom_reports:         'Custom Reports',
  multiple_officers:      'Multiple Placement Officers',
  real_time_analytics:    'Real-time Advanced Analytics',
  multicampus_management: 'Multi-campus Management',
};

@Injectable()
export class CollegesService {
  constructor(private readonly repo: CollegesRepository) {}

  findAll(): College[] {
    return this.repo.findAll();
  }

  findOne(id: number): College {
    const college = this.repo.findById(id);
    if (!college) throw new NotFoundException(`College with id ${id} not found`);
    return college;
  }

  /**
   * Returns full subscription info for a college — used by all actor dashboards.
   * Resolves: tier, monthly price, description, allowed features (with labels),
   * locked features (with labels and required tier), plus upgrade path.
   */
  getSubscription(collegeId: number) {
    const college = this.repo.findById(collegeId);
    if (!college) throw new NotFoundException(`College with id ${collegeId} not found`);

    const tier        = college.subscriptionTier;
    const features    = SUBSCRIPTION_FEATURES[tier];
    const allTiers: SubscriptionTier[] = ['basic', 'standard', 'premium'];

    return {
      collegeId:      college.id,
      collegeName:    college.name,
      tier,
      tierLabel:      TIER_LABEL[tier],
      description:    TIER_DESCRIPTION[tier],
      monthlyFee:     college.subscriptionFee,
      status:         college.status,
      // Features the college CAN use
      allowed: features.allowed.map(f => ({
        key:   f,
        label: FEATURE_LABEL[f] ?? f,
      })),
      // Features that are locked and what tier unlocks them
      locked: features.locked.map(l => ({
        key:            l.feature,
        label:          FEATURE_LABEL[l.feature] ?? l.feature,
        availableIn:    l.availableIn,
        availableLabel: TIER_LABEL[l.availableIn],
      })),
      // Can this college upgrade?
      canUpgrade:   tier !== 'premium',
      upgradeTo:    tier === 'basic' ? 'standard' : tier === 'standard' ? 'premium' : null,
      upgradeLabel: tier === 'basic' ? 'STANDARD' : tier === 'standard' ? 'PREMIUM' : null,
      upgradePrice: tier === 'basic' ? 30000 : tier === 'standard' ? 50000 : null,
      // All plan pricing for comparison widget
      plans: allTiers.map(t => ({
        tier:        t,
        label:       TIER_LABEL[t],
        description: TIER_DESCRIPTION[t],
        price:       SUBSCRIPTION_PRICING[t],
        isCurrent:   t === tier,
      })),
    };
  }

  create(dto: CreateCollegeDto): College {
    const existing = this.repo.findByCode(dto.code);
    if (existing) throw new ConflictException(`College with code '${dto.code}' already exists`);
    const all = this.repo.findAll();
    if (all.some((c) => c.name.trim().toLowerCase() === dto.name.trim().toLowerCase())) {
      throw new ConflictException(`A college named '${dto.name}' already exists`);
    }
    if (all.some((c) => c.email.toLowerCase() === dto.email.toLowerCase())) {
      throw new ConflictException(`A college with email '${dto.email}' already exists`);
    }
    const now = new Date().toISOString().split('T')[0];
    return this.repo.create({
      ...dto,
      status:           dto.status ?? 'active',
      subscriptionTier: (dto as any).subscriptionTier ?? 'basic',
      subscriptionFee:  (dto as any).subscriptionFee  ?? 15000,
      studentLimit:     (dto as any).studentLimit      ?? 200,
      createdAt: now,
      updatedAt: now,
    });
  }

  update(id: number, dto: UpdateCollegeDto): College {
    const updated = this.repo.update(id, dto as Partial<College>);
    if (!updated) throw new NotFoundException(`College with id ${id} not found`);
    return updated;
  }

  updateStatus(id: number, status: 'active' | 'inactive' | 'suspended'): College {
    const updated = this.repo.update(id, { status });
    if (!updated) throw new NotFoundException(`College with id ${id} not found`);
    return updated;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`College with id ${id} not found`);
    return { message: `College ${id} deleted` };
  }
}
