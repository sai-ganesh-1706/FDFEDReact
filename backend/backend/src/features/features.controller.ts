import {
  Controller, Get, Post, Delete, Patch, Param, Body, Query,
  Headers, HttpException, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FeaturesRepository } from './features.repository';
import { UsersRepository } from '../users/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { CollegesRepository } from '../colleges/colleges.repository';
import { ActivityService } from '../activity/activity.service';

/** Subscription plans no longer lock features: every college can use the whole toolset. */
function checkTier(college: any, _required: 'standard' | 'premium'): void {
  if (!college) throw new HttpException('College not found', HttpStatus.NOT_FOUND);
}

function getCollegeId(header: string): number {
  const id = header && header !== 'null' ? +header : null;
  if (!id) throw new HttpException('x-college-id header is required', HttpStatus.BAD_REQUEST);
  return id;
}

@ApiTags('Features')
@ApiSecurity('x-role')
@UseGuards(RolesGuard)
@Controller('features')
export class FeaturesController {
  constructor(
    private readonly featuresRepo: FeaturesRepository,
    private readonly collegesRepo: CollegesRepository,
    private readonly usersRepo: UsersRepository,
    private readonly notificationsService: NotificationsService,
    private readonly activity: ActivityService,
  ) {}

  /* ════════════════════════════════════════════════════════════════════
   *  CANDIDATE — STANDARD: Drive Search / Saved Drives / App Stats
   * ════════════════════════════════════════════════════════════════════ */

