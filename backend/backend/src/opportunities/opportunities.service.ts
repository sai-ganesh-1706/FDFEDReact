import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OpportunitiesRepository, Opportunity } from './opportunities.repository';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersRepository } from '../users/users.repository';
import { ActivityService } from '../activity/activity.service';
import { ApplicationsRepository } from '../applications/applications.repository';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly repo: OpportunitiesRepository,
    private readonly notifications: NotificationsService,
    private readonly usersRepo: UsersRepository,
    private readonly activity: ActivityService,
    private readonly applications: ApplicationsRepository,
  ) {}

  private withApplicationCount(opp: Opportunity): Opportunity {
    return { ...opp, applications: this.applications.findByOpportunity(opp.id).length };
  }

  findAll(collegeId?: number | null): Opportunity[] {
    const all = this.repo.findAll().map((opp) => this.withApplicationCount(opp));
    return collegeId ? all.filter((o) => (o.collegeId ?? 1) === collegeId) : all;
  }

  /** Published opportunities open to a college's candidates and alumni. */
  findPublished(collegeId?: number | null): Opportunity[] {
    return this.findAll(collegeId).filter((o) => o.status === 'Published');
  }

  findOne(id: number): Opportunity {
    const opp = this.repo.findById(id);
    if (!opp) throw new NotFoundException(`Opportunity with id ${id} not found`);
    return this.withApplicationCount(opp);
  }

  /** A recruiter owns what they posted, plus anything posted for their company. */
  owns(opp: Opportunity, userId: number, company?: string): boolean {
    if (opp.recruiterId === userId) return true;
    return !!company && opp.company.trim().toLowerCase() === company.trim().toLowerCase();
  }

  findForRecruiter(userId: number, company?: string): Opportunity[] {
    return this.repo.findAll().filter((o) => this.owns(o, userId, company)).map((opp) => this.withApplicationCount(opp));
  }

  create(dto: CreateOpportunityDto, userId?: number, role?: string, collegeId?: number | null): Opportunity {
    const poster = userId ? this.usersRepo.findById(userId) : undefined;
    // Officers post on behalf of the college and can publish straight away; recruiters wait for approval.
    const status = role === 'placement_officer' ? 'Published' : 'pending';
    // A recruiter always posts for their own company, whatever the form says.
    const company = role === 'recruiter' && poster?.company ? poster.company : dto.company;
    const created = this.repo.create({
      ...dto,
      company,
      status,
      applications: 0,
      recruiterId: role === 'recruiter' ? userId : undefined,
      collegeId: collegeId ?? poster?.collegeId ?? 1,
      submittedBy: poster?.name ?? dto.submittedBy,
    });
    this.activity.log({
      action: 'Opportunity Posted',
      detail: `${created.title} at ${created.company} was posted${status === 'pending' ? ' and is awaiting placement cell review' : ''}`,
      actor: poster?.name ?? role ?? 'user', actorRole: role, collegeId: created.collegeId, type: 'opportunity',
    });
    return this.withApplicationCount(created);
  }

  update(id: number, dto: UpdateOpportunityDto): Opportunity {
    const { applications: _applications, ...changes } = dto;
    const updated = this.repo.update(id, changes as Partial<Opportunity>);
    if (!updated) throw new NotFoundException(`Opportunity with id ${id} not found`);
    return this.withApplicationCount(updated);
  }

  private tell(opp: Opportunity, title: string, message: string) {
    if (opp.recruiterId) this.notifications.create({ type: 'status', title, message, href: '#', isRead: false }, opp.recruiterId);
  }

  approve(id: number, actor?: { name: string; collegeId?: number | null }): Opportunity {
    const opp = this.findOne(id);
    if (opp.status !== 'pending') {
      throw new BadRequestException('Only pending opportunities can be approved');
    }
    const updated = this.repo.update(id, { status: 'approved' })!;
    this.tell(opp, 'Opportunity approved', `${opp.title} was approved by the placement cell and will go live shortly.`);
    this.activity.log({ action: 'Opportunity Approved', detail: `${opp.title} at ${opp.company} was approved`, actor: actor?.name ?? 'Placement officer', actorRole: 'placement_officer', collegeId: opp.collegeId, type: 'opportunity' });
    return this.withApplicationCount(updated);
  }

  /** Undo an approval while the opportunity is still unpublished. */
  undoApproval(id: number, actor?: { name: string }): Opportunity {
    const opp = this.findOne(id);
    if (opp.status !== 'approved') {
      throw new BadRequestException('Only approved, unpublished opportunities can return to review');
    }
    const updated = this.repo.update(id, { status: 'pending' })!;
    this.activity.log({ action: 'Opportunity Approval Undone', detail: `${opp.title} at ${opp.company} was returned to pending review`, actor: actor?.name ?? 'Placement officer', actorRole: 'placement_officer', collegeId: opp.collegeId, type: 'opportunity' });
    return this.withApplicationCount(updated);
  }

  publish(id: number, actor?: { name: string }): Opportunity {
    const opp = this.findOne(id);
    if (opp.status !== 'approved') {
      throw new BadRequestException('Only approved opportunities can be published');
    }
    const updated = this.repo.update(id, { status: 'Published' })!;
    this.tell(opp, 'Opportunity published', `${opp.title} is now live and open for student applications.`);
    // Let every active student of the college know a new drive is open.
    this.usersRepo.findByRoleAndCollege('candidate', opp.collegeId ?? 1)
      .filter((u) => u.status !== 'inactive')
      .forEach((u) => this.notifications.create({
        type: 'general',
        title: `New opportunity: ${opp.title}`,
        message: `${opp.company} is hiring for ${opp.title} (${opp.type}, ${opp.salary}). Apply before ${opp.deadline}.`,
        href: 'opportunities', isRead: false,
      }, u.id));
    this.activity.log({ action: 'Opportunity Published', detail: `${opp.title} at ${opp.company} is now live for candidates`, actor: actor?.name ?? 'Placement officer', actorRole: 'placement_officer', collegeId: opp.collegeId, type: 'opportunity' });
    return this.withApplicationCount(updated);
  }

  reject(id: number, remark: string, actor?: { name: string }): Opportunity {
    const opp = this.findOne(id);
    const cleanRemark = remark?.trim();
    if (opp.status !== 'pending') {
      throw new BadRequestException('Only pending opportunities can be rejected');
    }
    if (!cleanRemark || cleanRemark.length < 20) {
      throw new BadRequestException('Rejection remarks must contain at least 20 characters');
    }
    const updated = this.repo.update(id, { status: 'rejected', rejectionRemark: cleanRemark })!;
    this.tell(opp, 'Opportunity not approved', `${opp.title} was not approved. Reason: ${cleanRemark}`);
    this.activity.log({ action: 'Opportunity Rejected', detail: `${opp.title} at ${opp.company} was rejected`, actor: actor?.name ?? 'Placement officer', actorRole: 'placement_officer', collegeId: opp.collegeId, type: 'opportunity' });
    return this.withApplicationCount(updated);
  }

  remove(id: number): { message: string } {
    const removed = this.repo.remove(id);
    if (!removed) throw new NotFoundException(`Opportunity with id ${id} not found`);
    return { message: `Opportunity ${id} deleted successfully` };
  }

  incrementApplications(id: number): void {
    // Counts are derived from application records, including after deletion.
    this.findOne(id);
  }
}
