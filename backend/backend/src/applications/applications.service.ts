import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { ApplicationsRepository, Application } from './applications.repository';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { AssessmentsService } from '../assessments/assessments.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ShortlistCandidatesDto } from './dto/shortlist-candidates.dto';
import { UsersRepository } from '../users/users.repository';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ReferralsRepository, Referral } from '../referrals/referrals.repository';
import { ActivityService } from '../activity/activity.service';
import { BulkStatusDto } from './dto/bulk-status.dto';

const STAGES = ['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered'];
const norm = (v?: string) => String(v ?? '').toLowerCase();

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly repo: ApplicationsRepository,
    private readonly oppsService: OpportunitiesService,
    @Inject(forwardRef(() => AssessmentsService))
    private readonly assessmentsService: AssessmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly usersRepo: UsersRepository,
    private readonly referralsRepo: ReferralsRepository,
    private readonly activity: ActivityService,
  ) {}

  /** Normalise status, stage position and referral details so every role sees the same truth. */
  enrich(app: Application): Application {
    const status = app.status === 'Offer' ? 'Offered' : app.status;
    let idx = STAGES.indexOf(status);
    if (idx === -1) {
      // Rejected / withdrawn: stop at the furthest stage actually reached.
      idx = Math.max(0, ...app.timeline.map((t) => STAGES.indexOf(t.stage === 'Offer' ? 'Offered' : t.stage)));
    }
    const user = this.usersRepo.findById(app.candidateId);
    const refs = this.referralsRepo.findByCandidate(app.candidateId).filter((r) => r.opportunityId === app.opportunityId);
    const rank = (r: Referral) => ({ approved: 3, pending: 2, declined: 1 } as Record<string, number>)[norm(r.status) === 'rejected' ? 'declined' : norm(r.status)] ?? 0;
    const ref = [...refs].sort((a, b) => rank(b) - rank(a) || b.id - a.id)[0];
    const out: Application = {
      ...app,
      status,
      currentStageIndex: idx,
      email: user?.email ?? app.email,
      phone: app.phone ?? user?.phone,
    };
    if (ref) {
      const refStatus = norm(ref.status) === 'rejected' ? 'declined' : (norm(ref.status) as 'pending' | 'approved' | 'declined');
      const alum = this.usersRepo.findById(ref.alumniId);
      out.referralStatus = refStatus;
      out.referralNote = ref.alumniResponse ?? undefined;
      out.hasReferral = refStatus === 'approved';
      out.referrerName = ref.alumniName;
      out.referrerInitials = ref.alumniInitials;
      out.referrerCompany = ref.alumniCompany;
      out.referrerBatch = ref.alumniBatch;
      out.referrerAvatarColor = ref.alumniAvatarColor;
      out.referrerDesignation = alum?.headline;
      out.referrerEmail = alum?.email;
    }
    return out;
  }

  private notifyRecruiters(opp: { id: number; recruiterId?: number; company: string }, title: string, message: string) {
    const recruiters = this.usersRepo.findByRole('recruiter').filter(
      (u) => u.id === opp.recruiterId || (u.company ?? '').trim().toLowerCase() === opp.company.trim().toLowerCase(),
    );
    recruiters.forEach((u) => this.notificationsService.create({ type: 'status', title, message, href: '#', isRead: false }, u.id));
  }

  /** Applications for opportunities the recruiter owns. */
  findForRecruiter(userId: number): Application[] {
    const company = this.usersRepo.findById(userId)?.company;
    const mine = new Set(this.oppsService.findForRecruiter(userId, company).map((o) => o.id));
    return this.repo.findAll().filter((a) => mine.has(a.opportunityId)).map((a) => this.enrich(a));
  }

  ownsApplication(app: Application, userId: number): boolean {
    const company = this.usersRepo.findById(userId)?.company;
    return this.oppsService.owns(this.oppsService.findOne(app.opportunityId), userId, company);
  }

  /** Shortlist candidates for an opportunity, creating an application when they never applied. */
  shortlist(dto: ShortlistCandidatesDto, recruiterId: number): Application[] {
    const opp = this.oppsService.findOne(dto.opportunityId);
    const company = this.usersRepo.findById(recruiterId)?.company;
    if (!this.oppsService.owns(opp, recruiterId, company)) {
      throw new ForbiddenException('You can only shortlist for your own opportunities');
    }
    const now = new Date().toISOString().split('T')[0];
    const results: Application[] = [];
    for (const candidateId of dto.candidateIds) {
      const user = this.usersRepo.findById(candidateId);
      if (!user || user.role !== 'candidate') continue;
      const existing = this.repo.findByCandidate(candidateId).find((a) => a.opportunityId === opp.id);
      let app: Application;
      if (existing) {
        if (existing.status !== 'Applied') { results.push(existing); continue; }
        app = this.updateStatus(existing.id, { status: 'Shortlisted', remarks: 'Shortlisted by recruiter' });
      } else {
        app = this.repo.create({
          opportunityId: opp.id,
          candidateId,
          collegeId: user.collegeId ?? undefined,
          candidateName: user.name,
          branch: user.department,
          cgpa: user.cgpa,
          email: user.email,
          phone: user.phone,
          title: opp.title,
          company: opp.company,
          type: opp.type,
          status: 'Shortlisted',
          appliedDate: now,
          hasReferral: false,
          currentStageIndex: 2,
          initials: user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
          rounds: { resume: 'Pass', assessment: 'Pending', technical: 'Pending', hr: 'Pending' },
          timeline: [
            { stage: 'Applied', date: now, desc: 'Added by recruiter', status: 'completed' },
            { stage: 'Shortlisted', date: now, desc: 'Shortlisted by recruiter', status: 'active' },
          ],
        });
        this.oppsService.incrementApplications(opp.id);
      }
      this.notificationsService.create(
        {
          type: 'status',
          title: 'Application Shortlisted',
          message: `You have been shortlisted for ${opp.title} at ${opp.company}.`,
          href: 'applications.html',
          isRead: false,
        },
        candidateId,
      );
      results.push(app);
    }
    return results;
  }

  /** Move several applications at once (e.g. shortlist everyone who just applied). */
  bulkStatus(dto: BulkStatusDto, recruiterId: number): Application[] {
    const done: Application[] = [];
    for (const id of dto.applicationIds) {
      const app = this.repo.findById(id);
      if (!app) continue;
      if (!this.ownsApplication(app, recruiterId)) throw new ForbiddenException('You can only update applications for your own opportunities');
      if (app.status !== 'Applied') continue;   // only fresh applications are moved in bulk
      done.push(this.updateStatus(id, { status: dto.status, remarks: dto.remarks ?? (dto.status === 'Shortlisted' ? 'Shortlisted by recruiter' : undefined) }));
    }
    if (!done.length) throw new BadRequestException('None of the selected applications are in the Applied stage');
    return done;
  }

  findAll(collegeId?: number | null): Application[] {
    const all = this.repo.findAll().map((a) => this.enrich(a));
    return collegeId ? all.filter((a) => (a.collegeId ?? 1) === collegeId) : all;
  }

  /** A candidate's own applications. Ratings and feedback appear only once the recruiter has sent them. */
  findByCandidate(candidateId: number): Application[] {
    return this.repo.findByCandidate(candidateId).map((a) => {
      const e = this.enrich(a);
      if (!e.feedbackSent) { delete e.evaluation; delete e.recruiterFeedback; }
      return e;
    });
  }

  findByOpportunity(opportunityId: number): Application[] {
    return this.repo.findByOpportunity(opportunityId);
  }

  findOne(id: number): Application {
    const app = this.repo.findById(id);
    if (!app) throw new NotFoundException(`Application with id ${id} not found`);
    return this.enrich(app);
  }

  apply(dto: CreateApplicationDto, candidateId: number, collegeId?: number): Application {
    const opp = this.oppsService.findOne(dto.opportunityId);
    if (opp.status !== 'Published') {
      throw new ConflictException('This opportunity is not open for applications');
    }

    if (this.repo.existsByOpportunityAndCandidate(dto.opportunityId, candidateId)) {
      throw new ConflictException('You have already applied to this opportunity');
    }

    const user = this.usersRepo.findById(candidateId);
    if (!user) throw new NotFoundException('Candidate account not found');
    if ((opp.collegeId ?? 1) !== (user.collegeId ?? 1)) {
      throw new ConflictException('This opportunity is not open to your college');
    }
    const name = user.name;
    const now = new Date().toISOString().split('T')[0];
    const application = this.repo.create({
      opportunityId: dto.opportunityId,
      candidateId,
      collegeId: user.collegeId ?? collegeId,
      candidateName: name,
      branch: user.department,
      cgpa: user.cgpa,
      email: user.email,
      phone: user.phone,
      resumeFile: dto.resumeFile,
      title: opp.title,
      company: opp.company,
      type: opp.type,
      status: 'Applied',
      appliedDate: now,
      hasReferral: false,
      currentStageIndex: 0,
      initials: name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
      rounds: { resume: 'Pending', assessment: 'Pending', technical: 'Pending', hr: 'Pending' },
      timeline: [{ stage: 'Applied', date: now, desc: 'Application submitted', status: 'active' }],
    });

    this.oppsService.incrementApplications(dto.opportunityId);

    // ── Assessment Announcement ────────────────────────────────────────────
    // If the recruiter has linked assessments to this opportunity, notify the candidate.
    const assessments = this.assessmentsService.findByOpportunity(dto.opportunityId);
    for (const assessment of assessments) {
      this.notificationsService.create(
        {
          type: 'assessment',
          title: `📝 Assessment Scheduled: ${assessment.title}`,
          message:
            `${opp.company} has scheduled an assessment for the ${opp.title} role. ` +
            `Platform: ${assessment.platform} · ` +
            `Date: ${assessment.date} at ${assessment.time} · ` +
            `Duration: ${assessment.duration}. ` +
            `Join here: ${assessment.link}`,
          href: 'applications.html',
          isRead: false,
        },
        candidateId,
      );
    }

    this.notifyRecruiters(opp, 'New application received', `${name} applied for ${opp.title}.`);
    this.activity.log({
      action: 'Application Submitted', detail: `${name} applied for ${opp.title} at ${opp.company}`,
      actor: name, actorRole: 'candidate', collegeId: user.collegeId ?? null, type: 'application',
    });
    return this.enrich(application);
  }

  updateStatus(id: number, dto: UpdateApplicationDto, opts: { silent?: boolean } = {}): Application {
    const app = this.repo.findById(id);
    if (!app) throw new NotFoundException(`Application with id ${id} not found`);

    const now = new Date().toISOString().split('T')[0];
    const updates: Partial<Application> = {};

    // Persist round results if provided
    if (dto.rounds) {
      updates.rounds = { ...app.rounds, ...dto.rounds };
    }
    if (dto.evaluation) updates.evaluation = { ...app.evaluation, ...dto.evaluation };
    if (dto.recruiterFeedback !== undefined) updates.recruiterFeedback = dto.recruiterFeedback;
    if (dto.feedbackSent !== undefined) updates.feedbackSent = dto.feedbackSent;
    if (dto.feedbackSent && !app.feedbackSent) {
      this.notificationsService.create(
        {
          type: 'status',
          title: 'Recruiter Feedback Received',
          message: `${app.company} shared feedback on your ${app.title} application.`,
          href: 'applications.html',
          isRead: false,
        },
        app.candidateId,
      );
    }

    if (dto.status && dto.status !== app.status) {
      const timeline = [...app.timeline];
      // Mark the last active stage as completed
      const lastActive = timeline.findIndex((t) => t.status === 'active');
      if (lastActive !== -1) timeline[lastActive].status = 'completed';

      // Add new stage entry
      timeline.push({
        stage: dto.status,
        date: dto.interviewDate ?? now,
        desc: dto.remarks ?? `Moved to ${dto.status}`,
        status: 'active',
      });
      updates.status = dto.status;
      updates.timeline = timeline;
      if (dto.interviewDate) updates.interviewDate = dto.interviewDate;
      if (dto.remarks) updates.remarks = dto.remarks;
      if (!opts.silent) {
        this.notificationsService.create(
          {
            type: dto.status === 'Offered' ? 'offer' : 'status',
            title: `Application update — ${app.company}`,
            message: `Your application for ${app.title} moved to ${dto.status}.` + (dto.remarks ? ` Note: ${dto.remarks}` : ''),
            href: 'applications', isRead: false,
          },
          app.candidateId,
        );
      }
      this.activity.log({
        action: 'Application Status Updated', detail: `${app.candidateName}'s application for ${app.title} at ${app.company} moved to ${dto.status}`,
        actor: `${app.company} recruiter`, actorRole: 'recruiter', collegeId: app.collegeId ?? null, type: 'application',
      });
    }

    const updated = this.repo.update(id, updates);
    return this.enrich(updated!);
  }

  withdraw(id: number, candidateId: number): Application {
    const app = this.repo.findById(id);
    if (!app || app.candidateId !== candidateId) throw new NotFoundException(`Application with id ${id} not found`);
    if (['Rejected', 'Offer', 'Offered', 'Withdrawn'].includes(app.status)) {
      throw new ConflictException(`Cannot withdraw an application with status '${app.status}'`);
    }
    const now = new Date().toISOString().split('T')[0];
    return this.repo.update(id, {
      status: 'Withdrawn',
      timeline: [
        ...app.timeline,
        { stage: 'Withdrawn', date: now, desc: 'Withdrawn by candidate', status: 'completed' },
      ],
    })!;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Application with id ${id} not found`);
    return { message: `Application ${id} deleted successfully` };
  }

  getStats(candidateId: number): Record<string, number> {
    const apps = this.repo.findByCandidate(candidateId);
    return {
      total: apps.length,
      applied: apps.filter((a) => a.status === 'Applied').length,
      shortlisted: apps.filter((a) => a.status === 'Shortlisted').length,
      interviews: apps.filter((a) => a.status === 'Interview').length,
      offers: apps.filter((a) => ['Offer', 'Offered'].includes(a.status)).length,
      rejected: apps.filter((a) => a.status === 'Rejected').length,
    };
  }
}