  @Get('candidate/drives/search')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] Advanced drive search with filters' })
  searchDrives(
    @Headers('x-college-id') cid: string,
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('sort') sort?: string,
    @Query('minPackage') minPackage?: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.searchDrives(collegeId, q, type, sort, minPackage ? +minPackage : undefined);
  }

  @Get('candidate/saved-drives')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] Get saved/bookmarked drives' })
  getSavedDrives(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getSavedDrives(+uid, collegeId);
  }

  @Get('candidate/saved-drive-ids')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] IDs of every drive/opportunity the candidate has bookmarked' })
  getSavedDriveIds(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.getSavedDriveIds(+uid);
  }

  @Post('candidate/drives/:driveId/save')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] Save/bookmark a drive' })
  saveDrive(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Param('driveId') driveId: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.saveDrive(+uid, driveId);
  }

  @Delete('candidate/drives/:driveId/save')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] Remove a saved drive' })
  unsaveDrive(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Param('driveId') driveId: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.unsaveDrive(+uid, driveId);
  }

  @Get('candidate/application-stats')
  @Roles('candidate')
  @ApiOperation({ summary: '[Standard] Get application statistics summary' })
  getAppStats(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.getAppStats(+uid);
  }

  /* ─── CANDIDATE — PREMIUM: Application Timeline & Interview Calendar ─── */

  @Get('candidate/applications/timeline')
  @Roles('candidate')
  @ApiOperation({ summary: '[Premium] Get detailed application stage timeline' })
  getApplicationTimeline(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    return this.featuresRepo.getApplicationStages(+uid);
  }

  @Get('candidate/interviews')
  @Roles('candidate')
  @ApiOperation({ summary: '[Premium] Get interview schedule calendar' })
  getCandidateInterviews(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    return this.featuresRepo.getInterviewsForCandidate(+uid);
  }

  /* ════════════════════════════════════════════════════════════════════
   *  RECRUITER — STANDARD: Candidate Filter, Bulk Shortlist, Scheduling
   * ════════════════════════════════════════════════════════════════════ */

  @Get('recruiter/candidates/filter')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Standard] Filter candidates by CGPA, dept, backlogs' })
  filterCandidates(
    @Headers('x-college-id') cid: string,
    @Query('dept') dept?: string,
    @Query('minCgpa') minCgpa?: string,
    @Query('maxBacklogs') maxBacklogs?: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getCandidatesFiltered(
      collegeId, dept,
      minCgpa ? +minCgpa : undefined,
      maxBacklogs !== undefined ? +maxBacklogs : undefined,
    );
  }

  @Post('recruiter/drives/bulk-shortlist')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Standard] Bulk shortlist/reject candidates' })
  bulkShortlist(
    @Headers('x-college-id') cid: string,
    @Body() body: { driveId: string; candidateIds: number[]; action: 'shortlist' | 'reject' },
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    if (!body.candidateIds?.length) throw new HttpException('No candidates selected', 400);
    // Simulate bulk action — return confirmation
    return {
      success: true,
      driveId: body.driveId,
      action: body.action,
      count: body.candidateIds.length,
      candidateIds: body.candidateIds,
      message: `${body.candidateIds.length} candidates ${body.action === 'shortlist' ? 'shortlisted' : 'rejected'} successfully`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('recruiter/interviews/schedule')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Standard] Schedule an interview' })
  scheduleInterview(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Body() body: any,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.scheduleInterview({
      ...body,
      recruiterId: +uid,
      collegeId,
    });
  }

  @Get('recruiter/interviews')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Standard] Get recruiter\'s scheduled interviews' })
  getRecruiterInterviews(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.getInterviewsForRecruiter(+uid);
  }

  /* ─── RECRUITER — PREMIUM: Drive Reports ────────────────────────────── */

  @Get('recruiter/reports')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Premium] Get hiring reports for all drives' })
  getHiringReports(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    return this.featuresRepo.getDriveReportsByRecruiter(+uid);
  }

  @Get('recruiter/reports/:driveId')
  @Roles('recruiter')
  @ApiOperation({ summary: '[Premium] Get detailed report for one drive' })
  getDriveReport(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Param('driveId') driveId: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    const report = this.featuresRepo.getDriveReport(driveId, +uid);
    if (!report) throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
    return report;
  }

  /* ════════════════════════════════════════════════════════════════════
   *  PLACEMENT OFFICER — STANDARD: Bulk Notifications, Filter, Dept Report
   * ════════════════════════════════════════════════════════════════════ */

  @Get('officer/notifications')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Standard] Get sent notifications for this college' })
  getNotifications(@Headers('x-college-id') cid: string) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getNotifications(collegeId);
  }

  @Post('officer/notifications/bulk')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Standard] Send a bulk notification' })
  sendBulkNotification(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Body() body: { title: string; message: string; targetGroup: string },
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    if (!body.title || !body.message) throw new HttpException('Title and message are required', 400);
    const inCollege = this.usersRepo.findByCollegeId(collegeId).filter((u) => u.status !== 'inactive');
    const group = (role: string) => inCollege.filter((u) => u.role === role);
    const target = body.targetGroup;
    const recipients =
      target === 'all' ? [...group('candidate'), ...group('alumni'), ...group('recruiter')]
      : target === 'students' ? group('candidate')
      : target === 'alumni' ? group('alumni')
      : target === 'recruiters' ? group('recruiter')
      : [];
    if (!recipients.length && !['students', 'alumni', 'recruiters', 'all'].includes(target)) {
      throw new HttpException('Unknown recipient group', 400);
    }
    // Every role has an in-app inbox (the bell), keyed by the recipient's user id.
    for (const recipient of recipients) {
      this.notificationsService.create(
        { type: 'general', title: body.title, message: body.message, href: '#', isRead: false },
        recipient.id,
      );
    }
    const sender = this.usersRepo.findById(+uid);
    this.activity.log({
      action: 'Bulk Notification Sent',
      detail: `"${body.title}" sent to ${recipients.length} ${target === 'all' ? 'people' : target}`,
      actor: sender?.name ?? 'Placement officer', actorRole: sender?.role, collegeId, type: 'notification',
    });
    return this.featuresRepo.sendBulkNotification(
      { collegeId, sentBy: +uid, title: body.title, message: body.message, targetGroup: body.targetGroup as any },
      recipients.length,
    );
  }

  @Get('officer/candidates/filter')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Standard] Filter candidates by dept/CGPA/backlogs' })
  officerFilterCandidates(
    @Headers('x-college-id') cid: string,
    @Query('dept') dept?: string,
    @Query('minCgpa') minCgpa?: string,
    @Query('maxBacklogs') maxBacklogs?: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getCandidatesFiltered(
      collegeId, dept,
      minCgpa ? +minCgpa : undefined,
      maxBacklogs !== undefined ? +maxBacklogs : undefined,
    );
  }

  @Get('officer/dept-report')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Standard] Get department-wise placement report' })
  getDeptReport(@Headers('x-college-id') cid: string) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getDeptReport(collegeId);
  }

  /* ─── PLACEMENT OFFICER — PREMIUM: Dashboard, Custom Report ─────────── */

  @Get('officer/placement-dashboard')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Premium] Get advanced placement dashboard' })
  getPlacementDashboard(@Headers('x-college-id') cid: string) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'premium');
    const data = this.featuresRepo.getPlacementDashboard(collegeId);
    if (!data) throw new HttpException('Dashboard data not found', HttpStatus.NOT_FOUND);
    return data;
  }

  @Get('officer/custom-report')
  @Roles('placement_officer', 'college_admin')
  @ApiOperation({ summary: '[Premium] Build custom placement report' })
  getCustomReport(
    @Headers('x-college-id') cid: string,
    @Query('dept') dept?: string,
    @Query('company') company?: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'premium');
    let reports = this.featuresRepo.getCollegeDriveReports(collegeId);
    if (company) reports = reports.filter(r => r.company.toLowerCase().includes(company.toLowerCase()));
    const dash = this.featuresRepo.getPlacementDashboard(collegeId);
    let deptStats = dash?.byDept || [];
    if (dept) deptStats = deptStats.filter(d => d.dept === dept);
    return { filters: { dept, company }, driveReports: reports, departmentStats: deptStats, generatedAt: new Date().toISOString() };
  }

  /* ════════════════════════════════════════════════════════════════════
   *  ALUMNI — STANDARD: Mentorship, Events
   * ════════════════════════════════════════════════════════════════════ */

  @Get('alumni/mentorship/received')
  @Roles('alumni')
  @ApiOperation({ summary: '[Standard] Get mentorship requests received by alumni' })
  getMentorshipReceived(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.getMentorshipRequestsForAlumni(+uid);
  }

  @Post('alumni/mentorship/request')
  @Roles('candidate', 'alumni')
  @ApiOperation({ summary: '[Standard] Request mentorship from an alumni' })
  requestMentorship(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Body() body: { alumniId: number; topic: string; message: string; studentName?: string },
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    if (!body.alumniId || !body.topic || !body.message) {
      throw new HttpException('alumniId, topic and message are required', 400);
    }
    return this.featuresRepo.createMentorshipRequest({
      studentId: +uid, studentName: body.studentName || 'Student',
      alumniId: body.alumniId, collegeId, message: body.message, topic: body.topic,
    });
  }

  @Patch('alumni/mentorship/:id/respond')
  @Roles('alumni')
  @ApiOperation({ summary: '[Standard] Accept or reject a mentorship request' })
  respondMentorship(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Param('id') id: string,
    @Body() body: { status: 'accepted' | 'rejected' },
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    const result = this.featuresRepo.respondMentorshipRequest(+id, +uid, body.status);
    if (!result) throw new HttpException('Request not found or not authorized', HttpStatus.NOT_FOUND);
    return result;
  }

  @Get('alumni/events')
  @Roles('alumni', 'candidate')
  @ApiOperation({ summary: '[Standard] List college events' })
  getEvents(@Headers('x-college-id') cid: string) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'standard');
    return this.featuresRepo.getEvents(collegeId);
  }

  @Post('alumni/events/:id/register')
  @Roles('alumni', 'candidate')
  @ApiOperation({ summary: '[Standard] Register for a college event' })
  registerEvent(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
    @Param('id') id: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'standard');
    return this.featuresRepo.registerForEvent(+id, +uid);
  }

  /* ─── ALUMNI — PREMIUM: Alumni Directory, Mentees, Engagement ───────── */

  @Get('alumni/directory')
  @Roles('alumni', 'candidate')
  @ApiOperation({ summary: '[Premium] Searchable alumni directory' })
  getAlumniDirectory(
    @Headers('x-college-id') cid: string,
    @Query('company') company?: string,
    @Query('batch') batch?: string,
    @Query('dept') dept?: string,
  ) {
    const collegeId = getCollegeId(cid);
    const college = this.collegesRepo.findById(collegeId);
    checkTier(college, 'premium');
    return this.featuresRepo.filterAlumniDirectory(collegeId, company, batch, dept);
  }

  @Get('alumni/mentees')
  @Roles('alumni')
  @ApiOperation({ summary: '[Premium] Get accepted mentees list' })
  getMentees(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    return this.featuresRepo.getMentorshipRequestsForAlumni(+uid).filter(r => r.status === 'accepted');
  }

  @Get('alumni/engagement-history')
  @Roles('alumni')
  @ApiOperation({ summary: '[Premium] Get engagement history' })
  getEngagementHistory(
    @Headers('x-user-id') uid: string,
    @Headers('x-college-id') cid: string,
  ) {
    const college = this.collegesRepo.findById(getCollegeId(cid));
    checkTier(college, 'premium');
    const requests = this.featuresRepo.getMentorshipRequestsForAlumni(+uid);
    return {
      alumniId: +uid,
      totalMentorshipRequests: requests.length,
      accepted: requests.filter(r => r.status === 'accepted').length,
      pending: requests.filter(r => r.status === 'pending').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      requests,
      generatedAt: new Date().toISOString(),
    };
  }
}
