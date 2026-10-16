import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ReferralsRepository, Referral } from './referrals.repository';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { ActivityService } from '../activity/activity.service';

// Keep referral eligibility stable when a profile uses a harmless company
// suffix such as "Solutions" or "Technologies" while the opportunity uses
// the base company name. The frontend uses the same normalization for its
// alumni directory filter; the API remains the authority for enforcement.
const COMPANY_SUFFIXES = new Set([
  'and', 'co', 'company', 'corp', 'corporation', 'inc', 'incorporated',
  'limited', 'llc', 'llp', 'private', 'pvt', 'service', 'services',
  'solution', 'solutions', 'technologies', 'technology', 'ltd',
]);

const referralCompanyKey = (company?: string): string => String(company ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .split(/\s+/)
  .filter((word) => word && !COMPANY_SUFFIXES.has(word))
  .join(' ');

@Injectable()
export class ReferralsService {
  constructor(
    private readonly repo: ReferralsRepository,
    private readonly oppsService: OpportunitiesService,
    private readonly notifications: NotificationsService,
    private readonly usersRepo: UsersRepository,
    private readonly activity: ActivityService,
  ) {}

  /** Drop a message in a user's in-app inbox. Never lets a notification problem fail the referral action. */
  private notify(recipientId: number, title: string, message: string): void {
    try {
      this.notifications.create({ type: 'referral', title, message, href: '#', isRead: false }, recipientId);
    } catch {
      /* the referral itself already succeeded */
    }
  }

  findAll(): Referral[] {
    return this.repo.findAll();
  }

  findByCandidate(candidateId: number): Referral[] {
    return this.repo.findByCandidate(candidateId);
  }

  findByAlumni(alumniId: number): Referral[] {
    return this.repo.findByAlumni(alumniId);
  }

  findOne(id: number): Referral {
    const ref = this.repo.findById(id);
    if (!ref) throw new NotFoundException(`Referral with id ${id} not found`);
    return ref;
  }

  create(dto: CreateReferralDto, candidateId: number): Referral {
    const opp = this.oppsService.findOne(dto.opportunityId);
    if (!dto.alumniId) throw new BadRequestException('alumniId is required');
    const alumni = this.usersRepo.findById(dto.alumniId);
    const candidate = this.usersRepo.findById(candidateId);
    if (!alumni || alumni.role !== 'alumni') throw new BadRequestException('Choose an alumnus from the directory');
    if (!candidate) throw new NotFoundException('Candidate account not found');
    // The alumnus must work at the company the candidate applied to, and be from the same college.
    const alumniCompanyKey = referralCompanyKey(alumni.company);
    if (!alumniCompanyKey || alumniCompanyKey !== referralCompanyKey(opp.company)) {
      throw new BadRequestException(`${alumni.name} does not work at ${opp.company}`);
    }
    if ((alumni.collegeId ?? 1) !== (candidate.collegeId ?? 1)) throw new BadRequestException('Alumnus is from a different college');
    const duplicate = this.repo
      .findByCandidate(candidateId)
      .some((r) => r.alumniId === dto.alumniId && r.opportunityId === dto.opportunityId);
    if (duplicate) throw new ConflictException('You have already requested a referral from this alumnus for this opportunity');
    const now = new Date().toISOString().split('T')[0];
    const ini = (n: string) => n.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    const referral = this.repo.create({
      opportunityId:     opp.id,
      applicationId:     dto.applicationId,
      candidateId,
      candidateName:     candidate.name,
      candidateInitials: ini(candidate.name),
      alumniId:          alumni.id,
      alumniName:        alumni.name,
      alumniInitials:    ini(alumni.name),
      alumniAvatarColor: alumni.avatarColor ?? '#3b82f6',
      alumniCompany:     alumni.company ?? opp.company,
      alumniBatch:       alumni.batch ? `${alumni.batch} Batch` : '',
      status:            'pending',
      appliedRole:       opp.title,
      appliedCompany:    opp.company,
      requestedDate:     now,
      userMessage:       dto.userMessage,
      alumniResponse:    null,
      department:        candidate.department,
      cgpa:              candidate.cgpa,
      skills:            candidate.skills,
    });

    this.notify(
      alumni.id,
      'New referral request',
      `${candidate.name} asked you for a referral for ${opp.title} at ${opp.company}.`,
    );
    this.activity.log({
      action: 'Referral Requested', detail: `${candidate.name} asked ${alumni.name} for a referral to ${opp.title} at ${opp.company}`,
      actor: candidate.name, actorRole: 'candidate', collegeId: candidate.collegeId ?? null, type: 'referral',
    });
    return referral;
  }

  update(id: number, dto: UpdateReferralDto, alumniId?: number): Referral {
    const ref = this.repo.findById(id);
    if (!ref || (alumniId !== undefined && ref.alumniId !== alumniId)) {
      throw new NotFoundException(`Referral with id ${id} not found`);
    }
    const wasStatus = String(ref.status).toLowerCase();
    const patch: Partial<Referral> = { ...(dto as Partial<Referral>) };
    if (dto.status) {
      const v = dto.status.toLowerCase();
      patch.status = v === 'rejected' ? 'declined' : v;
      patch.decidedAt = new Date().toISOString();
    }
    const updated = this.repo.update(id, patch)!;

    const nowStatus = String(updated.status).toLowerCase();
    if (nowStatus !== wasStatus && (nowStatus === 'approved' || nowStatus === 'declined')) {
      const approved = nowStatus === 'approved';
      this.notify(
        updated.candidateId,
        approved ? 'Referral approved' : 'Referral declined',
        `${updated.alumniName} ${approved ? 'approved' : 'declined'} your referral request for ${updated.appliedRole} at ${updated.appliedCompany}.`
          + (updated.alumniResponse ? ` Message: ${updated.alumniResponse}` : ''),
      );
      this.activity.log({
        action: approved ? 'Referral Approved' : 'Referral Declined',
        detail: `${updated.alumniName} ${approved ? 'approved' : 'declined'} ${updated.candidateName}'s referral for ${updated.appliedRole} at ${updated.appliedCompany}`,
        actor: updated.alumniName, actorRole: 'alumni', collegeId: this.usersRepo.findById(updated.alumniId)?.collegeId ?? null, type: 'referral',
      });
    }
    return updated;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Referral with id ${id} not found`);
    return { message: `Referral ${id} deleted successfully` };
  }

  getStats(alumniId: number): Record<string, number> {
    const refs = this.repo.findByAlumni(alumniId);
    return {
      total: refs.length,
      pending: refs.filter((r) => r.status === 'pending' || r.status === 'Pending').length,
      approved: refs.filter((r) => r.status === 'approved' || r.status === 'Approved').length,
      declined: refs.filter((r) => r.status === 'declined' || r.status === 'Rejected').length,
    };
  }
}
