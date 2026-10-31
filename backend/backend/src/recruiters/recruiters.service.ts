import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { RecruitersRepository, Recruiter } from './recruiters.repository';
import { CreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateRecruiterDto } from './dto/update-recruiter.dto';
import { UsersRepository } from '../users/users.repository';
import { CollegesRepository } from '../colleges/colleges.repository';
import { ActivityService } from '../activity/activity.service';
import { OpportunitiesRepository } from '../opportunities/opportunities.repository';

export interface Credentials { email: string; password: string; }

/** Readable one-time password, e.g. Cn@4821kd */
function generatePassword(): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz';
  return `Cn@${randomInt(1000, 9999)}${letters[randomInt(letters.length)]}${letters[randomInt(letters.length)]}`;
}

@Injectable()
export class RecruitersService {
  constructor(
    private readonly repo: RecruitersRepository,
    private readonly usersRepo: UsersRepository,
    private readonly colleges: CollegesRepository,
    private readonly activity: ActivityService,
    private readonly opportunities: OpportunitiesRepository,
  ) {}

  private enrich(recruiter: Recruiter): Recruiter {
    const userId = recruiter.userId ?? this.usersRepo.findByEmail(recruiter.email)?.id;
    const opps = this.opportunities.findAll().filter((o) =>
      o.status === 'Published' && o.recruiterId === userId && userId != null &&
      (o.collegeId ?? 1) === (recruiter.collegeId ?? 1),
    ).length;
    return { ...recruiter, userId, opps };
  }

  findAll(collegeId?: number | null): Recruiter[] {
    const all = this.repo.findAll();
    return (collegeId ? all.filter((r) => (r.collegeId ?? 1) === collegeId) : all)
      .map((r) => this.enrich(r))
      .sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending') ||
        (Date.parse(b.submittedAt || '') || 0) - (Date.parse(a.submittedAt || '') || 0) || b.id - a.id);
  }

  findOne(id: number): Recruiter {
    const r = this.repo.findById(id);
    if (!r) throw new NotFoundException(`Recruiter with id ${id} not found`);
    return this.enrich(r);
  }

  findByStatus(status: string, collegeId?: number | null): Recruiter[] {
    return this.findAll(collegeId).filter((r) => r.status === status);
  }

  getStats(collegeId?: number | null): Record<string, number> {
    const all = this.findAll(collegeId);
    return {
      total: all.length,
      active: all.filter((r) => r.status === 'active').length,
      pending: all.filter((r) => r.status === 'pending').length,
      declined: all.filter((r) => r.status === 'declined').length,
    };
  }

  /** Public contact-us form: lands in the placement officer's pending list. */
  create(dto: CreateRecruiterDto, source: 'contact-form' | 'manual' = 'manual'): Recruiter {
    const email = dto.email.trim().toLowerCase();
    if (this.usersRepo.findByEmail(email)) {
      throw new ConflictException('An account with this email already exists. Please sign in instead.');
    }
    if (this.repo.findAll().some((r) => r.email.toLowerCase() === email && r.status === 'pending')) {
      throw new ConflictException('A request from this email is already waiting for the placement cell.');
    }
    const collegeId = dto.collegeId ?? 1;
    if (!this.colleges.findById(collegeId)) throw new NotFoundException('Selected college was not found');
    const now = new Date();
    const created = this.repo.create({
      ...dto,
      email,
      collegeId,
      status: 'pending',
      source,
      opps: 0,
      joined: now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      submittedAt: now.toISOString(),
      avatar: dto.name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
    });
    this.activity.log({
      action: 'Recruiter Enquiry', detail: `${created.name} (${created.company}) asked ${this.colleges.findById(collegeId)?.name} to onboard them`,
      actor: created.name, actorRole: 'recruiter', collegeId, type: 'recruiter',
    });
    return created;
  }

  update(id: number, dto: UpdateRecruiterDto): Recruiter {
    const updated = this.repo.update(id, dto as Partial<Recruiter>);
    if (!updated) throw new NotFoundException(`Recruiter with id ${id} not found`);
    return updated;
  }

  /** Verify the recruiter and create their login. The generated password is shown once to the officer. */
  approve(id: number, actorName = 'Placement officer'): { recruiter: Recruiter; credentials: Credentials } {
    const r = this.findOne(id);
    if (r.status !== 'pending') throw new ConflictException('Only pending requests can be approved');
    const existing = this.usersRepo.findByEmail(r.email);
    if (existing && existing.role !== 'recruiter') {
      throw new ConflictException(`This email already belongs to a ${existing.role.replace('_', ' ')} account`);
    }
    const password = r.isDemo ? '12345678' : generatePassword();
    let user = existing;
    if (user) user = this.usersRepo.update(user.id, { password, status: 'active', company: r.company })!;
    else {
      user = this.usersRepo.create({
        name: r.name, email: r.email, role: 'recruiter', collegeId: r.collegeId ?? 1, password,
        company: r.company, headline: r.role, phone: r.phone, location: r.location, about: r.bio,
        status: 'active', avatar: r.avatar,
      });
    }
    const recruiter = this.repo.update(id, { status: 'active', userId: user.id, decidedAt: new Date().toISOString() })!;
    this.activity.log({
      action: 'Recruiter Verified', detail: `${r.name} (${r.company}) was verified and given portal access`,
      actor: actorName, actorRole: 'placement_officer', collegeId: r.collegeId ?? null, type: 'recruiter',
    });
    return { recruiter, credentials: { email: r.email, password } };
  }

  decline(id: number, remark?: string, actorName = 'Placement officer'): Recruiter {
    const r = this.findOne(id);
    const updated = this.repo.update(id, { status: 'declined', declineRemark: remark, decidedAt: new Date().toISOString() })!;
    this.activity.log({
      action: 'Recruiter Declined', detail: `${r.name} (${r.company}) was declined`,
      actor: actorName, actorRole: 'placement_officer', collegeId: r.collegeId ?? null, type: 'recruiter',
    });
    return updated;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Recruiter with id ${id} not found`);
    return { message: `Recruiter ${id} removed successfully` };
  }
}
