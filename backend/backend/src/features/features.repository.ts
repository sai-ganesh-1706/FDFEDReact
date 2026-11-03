import { BadRequestException, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { UsersRepository } from '../users/users.repository';
import { ApplicationsRepository } from '../applications/applications.repository';
import { OpportunitiesRepository } from '../opportunities/opportunities.repository';

/** ── Interfaces ─────────────────────────────────────────────────── */

export interface SavedDrive {
  userId: number;
  driveId: string;
  savedAt: string;
}

export interface DriveSearchResult {
  id: string;
  title: string;
  company: string;
  type: 'fulltime' | 'internship';
  package: number;       // LPA (fulltime) or monthly stipend
  deadline: string;
  department: string[];
  minCgpa: number;
  location: string;
  collegeId: number;
  isSaved?: boolean;
}

export interface ApplicationStage {
  appId: string;
  candidateId: number;
  driveId: string;
  driveTitle: string;
  company: string;
  appliedAt: string;
  stages: Stage[];
}

export interface Stage {
  name: string;
  status: 'pending' | 'current' | 'passed' | 'failed';
  date?: string;
  note?: string;
}

export interface InterviewSchedule {
  id: number;
  driveId: string;
  driveTitle: string;
  company: string;
  candidateId: number;
  recruiterId: number;
  collegeId: number;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  location?: string;
  meetLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  round: string;
}

export interface BulkNotification {
  id: number;
  collegeId: number;
  sentBy: number;
  title: string;
  message: string;
  targetGroup: 'students' | 'alumni' | 'recruiters' | 'all';
  sentAt: string;
  recipientCount: number;
}

export interface MentorshipRequest {
  id: number;
  studentId: number;
  studentName: string;
  alumniId: number;
  collegeId: number;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  topic: string;
  createdAt: string;
  respondedAt?: string;
}

export interface CollegeEvent {
  id: number;
  collegeId: number;
  title: string;
  date: string;
  time: string;
  type: 'networking' | 'workshop' | 'reunion' | 'webinar';
  description: string;
  host: string;
  registrations: number[];
}

export interface DriveReport {
  driveId: string;
  driveTitle: string;
  company: string;
  collegeId: number;
  recruiterId: number;
  applied: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  accepted: number;
  createdAt: string;
}

export interface PlacementDashboardData {
  collegeId: number;
  totalStudents: number;
  totalPlaced: number;
  placementRate: number;
  avgPackage: number;
  highestPackage: number;
  byDept: DeptStat[];
  topCompanies: CompanyStat[];
  monthlyTrend: MonthTrend[];
  totalApplications?: number;
  uniqueApplicants?: number;
  totalOffers?: number;
  internshipApplications?: number;
  internshipOpportunities?: number;
  companiesVisited?: number;
  applicationTrend?: { labels: string[]; fullTime: number[]; internships: number[] };
}

export interface DeptStat {
  dept: string;
  total: number;
  placed: number;
  rate: number;
  avgPackage: number;
}

export interface CompanyStat {
  company: string;
  offers: number;
  avgPackage: number;
}

export interface MonthTrend {
  month: string;
  placements: number;
}

/** ── Repository ─────────────────────────────────────────────────── */

@Injectable()
export class FeaturesRepository {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly applicationsRepo: ApplicationsRepository,
    private readonly opportunitiesRepo: OpportunitiesRepository,
  ) {
    const seed = JSON.parse(readFileSync(join(process.cwd(), 'data', 'features.demo.json'), 'utf8'));
    for (const key of ['drives', 'savedDrives', 'applicationStages', 'interviewSchedules', 'notifications', 'mentorshipRequests', 'events', 'driveReports', 'placementDashboards']) {
      if (!Array.isArray(seed[key])) throw new Error(`Invalid demo feature data: ${key}`);
      (this as any)[key] = seed[key];
    }
    this.nextNotifId = Math.max(0, ...this.notifications.map((item) => item.id)) + 1;
    this.nextRequestId = Math.max(0, ...this.mentorshipRequests.map((item) => item.id)) + 1;
    this.nextInterviewId = Math.max(0, ...this.interviewSchedules.map((item) => item.id)) + 1;
  }

  /* ── Drives catalogue (shared across all colleges, filtered by collegeId) ── */
  private drives: DriveSearchResult[] = [];

  /* ── Saved drives ────────────────────────────────────────────────── */
  private savedDrives: SavedDrive[] = [];

  /* ── Application stages ──────────────────────────────────────────── */
  private applicationStages: ApplicationStage[] = [];

  /* ── Interview schedules ─────────────────────────────────────────── */
  private interviewSchedules: InterviewSchedule[] = [];

  /* ── Bulk notifications ──────────────────────────────────────────── */
  private notifications: BulkNotification[] = [];

  /* ── Mentorship requests ─────────────────────────────────────────── */
  private mentorshipRequests: MentorshipRequest[] = [];

  /* ── College Events ──────────────────────────────────────────────── */
  private events: CollegeEvent[] = [];

  /* ── Drive Reports (per drive) ──────────────────────────────────── */
  private driveReports: DriveReport[] = [];

  /* ── Placement dashboard data (per college) ──────────────────────── */
  private placementDashboards: PlacementDashboardData[] = [];

  private nextNotifId = 5;
  private nextRequestId = 6;
  private nextInterviewId = 8;

  /* ═══ Drives / Search Methods ══════════════════════════════════════ */

  getDrivesByCollege(collegeId: number): DriveSearchResult[] {
    return this.opportunitiesRepo.findPublished()
      .filter((opportunity) => (opportunity.collegeId ?? 1) === collegeId)
      .map((opportunity) => ({
        id: String(opportunity.id),
        title: opportunity.title,
        company: opportunity.company,
        type: /intern/i.test(opportunity.type) ? 'internship' : 'fulltime',
        package: Number(opportunity.salary.match(/[\d.]+/)?.[0] ?? 0),
        deadline: opportunity.deadline,
        department: opportunity.branches ?? [],
        minCgpa: opportunity.cgpa,
        location: opportunity.location,
        collegeId: opportunity.collegeId ?? 1,
      }));
  }

  searchDrives(collegeId: number, q?: string, type?: string, sort?: string, minPackage?: number): DriveSearchResult[] {
    let results = this.getDrivesByCollege(collegeId);
    if (q) results = results.filter(d => d.company.toLowerCase().includes(q.toLowerCase()) || d.title.toLowerCase().includes(q.toLowerCase()));
    if (type && type !== 'all') results = results.filter(d => d.type === type);
    if (minPackage) results = results.filter(d => d.package >= minPackage);
    if (sort === 'package_desc') results.sort((a, b) => b.package - a.package);
    if (sort === 'package_asc')  results.sort((a, b) => a.package - b.package);
    if (sort === 'deadline')     results.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return results;
  }

  /* ═══ Saved Drives ══════════════════════════════════════════════════ */

  getSavedDrives(userId: number, collegeId: number): DriveSearchResult[] {
    const saved = this.savedDrives.filter(s => s.userId === userId);
    const liveDrives = this.getDrivesByCollege(collegeId);
    return saved.map(s => liveDrives.find(d => Number(d.id) === Number(s.driveId))).filter(Boolean) as DriveSearchResult[];
  }

  getSavedDriveIds(userId: number): string[] {
    const user = this.usersRepo.findById(userId);
    if (!user) return [];
    const liveIds = new Set(this.getDrivesByCollege(user.collegeId ?? 1).map((drive) => drive.id));
    return this.savedDrives.filter((saved) => saved.userId === userId && liveIds.has(String(saved.driveId))).map((saved) => String(saved.driveId));
  }

  saveDrive(userId: number, driveId: string): { success: boolean; message: string } {
    const user = this.usersRepo.findById(userId);
    const drive = this.opportunitiesRepo.findById(Number(driveId));
    if (!user || !drive || drive.status !== 'Published' || (drive.collegeId ?? 1) !== (user.collegeId ?? 1)) {
      throw new BadRequestException('Opportunity is not available to this candidate');
    }
    if (this.savedDrives.some(s => s.userId === userId && s.driveId === driveId)) {
      return { success: true, message: 'Drive already saved' };
    }
    this.savedDrives.push({ userId, driveId, savedAt: new Date().toISOString() });
    return { success: true, message: 'Drive saved' };
  }

  unsaveDrive(userId: number, driveId: string): { success: boolean; message: string } {
    const idx = this.savedDrives.findIndex(s => s.userId === userId && s.driveId === driveId);
    if (idx === -1) return { success: false, message: 'Drive not found in saved list' };
    this.savedDrives.splice(idx, 1);
    return { success: true, message: 'Drive removed from saved' };
  }

  /* ═══ Application Stages ════════════════════════════════════════════ */

  getApplicationStages(candidateId: number): ApplicationStage[] {
    return this.applicationsRepo.findByCandidate(candidateId).map((application) => ({
      appId: String(application.id),
      candidateId: application.candidateId,
      driveId: String(application.opportunityId),
      driveTitle: application.title,
      company: application.company,
      appliedAt: application.appliedDate,
      stages: application.timeline.map((stage) => ({
        name: stage.stage,
        status: stage.status === 'completed' ? 'passed' : stage.status === 'active' ? 'current' : 'pending',
        date: stage.date,
        note: stage.desc,
      })),
    }));
  }

  getAppStats(candidateId: number): object {
    const apps = this.applicationsRepo.findByCandidate(candidateId);
    const total = apps.length;
    const offers = apps.filter(a => ['Offer', 'Offered'].includes(a.status)).length;
    const active = apps.filter(a => ['Applied', 'Shortlisted', 'Interview'].includes(a.status)).length;
    const rejected = apps.filter(a => ['Rejected', 'Withdrawn'].includes(a.status)).length;
    return { total, active, offers, rejected };
  }

  /* ═══ Interview Schedules ═══════════════════════════════════════════ */

  getInterviewsForCandidate(candidateId: number): InterviewSchedule[] {
    return this.interviewSchedules.filter(i => i.candidateId === candidateId);
  }

  getInterviewsForRecruiter(recruiterId: number): InterviewSchedule[] {
    return this.interviewSchedules.filter(i => i.recruiterId === recruiterId);
  }

  scheduleInterview(data: Omit<InterviewSchedule, 'id' | 'status'>): InterviewSchedule {
    const interview: InterviewSchedule = { ...data, id: this.nextInterviewId++, status: 'scheduled' };
    this.interviewSchedules.push(interview);
    return interview;
  }

  /* ═══ Bulk Notifications ════════════════════════════════════════════ */

  getNotifications(collegeId: number): BulkNotification[] {
    return this.notifications.filter(n => n.collegeId === collegeId).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  sendBulkNotification(data: Omit<BulkNotification, 'id' | 'sentAt' | 'recipientCount'>, recipientCount: number): BulkNotification {
    const notif: BulkNotification = { ...data, id: this.nextNotifId++, sentAt: new Date().toISOString(), recipientCount };
    this.notifications.push(notif);
    return notif;
  }

  /* ═══ Mentorship Requests ═══════════════════════════════════════════ */

  getMentorshipRequestsForAlumni(alumniId: number): MentorshipRequest[] {
    return this.mentorshipRequests.filter(r => r.alumniId === alumniId);
  }

  getMentorshipRequestsByStudent(studentId: number): MentorshipRequest[] {
    return this.mentorshipRequests.filter(r => r.studentId === studentId);
  }

  getMentorshipForCollege(collegeId: number): MentorshipRequest[] {
    return this.mentorshipRequests.filter(r => r.collegeId === collegeId);
  }

  createMentorshipRequest(data: Omit<MentorshipRequest, 'id' | 'status' | 'createdAt'>): MentorshipRequest {
    const req: MentorshipRequest = { ...data, id: this.nextRequestId++, status: 'pending', createdAt: new Date().toISOString() };
    this.mentorshipRequests.push(req);
    return req;
  }

  respondMentorshipRequest(id: number, alumniId: number, status: 'accepted' | 'rejected'): MentorshipRequest | null {
    const req = this.mentorshipRequests.find(r => r.id === id && r.alumniId === alumniId);
    if (!req) return null;
    req.status = status;
    req.respondedAt = new Date().toISOString();
    return req;
  }

  /* ═══ College Events ════════════════════════════════════════════════ */

  getEvents(collegeId: number): CollegeEvent[] {
    return this.events.filter(e => e.collegeId === collegeId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  registerForEvent(eventId: number, userId: number): { success: boolean; message: string } {
    const event = this.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Event not found' };
    if (event.registrations.includes(userId)) return { success: false, message: 'Already registered' };
    event.registrations.push(userId);
    return { success: true, message: 'Registered successfully' };
  }

  /* ═══ Drive Reports ══════════════════════════════════════════════════ */

  getDriveReportsByRecruiter(recruiterId: number): DriveReport[] {
    return this.driveReports.filter(r => r.recruiterId === recruiterId);
  }

  getDriveReport(driveId: string, recruiterId: number): DriveReport | null {
    return this.driveReports.find(r => r.driveId === driveId && r.recruiterId === recruiterId) || null;
  }

  getCollegeDriveReports(collegeId: number): DriveReport[] {
    return this.driveReports.filter(r => r.collegeId === collegeId);
  }

  /* ═══ Placement Dashboard ═══════════════════════════════════════════ */

  getPlacementDashboard(collegeId: number): PlacementDashboardData | null {
    const students = this.usersRepo.findByRoleAndCollege('candidate', collegeId);
    const studentIds = new Set(students.map((u) => u.id));
    const applications = this.applicationsRepo.findByCollege(collegeId).filter((a) => studentIds.has(a.candidateId));
    const allOffers = applications.filter((a) => ['Offer', 'Offered'].includes(a.status));
    const offers = allOffers.filter((a) => /full/i.test(a.type));
    const opportunities = this.opportunitiesRepo.findAll().filter((o) => (o.collegeId ?? 1) === collegeId && o.status === 'Published');
    const placed = new Set([...students.filter((u) => u.status === 'placed').map((u) => u.id), ...allOffers.map((a) => a.candidateId)]);
    const packageOf = (id: number) => {
      const salary = this.opportunitiesRepo.findById(id)?.salary || '';
      const match = salary.match(/(\d+(?:\.\d+)?)\s*LPA/i);
      return match ? Number(match[1]) : 0;
    };
    const average = (values: number[]) => values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10 : 0;
    const packages = offers.map((a) => packageOf(a.opportunityId)).filter((p) => p > 0);
    const departments = [...new Set(students.map((u) => u.department || 'Other'))];
    const companies = [...new Set(offers.map((a) => a.company))];
    const months = Array.from({ length: 8 }, (_, i) => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() - 7 + i, 1);
    });
    const offeredDate = (app: typeof offers[number]) => {
      const stage = [...app.timeline].reverse().find((t) => ['Offer', 'Offered'].includes(t.stage));
      return new Date(stage?.date || app.appliedDate);
    };
    const firstOffer = new Map<number, Date>();
    for (const offer of offers) {
      const date = offeredDate(offer);
      if (!firstOffer.has(offer.candidateId) || date < firstOffer.get(offer.candidateId)!) firstOffer.set(offer.candidateId, date);
    }
    const sameMonth = (date: Date, month: Date) => date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    return {
      collegeId, totalStudents: students.length, totalPlaced: placed.size,
      placementRate: students.length ? Math.round(placed.size / students.length * 1000) / 10 : 0,
      avgPackage: average(packages), highestPackage: packages.length ? Math.max(...packages) : 0,
      totalApplications: applications.length,
      uniqueApplicants: new Set(applications.map((a) => a.candidateId)).size,
      totalOffers: allOffers.length,
      internshipApplications: applications.filter((a) => /intern/i.test(a.type)).length,
      internshipOpportunities: opportunities.filter((o) => /intern/i.test(o.type)).length,
      companiesVisited: new Set(opportunities.map((o) => o.company)).size,
      applicationTrend: {
        labels: months.map((month) => month.toLocaleString('en-US', { month: 'short' })),
        fullTime: months.map((month) => applications.filter((a) => /full/i.test(a.type) && sameMonth(new Date(a.appliedDate), month)).length),
        internships: months.map((month) => applications.filter((a) => /intern/i.test(a.type) && sameMonth(new Date(a.appliedDate), month)).length),
      },
      byDept: departments.map((dept) => {
        const members = students.filter((u) => (u.department || 'Other') === dept);
        const ids = new Set(members.map((u) => u.id));
        const totalPlaced = members.filter((u) => placed.has(u.id)).length;
        return { dept, total: members.length, placed: totalPlaced, rate: Math.round(totalPlaced / members.length * 100), avgPackage: average(offers.filter((a) => ids.has(a.candidateId)).map((a) => packageOf(a.opportunityId)).filter((p) => p > 0)) };
      }),
      topCompanies: companies.map((company) => {
        const records = offers.filter((a) => a.company === company);
        return { company, offers: records.length, avgPackage: average(records.map((a) => packageOf(a.opportunityId)).filter((p) => p > 0)) };
      }).sort((a, b) => b.offers - a.offers),
      monthlyTrend: months.map((month) => ({ month: month.toLocaleString('en-US', { month: 'short' }), placements: [...firstOffer.values()].filter((date) => sameMonth(date, month)).length })),
    };
  }

  /* ═══ Alumni Directory ══════════════════════════════════════════════ */

  getAlumniDirectory(collegeId: number): object[] {
    // Real alumni of the college, taken from the user store.
    return this.usersRepo
      .findByRoleAndCollege('alumni', collegeId)
      .filter((u) => u.status !== 'inactive')
      .map((u) => ({
        id: u.id,
        name: u.name,
        company: u.company ?? '',
        role: u.headline ?? 'Alumni',
        batch: String(u.batch ?? ''),
        dept: u.department ?? '',
        location: u.location ?? '',
        linkedin: u.socialLinks?.linkedin ?? '#',
      }));
  }

  filterAlumniDirectory(collegeId: number, company?: string, batch?: string, dept?: string): object[] {
    let dir = this.getAlumniDirectory(collegeId) as any[];
    if (company) dir = dir.filter((a: any) => a.company.toLowerCase().includes(company.toLowerCase()));
    if (batch)   dir = dir.filter((a: any) => a.batch === batch);
    if (dept)    dir = dir.filter((a: any) => a.dept === dept);
    return dir;
  }

  /* ═══ Candidate Filter (for recruiters/officers) ════════════════════ */

  getCandidatesFiltered(collegeId: number, dept?: string, minCgpa?: number, maxBacklogs?: number): object[] {
    // Real students of the college, taken from the user store.
    let filtered = this.usersRepo
      .findByRoleAndCollege('candidate', collegeId)
      .filter((u) => u.status !== 'inactive')
      .map((u) => ({
        id: u.id,
        name: u.name,
        dept: u.department ?? '',
        cgpa: u.cgpa ?? 0,
        backlogs: u.backlogs ?? 0,
        rollNo: u.rollNumber ?? '',
        batch: u.batchLabel ?? '',
        email: u.email,
        skills: (u.resumeData?.profileResumeData?.skills as string[] | undefined) ?? u.skills ?? [],
        status: u.status === 'placed' ? 'Placed' : 'Eligible',
      }));
    if (dept)        filtered = filtered.filter(s => s.dept === dept);
    if (minCgpa)     filtered = filtered.filter(s => s.cgpa >= minCgpa);
    if (maxBacklogs !== undefined) filtered = filtered.filter(s => s.backlogs <= maxBacklogs);
    return filtered;
  }

  /* ═══ Dept Report (for officers) ════════════════════════════════════ */

  getDeptReport(collegeId: number): object {
    const dash = this.getPlacementDashboard(collegeId);
    if (!dash) return { error: 'No data' };
    return {
      collegeId,
      departments: dash.byDept,
      totalPlaced: dash.totalPlaced,
      totalStudents: dash.totalStudents,
      overall: dash.placementRate,
    };
  }
}
