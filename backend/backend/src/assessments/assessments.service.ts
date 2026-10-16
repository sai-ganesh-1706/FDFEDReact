import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { AssessmentsRepository, Assessment } from './assessments.repository';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { ApplicationsService } from '../applications/applications.service';
import { NotificationsService } from '../notifications/notifications.service';
import { OpportunitiesService } from '../opportunities/opportunities.service';
import { UsersRepository } from '../users/users.repository';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class AssessmentsService {
  constructor(
    private readonly repo: AssessmentsRepository,
    // forwardRef breaks the circular dep: AssessmentsModule ↔ ApplicationsModule
    @Inject(forwardRef(() => ApplicationsService))
    private readonly appsService: ApplicationsService,
    private readonly notificationsService: NotificationsService,
    private readonly oppsService: OpportunitiesService,
    private readonly usersRepo: UsersRepository,
    private readonly activity: ActivityService,
  ) {}

  findAll(): Assessment[] {
    return this.repo.findAll();
  }

  /** Scheduled rounds visible to placement staff for one college only. */
  findForCollege(collegeId: number): Assessment[] {
    return this.repo.findAll().filter((assessment) => {
      const opportunityCollegeId = assessment.opportunityId
        ? this.oppsService.findOne(assessment.opportunityId).collegeId
        : undefined;
      const recruiterCollegeId = assessment.recruiterId
        ? this.usersRepo.findById(assessment.recruiterId)?.collegeId
        : undefined;
      return (opportunityCollegeId ?? recruiterCollegeId ?? 1) === collegeId;
    });
  }

  findOne(id: number): Assessment {
    const a = this.repo.findById(id);
    if (!a) throw new NotFoundException(`Assessment with id ${id} not found`);
    return a;
  }

  findByOpportunity(opportunityId: number): Assessment[] {
    return this.repo.findByOpportunity(opportunityId);
  }

  /** Assessments a recruiter created or that belong to an opportunity they own. */
  findForRecruiter(userId: number, ownedOpportunityIds: Set<number>): Assessment[] {
    return this.repo
      .findAll()
      .filter((a) => a.recruiterId === userId || (a.opportunityId !== undefined && ownedOpportunityIds.has(a.opportunityId)));
  }

  /** Everything scheduled for a candidate: sessions aimed at them, plus drive-wide ones for drives they applied to. */
  findForCandidate(candidateId: number) {
    const mine = this.appsService.findByCandidate(candidateId);
    return this.repo.findAll()
      .filter((a) => !a.isDraft)
      .filter((a) => a.candidateIds
        ? a.candidateIds.includes(candidateId)
        : a.opportunityId !== undefined && mine.some((app) => app.opportunityId === a.opportunityId))
      .map((a) => {
        const app = mine.find((m) => m.id === a.applicationId) ?? mine.find((m) => m.opportunityId === a.opportunityId);
        const opp = a.opportunityId ? this.oppsService.findOne(a.opportunityId) : undefined;
        return { ...a, applicationId: app?.id, company: a.company ?? opp?.company, jobTitle: app?.title ?? opp?.title ?? a.role };
      })
      .sort((x, y) => x.date.localeCompare(y.date));
  }

  create(dto: CreateAssessmentDto, recruiterId?: number): Assessment {
    const recruiter = recruiterId ? this.usersRepo.findById(recruiterId) : undefined;
    const opportunityId = dto.opportunityId ?? (dto.applicationId ? this.appsService.findOne(dto.applicationId).opportunityId : undefined);
    const opp = opportunityId ? this.oppsService.findOne(opportunityId) : undefined;
    const single = dto.applicationId ? this.appsService.findOne(dto.applicationId) : undefined;
    const targets = single
      ? [single]
      : opportunityId
        ? this.appsService.findByOpportunity(opportunityId).filter((a) => !['Rejected', 'Withdrawn'].includes(a.status))
        : [];

    const assessment = this.repo.create({
      ...dto,
      opportunityId,
      isDraft: dto.isDraft ?? false,
      recruiterId,
      company: recruiter?.company ?? opp?.company,
      candidateIds: targets.map((t) => t.candidateId),
      candidateName: single?.candidateName,
      candidates: targets.length || dto.candidates,
      createdAt: new Date().toISOString(),
    });

    if (!assessment.isDraft) {
      const isInterview = /interview|discussion/i.test(assessment.type);
      for (const app of targets) {
        // Scheduling for one candidate also moves their application forward.
        if (single) {
          const target = isInterview ? 'Interview' : 'Assessment';
          const order = ['Applied', 'Shortlisted', 'Assessment', 'Interview'];
          if (order.indexOf(app.status) !== -1 && order.indexOf(app.status) < order.indexOf(target)) {
            this.appsService.updateStatus(app.id, { status: target, interviewDate: dto.date, remarks: `${assessment.type} on ${assessment.date} at ${assessment.time}` }, { silent: true });
          }
        }
        this.notificationsService.create(
          {
            type: 'assessment',
            title: `${isInterview ? 'Interview' : 'Assessment'} scheduled: ${assessment.title}`,
            message:
              `${app.company} scheduled a ${assessment.type.toLowerCase()} for your ${app.title} application. ` +
              `Platform: ${assessment.platform} · Date: ${assessment.date} at ${assessment.time} · ` +
              `Duration: ${assessment.duration}. Join here: ${assessment.link}`,
            href: 'applications', isRead: false,
          },
          app.candidateId,
        );
      }
      this.activity.log({
        action: isInterview ? 'Interview Scheduled' : 'Assessment Scheduled',
        detail: `${assessment.title} scheduled${single ? ` for ${single.candidateName}` : ` for ${targets.length} applicant(s)`} (${assessment.company ?? 'recruiter'})`,
        actor: recruiter?.name ?? 'Recruiter', actorRole: 'recruiter', collegeId: recruiter?.collegeId ?? null, type: 'application',
      });
    }
    return assessment;
  }

  update(id: number, dto: UpdateAssessmentDto): Assessment {
    const updated = this.repo.update(id, dto as Partial<Assessment>);
    if (!updated) throw new NotFoundException(`Assessment with id ${id} not found`);
    return updated;
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Assessment with id ${id} not found`);
    return { message: `Assessment ${id} deleted successfully` };
  }
}
