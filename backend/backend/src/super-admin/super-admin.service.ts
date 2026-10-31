import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UsersRepository, User } from '../users/users.repository';
import { CollegesRepository, College } from '../colleges/colleges.repository';
import { ApplicationsRepository } from '../applications/applications.repository';

export interface CollegeWithAdmin extends College {
  admin?: Omit<User, 'password'>;
  stats?: {
    students: number;
    placementOfficers: number;
    alumni: number;
    recruiters: number;
    placed: number;
  };
}

/** Strip password from a user object */
function safeUser(user: User): Omit<User, 'password'> {
  const { password: _, ...rest } = user as any;
  return rest;
}

/** The college's current admin: the active one, otherwise the most recently added. */
function pickAdmin(users: User[], collegeId: number): User | undefined {
  const admins = users.filter(u => u.role === 'college_admin' && u.collegeId === collegeId);
  return admins.find(u => u.status !== 'inactive') ?? admins[admins.length - 1];
}

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly collegesRepo: CollegesRepository,
    private readonly applicationsRepo: ApplicationsRepository,
  ) {}

  /** Platform-wide aggregate stats */
  getPlatformStats() {
    const colleges = this.collegesRepo.findAll();
    const users = this.usersRepo.findAll();
    const apps = this.applicationsRepo.findAll();

    return {
      totalColleges: colleges.length,
      activeColleges: colleges.filter(c => c.status === 'active').length,
      inactiveColleges: colleges.filter(c => c.status === 'inactive').length,
      suspendedColleges: colleges.filter(c => c.status === 'suspended').length,
      totalStudents: users.filter(u => u.role === 'candidate').length,
      totalAlumni: users.filter(u => u.role === 'alumni').length,
      totalPlacementOfficers: users.filter(u => u.role === 'placement_officer').length,
      totalCollegeAdmins: users.filter(u => u.role === 'college_admin').length,
      totalPlaced: new Set(apps.filter(a => ['Offer', 'Offered'].includes(a.status) && /full/i.test(a.type)).map(a => a.candidateId)).size,
    };
  }

  /**
   * Revenue model — college subscriptions ONLY.
   *
   * Revenue streams:
   *   ONLY: Monthly subscription fees per college (basic/standard/premium)
   *
   * NO recruiter drive fees. Recruiters are free partners.
   *
   * Formulas:
   *   Basic MRR    = count(active basic colleges) × 15,000
   *   Standard MRR = count(active standard colleges) × 30,000
   *   Premium MRR  = count(active premium colleges) × 50,000
   *   Total MRR    = Basic MRR + Standard MRR + Premium MRR
   *   ARR          = Total MRR × 12
   *   Avg/College  = Total MRR / count(active colleges)
   */
  getRevenueStats() {
    const colleges = this.collegesRepo.findAll();
    const active   = colleges.filter(c => c.status === 'active');

    const byTier = {
      premium:  active.filter(c => c.subscriptionTier === 'premium'),
      standard: active.filter(c => c.subscriptionTier === 'standard'),
      basic:    active.filter(c => c.subscriptionTier === 'basic'),
    };

    const premiumMRR  = byTier.premium.length  * 50000;
    const standardMRR = byTier.standard.length * 30000;
    const basicMRR    = byTier.basic.length    * 15000;
    const totalMRR    = premiumMRR + standardMRR + basicMRR;
    const totalARR    = totalMRR * 12;
    const avgRevenue  = active.length > 0 ? Math.round(totalMRR / active.length) : 0;

    // Top colleges by annual subscription revenue
    const topColleges = [...active]
      .map(c => ({
        id:              c.id,
        name:            c.name,
        tier:            c.subscriptionTier,
        monthlyRevenue:  c.subscriptionFee,
        annualRevenue:   c.subscriptionFee * 12,
      }))
      .sort((a, b) => b.annualRevenue - a.annualRevenue)
      .slice(0, 5);

    return {
      // MRR breakdown
      totalMRR,
      totalARR,
      avgRevenuePerCollege: avgRevenue,
      totalPayingColleges: active.length,
      // Tier breakdown
      tiers: {
        premium:  { count: byTier.premium.length,  mrr: premiumMRR,  pricePerMonth: 50000, pct: totalMRR > 0 ? Math.round((premiumMRR  / totalMRR) * 100) : 0 },
        standard: { count: byTier.standard.length, mrr: standardMRR, pricePerMonth: 30000, pct: totalMRR > 0 ? Math.round((standardMRR / totalMRR) * 100) : 0 },
        basic:    { count: byTier.basic.length,    mrr: basicMRR,    pricePerMonth: 15000, pct: totalMRR > 0 ? Math.round((basicMRR    / totalMRR) * 100) : 0 },
      },
      // Top earning colleges
      topColleges,
    };
  }

  /** Change a college's subscription tier (super_admin only) */
  changeSubscriptionTier(collegeId: number, tier: 'basic' | 'standard' | 'premium') {
    const priceMap: Record<string, number> = { basic: 15000, standard: 30000, premium: 50000 };
    const updated = this.collegesRepo.update(collegeId, {
      subscriptionTier: tier,
      subscriptionFee:  priceMap[tier],
    });
    if (!updated) throw new NotFoundException(`College ${collegeId} not found`);
    return updated;
  }

  /** All colleges with their college admin and stats */
  getAllCollegesWithAdmins(): CollegeWithAdmin[] {
    const colleges = this.collegesRepo.findAll();
    const users = this.usersRepo.findAll();
    const apps = this.applicationsRepo.findAll();

    return colleges.map(college => {
      const admin = pickAdmin(users, college.id);
      return {
        ...college,
        admin: admin ? safeUser(admin) : undefined,
        stats: {
          students: users.filter(u => u.role === 'candidate' && u.collegeId === college.id).length,
          placementOfficers: users.filter(u => u.role === 'placement_officer' && u.collegeId === college.id).length,
          alumni: users.filter(u => u.role === 'alumni' && u.collegeId === college.id).length,
          recruiters: users.filter(u => u.role === 'recruiter' && u.collegeId === college.id).length,
          placed: new Set(apps.filter(a => a.collegeId === college.id && ['Offer', 'Offered'].includes(a.status) && /full/i.test(a.type)).map(a => a.candidateId)).size,
        },
      };
    });
  }

  /** Single college with admin + stats */
  getCollegeWithAdmin(collegeId: number): CollegeWithAdmin {
    const college = this.collegesRepo.findById(collegeId);
    if (!college) throw new NotFoundException(`College ${collegeId} not found`);

    const users = this.usersRepo.findAll();
    const apps = this.applicationsRepo.findAll();
    const admin = pickAdmin(users, collegeId);

    return {
      ...college,
      admin: admin ? safeUser(admin) : undefined,
      stats: {
        students: users.filter(u => u.role === 'candidate' && u.collegeId === collegeId).length,
        placementOfficers: users.filter(u => u.role === 'placement_officer' && u.collegeId === collegeId).length,
        alumni: users.filter(u => u.role === 'alumni' && u.collegeId === collegeId).length,
        recruiters: users.filter(u => u.role === 'recruiter' && u.collegeId === collegeId).length,
        placed: new Set(apps.filter(a => a.collegeId === collegeId && ['Offer', 'Offered'].includes(a.status) && /full/i.test(a.type)).map(a => a.candidateId)).size,
      },
    };
  }

  /** Get the active college admin for a college */
  getCollegeAdmin(collegeId: number): Omit<User, 'password'> | null {
    const college = this.collegesRepo.findById(collegeId);
    if (!college) throw new NotFoundException(`College ${collegeId} not found`);
    const admin = pickAdmin(this.usersRepo.findAll(), collegeId);
    return admin ? safeUser(admin) : null;
  }

  /** Create or assign a new college admin for a college */
  createCollegeAdmin(collegeId: number, data: { name: string; email: string; password?: string }): Omit<User, 'password'> {
    const college = this.collegesRepo.findById(collegeId);
    if (!college) throw new NotFoundException(`College ${collegeId} not found`);

    // Prevent duplicate email
    const existingByEmail = this.usersRepo.findByEmail(data.email);
    if (existingByEmail && existingByEmail.role !== 'college_admin') {
      throw new ConflictException(`User with email '${data.email}' already exists with role '${existingByEmail.role}'`);
    }
    if (existingByEmail && existingByEmail.collegeId === collegeId) {
      throw new ConflictException(`A college admin for college ${collegeId} with this email already exists`);
    }

    // Deactivate previous admin for this college (if any)
    const oldAdmin = this.usersRepo.findAll().find(u => u.role === 'college_admin' && u.collegeId === collegeId && u.status === 'active');
    if (oldAdmin) {
      this.usersRepo.update(oldAdmin.id, { status: 'inactive' });
    }

    const user = this.usersRepo.create({
      name: data.name,
      email: data.email,
      role: 'college_admin',
      collegeId,
      status: 'active',
      password: data.password ?? '123',
      avatar: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    });

    return safeUser(user);
  }

  /** Update college admin profile */
  updateCollegeAdmin(collegeId: number, data: Partial<{ name: string; email: string; status: string }>): Omit<User, 'password'> {
    const admin = pickAdmin(this.usersRepo.findAll(), collegeId);
    if (!admin) throw new NotFoundException(`No college admin found for college ${collegeId}`);
    const updated = this.usersRepo.update(admin.id, data);
    return safeUser(updated!);
  }

  /** Toggle college admin active/inactive status */
  toggleCollegeAdminStatus(collegeId: number, status: 'active' | 'inactive'): Omit<User, 'password'> {
    return this.updateCollegeAdmin(collegeId, { status });
  }

  /** Get all users of a specific college (for super admin oversight) */
  getCollegeUsers(collegeId: number): Omit<User, 'password'>[] {
    const college = this.collegesRepo.findById(collegeId);
    if (!college) throw new NotFoundException(`College ${collegeId} not found`);
    return this.usersRepo.findByCollegeId(collegeId).map(safeUser);
  }
}
