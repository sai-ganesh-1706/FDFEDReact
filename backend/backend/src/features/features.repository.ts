import { Injectable } from '@nestjs/common';
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
  ) {}

  /* ── Drives catalogue (shared across all colleges, filtered by collegeId) ── */
  private drives: DriveSearchResult[] = [
    // Basic College drives (collegeId=7)
    { id:'d-701', title:'Software Engineer',      company:'TCS',          type:'fulltime',   package:7.5,  deadline:'2026-09-20', department:['CSE','IT'],          minCgpa:6.5, location:'Chennai',   collegeId:7 },
    { id:'d-702', title:'Data Analyst',           company:'Wipro',        type:'fulltime',   package:5.5,  deadline:'2026-09-25', department:['CSE','MECH','ECE'],  minCgpa:6.0, location:'Bangalore', collegeId:7 },
    { id:'d-703', title:'Web Developer Intern',   company:'Zoho',         type:'internship', package:20000,deadline:'2026-10-01', department:['CSE','IT'],          minCgpa:7.0, location:'Chennai',   collegeId:7 },
    { id:'d-704', title:'Mechanical Engineer',    company:'Bosch',        type:'fulltime',   package:6.0,  deadline:'2026-10-10', department:['MECH','EEE'],        minCgpa:6.5, location:'Pune',      collegeId:7 },
    { id:'d-705', title:'Business Analyst',       company:'Accenture',    type:'fulltime',   package:9.0,  deadline:'2026-10-15', department:['CSE','MECH','MBA'],  minCgpa:7.5, location:'Hyderabad', collegeId:7 },
    // Standard College drives (collegeId=8)
    { id:'d-801', title:'Full Stack Developer',   company:'Infosys',      type:'fulltime',   package:10.0, deadline:'2026-09-22', department:['CSE','IT'],          minCgpa:7.0, location:'Bangalore', collegeId:8 },
    { id:'d-802', title:'Cloud Engineer',         company:'Capgemini',    type:'fulltime',   package:8.5,  deadline:'2026-09-28', department:['CSE','ECE'],         minCgpa:6.5, location:'Mumbai',    collegeId:8 },
    { id:'d-803', title:'Product Intern',         company:'Flipkart',     type:'internship', package:35000,deadline:'2026-10-05', department:['CSE','MBA'],         minCgpa:7.5, location:'Bangalore', collegeId:8 },
    { id:'d-804', title:'Embedded Systems Eng.',  company:'Qualcomm',     type:'fulltime',   package:14.0, deadline:'2026-10-12', department:['ECE','EEE'],         minCgpa:7.0, location:'Hyderabad', collegeId:8 },
    { id:'d-805', title:'DevOps Engineer',        company:'HCL',          type:'fulltime',   package:9.5,  deadline:'2026-10-18', department:['CSE','IT'],          minCgpa:6.5, location:'Noida',     collegeId:8 },
    // Premium College drives (collegeId=9)
    { id:'d-901', title:'SDE-1',                  company:'Microsoft',    type:'fulltime',   package:45.0, deadline:'2026-09-15', department:['CSE'],               minCgpa:8.0, location:'Hyderabad', collegeId:9 },
    { id:'d-902', title:'Software Engineer',      company:'Google',       type:'fulltime',   package:50.0, deadline:'2026-09-20', department:['CSE','IT'],          minCgpa:8.5, location:'Bangalore', collegeId:9 },
    { id:'d-903', title:'SDE Intern',             company:'Amazon',       type:'internship', package:80000,deadline:'2026-09-30', department:['CSE'],               minCgpa:7.5, location:'Hyderabad', collegeId:9 },
    { id:'d-904', title:'Data Scientist',         company:'Meta',         type:'fulltime',   package:60.0, deadline:'2026-10-08', department:['CSE','MECH'],        minCgpa:8.0, location:'Bangalore', collegeId:9 },
    { id:'d-905', title:'Frontend Engineer',      company:'Razorpay',     type:'fulltime',   package:22.0, deadline:'2026-10-14', department:['CSE','IT'],          minCgpa:7.5, location:'Bangalore', collegeId:9 },
    // IIIT Sri City (collegeId=1)
    { id:'d-101', title:'SDE Intern',             company:'Goldman Sachs',type:'internship', package:60000,deadline:'2026-09-18', department:['CSE'],               minCgpa:8.0, location:'Bangalore', collegeId:1 },
    { id:'d-102', title:'Software Engineer',      company:'Adobe',        type:'fulltime',   package:28.0, deadline:'2026-09-25', department:['CSE','IT'],          minCgpa:7.5, location:'Noida',     collegeId:1 },
  ];

  /* ── Saved drives ────────────────────────────────────────────────── */
  private savedDrives: SavedDrive[] = [
    { userId: 100, driveId: 'd-101', savedAt: '2026-09-05T09:00:00Z' },
    { userId: 100, driveId: 'd-102', savedAt: '2026-09-06T10:30:00Z' },
    { userId: 211, driveId: 'd-702', savedAt: '2026-09-01T10:00:00Z' },
  ];

  /* ── Application stages ──────────────────────────────────────────── */
  private applicationStages: ApplicationStage[] = [
    {
      appId: 'app-7001', candidateId: 212, driveId: 'd-703',
      driveTitle: 'Web Developer Intern', company: 'Zoho', appliedAt: '2026-08-20T09:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-20', note: 'Application submitted successfully' },
        { name: 'Resume Screening',    status: 'passed',  date: '2026-08-22', note: 'Resume shortlisted' },
        { name: 'Online Assessment',   status: 'current', date: '2026-08-28', note: 'Assessment scheduled' },
        { name: 'Technical Interview', status: 'pending' },
        { name: 'HR Interview',        status: 'pending' },
        { name: 'Offer',               status: 'pending' },
      ],
    },
    {
      appId: 'app-7002', candidateId: 212, driveId: 'd-701',
      driveTitle: 'Software Engineer', company: 'TCS', appliedAt: '2026-08-25T11:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-25', note: 'Application received' },
        { name: 'Resume Screening',    status: 'failed',  date: '2026-08-27', note: 'CGPA requirement not met' },
        { name: 'Online Assessment',   status: 'pending' },
        { name: 'Technical Interview', status: 'pending' },
        { name: 'Offer',               status: 'pending' },
      ],
    },
    // Standard college candidate (222 = student@standardcollege.in)
    {
      appId: 'app-8001', candidateId: 222, driveId: 'd-801',
      driveTitle: 'Full Stack Developer', company: 'Infosys', appliedAt: '2026-08-18T10:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-18' },
        { name: 'Resume Screening',    status: 'passed',  date: '2026-08-20', note: 'Shortlisted' },
        { name: 'Online Assessment',   status: 'passed',  date: '2026-08-25', note: 'Score: 87/100' },
        { name: 'Technical Interview', status: 'current', date: '2026-09-05', note: 'Scheduled - Round 1' },
        { name: 'HR Interview',        status: 'pending' },
        { name: 'Offer',               status: 'pending' },
      ],
    },
    {
      appId: 'app-8002', candidateId: 222, driveId: 'd-802',
      driveTitle: 'Cloud Engineer', company: 'Capgemini', appliedAt: '2026-08-22T14:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-22' },
        { name: 'Resume Screening',    status: 'passed',  date: '2026-08-24' },
        { name: 'Online Assessment',   status: 'passed',  date: '2026-08-29', note: 'Score: 92/100' },
        { name: 'Technical Interview', status: 'passed',  date: '2026-09-03', note: 'Cleared Round 1' },
        { name: 'HR Interview',        status: 'current', date: '2026-09-08', note: 'Scheduled' },
        { name: 'Offer',               status: 'pending' },
      ],
    },
    // Premium college candidate (232 = student@premiumcollege.in)
    {
      appId: 'app-9001', candidateId: 232, driveId: 'd-901',
      driveTitle: 'SDE-1', company: 'Microsoft', appliedAt: '2026-08-10T09:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-10' },
        { name: 'Resume Screening',    status: 'passed',  date: '2026-08-12', note: 'Shortlisted by recruiter' },
        { name: 'Online Assessment',   status: 'passed',  date: '2026-08-16', note: 'Score: 95/100' },
        { name: 'Technical Round 1',   status: 'passed',  date: '2026-08-20', note: 'DSA round cleared' },
        { name: 'Technical Round 2',   status: 'passed',  date: '2026-08-25', note: 'System design round cleared' },
        { name: 'HR Interview',        status: 'current', date: '2026-09-02', note: 'Final HR round' },
        { name: 'Offer',               status: 'pending' },
      ],
    },
    {
      appId: 'app-9002', candidateId: 232, driveId: 'd-902',
      driveTitle: 'Software Engineer', company: 'Google', appliedAt: '2026-08-12T10:00:00Z',
      stages: [
        { name: 'Applied',             status: 'passed',  date: '2026-08-12' },
        { name: 'Resume Screening',    status: 'passed',  date: '2026-08-14' },
        { name: 'Online Assessment',   status: 'passed',  date: '2026-08-18', note: 'Competitive coding round' },
        { name: 'Phone Screen',        status: 'passed',  date: '2026-08-22', note: 'Initial interview cleared' },
        { name: 'Onsite Round 1',      status: 'passed',  date: '2026-08-26', note: 'Algorithms' },
        { name: 'Onsite Round 2',      status: 'passed',  date: '2026-08-27', note: 'System Design' },
        { name: 'Offer',               status: 'current', date: '2026-09-01', note: '🎉 Offer extended!' },
      ],
    },
  ];

  /* ── Interview schedules ─────────────────────────────────────────── */
  private interviewSchedules: InterviewSchedule[] = [
    // IIIT Sri City — Shameer Basha Shaik (candidateId:100, r@gmail.com is recruiter Priya Kapoor id=102)
    { id:6, driveId:'opp-1', driveTitle:'Software Engineer', company:'TechCorp Solutions', candidateId:100, recruiterId:102, collegeId:1, date:'2026-10-28', time:'10:00', mode:'online',  meetLink:'https://meet.google.com/tcorp-interview', status:'scheduled', round:'Technical Round 1' },
    { id:7, driveId:'opp-5', driveTitle:'Backend Engineer Intern', company:'CloudBase Inc', candidateId:100, recruiterId:102, collegeId:1, date:'2026-10-30', time:'14:00', mode:'online',  meetLink:'https://teams.microsoft.com/l/cloudbase-offer', status:'scheduled', round:'Offer Discussion' },
    // Basic college
    { id:1, driveId:'d-703', driveTitle:'Web Developer Intern', company:'Zoho',         candidateId:212, recruiterId:213, collegeId:7, date:'2026-09-10', time:'10:00', mode:'online',  meetLink:'https://meet.google.com/abc-xyz', status:'scheduled', round:'Technical Round 1' },
    // Standard college
    { id:2, driveId:'d-801', driveTitle:'Full Stack Developer', company:'Infosys',      candidateId:222, recruiterId:223, collegeId:8, date:'2026-09-05', time:'11:00', mode:'online',  meetLink:'https://teams.microsoft.com/l/meetup/xyz', status:'scheduled', round:'Technical Round 1' },
    { id:3, driveId:'d-802', driveTitle:'Cloud Engineer',       company:'Capgemini',    candidateId:222, recruiterId:223, collegeId:8, date:'2026-09-08', time:'14:00', mode:'offline', location:'Capgemini Hyderabad Office, Floor 3', status:'scheduled', round:'HR Interview' },
    // Premium college
    { id:4, driveId:'d-901', driveTitle:'SDE-1',                company:'Microsoft',    candidateId:232, recruiterId:233, collegeId:9, date:'2026-09-02', time:'09:30', mode:'online',  meetLink:'https://teams.microsoft.com/l/meetup/ms-hr', status:'scheduled', round:'HR Interview' },
    { id:5, driveId:'d-902', driveTitle:'Software Engineer',    company:'Google',       candidateId:232, recruiterId:233, collegeId:9, date:'2026-09-01', time:'15:00', mode:'online',  meetLink:'https://meet.google.com/google-hr', status:'completed', round:'Offer Discussion' },
  ];

  /* ── Bulk notifications ──────────────────────────────────────────── */
  private notifications: BulkNotification[] = [
    { id:1, collegeId:8, sentBy:221, title:'TCS Walk-in Drive Tomorrow', message:'TCS is conducting a walk-in drive on campus tomorrow at 9 AM. All CSE and IT students with CGPA ≥ 7.0 are eligible. Bring 3 copies of your resume and government ID.', targetGroup:'students', sentAt:'2026-08-28T08:00:00Z', recipientCount:342 },
    { id:2, collegeId:8, sentBy:221, title:'Placement Training Workshop', message:'A placement training workshop on "DSA for Interviews" will be conducted by our alumni this Saturday 10 AM to 4 PM in Seminar Hall A. Register by Thursday.', targetGroup:'students', sentAt:'2026-08-25T10:00:00Z', recipientCount:342 },
    { id:3, collegeId:9, sentBy:231, title:'Google On-Campus Drive Shortlist', message:'Shortlisted candidates for Google SDE on-campus drive: Please check your email for interview slots. HR round scheduled for September 1-5.', targetGroup:'students', sentAt:'2026-08-30T09:00:00Z', recipientCount:89 },
    { id:4, collegeId:9, sentBy:231, title:'Alumni Networking Event - Sep 10', message:'We are hosting a networking event on September 10th at 6 PM in the auditorium. All alumni are invited to connect with current students.', targetGroup:'alumni', sentAt:'2026-08-28T11:00:00Z', recipientCount:156 },
  ];

  /* ── Mentorship requests ─────────────────────────────────────────── */
  private mentorshipRequests: MentorshipRequest[] = [
    { id:1, studentId:222, studentName:'Student Standard', alumniId:224, collegeId:8, status:'accepted', message:'I am interested in backend engineering and would love your guidance.', topic:'Backend Development Career Path', createdAt:'2026-08-15T10:00:00Z', respondedAt:'2026-08-16T14:00:00Z' },
    { id:2, studentId:222, studentName:'Student Standard', alumniId:224, collegeId:8, status:'pending',  message:'I am preparing for technical architecture roles. Could you guide me?', topic:'Architecture Preparation', createdAt:'2026-08-28T11:00:00Z' },
    { id:3, studentId:232, studentName:'Student Premium',  alumniId:234, collegeId:9, status:'accepted', message:'I want to crack Tier-1 tech interviews. Need guidance on system design.', topic:'System Design Mentorship', createdAt:'2026-08-10T09:00:00Z', respondedAt:'2026-08-11T10:00:00Z' },
    { id:4, studentId:232, studentName:'Student Premium',  alumniId:234, collegeId:9, status:'pending',  message:'Interested in distributed systems engineering track.', topic:'Distributed Systems Track', createdAt:'2026-08-29T15:00:00Z' },
    { id:5, studentId:212, studentName:'Student Basic',    alumniId:214, collegeId:7, status:'pending',   message:'Could you help me with career planning?', topic:'Career Planning', createdAt:'2026-08-20T12:00:00Z' },
  ];

  /* ── College Events ──────────────────────────────────────────────── */
  private events: CollegeEvent[] = [
    { id:1, collegeId:8, title:'Infosys Placement Drive', date:'2026-09-15', time:'09:00', type:'networking', description:'Infosys on-campus placement drive. Eligible: CSE, IT, MECH with CGPA ≥ 7.0', host:'Placement Cell', registrations:[222] },
    { id:2, collegeId:8, title:'Alumni Networking Meetup', date:'2026-09-20', time:'18:00', type:'networking', description:'Connect with alumni working in top MNCs. Great opportunity for referrals and mentorship.', host:'Alumni Association', registrations:[224] },
    { id:3, collegeId:8, title:'DSA for Interviews Workshop', date:'2026-09-27', time:'10:00', type:'workshop', description:'Full-day intensive workshop on Data Structures & Algorithms for placement interviews. Led by senior engineers.', host:'Placement Cell + Alumni', registrations:[222] },
    { id:8, collegeId:1, title:'Pre-Placement Talk', date:'2026-11-05', time:'10:00', type:'networking', description:'Hear from visiting recruiters about the upcoming campus hiring season.', host:'Placement Cell', registrations:[] },
    { id:9, collegeId:1, title:'Resume & Interview Workshop', date:'2026-11-12', time:'14:00', type:'workshop', description:'Hands-on resume review and mock interviews led by alumni mentors.', host:'Alumni Association', registrations:[] },
    { id:10, collegeId:1, title:'Alumni Networking Meetup', date:'2026-11-20', time:'18:00', type:'networking', description:'Meet alumni working at leading companies and learn about referral opportunities.', host:'Alumni Association', registrations:[] },
    { id:4, collegeId:9, title:'Google On-Campus Drive', date:'2026-09-02', time:'09:00', type:'networking', description:'Google SDE & SDE-2 campus recruitment. Shortlisted candidates will be notified via email.', host:'Placement Cell', registrations:[232, 234] },
    { id:5, collegeId:9, title:'Technical Interview Bootcamp', date:'2026-09-12', time:'10:00', type:'workshop', description:'3-day intensive bootcamp covering DSA, System Design, and Behavioral interviews. Conducted by senior alumni.', host:'Premium Alumni Network', registrations:[232] },
    { id:6, collegeId:9, title:'Annual Alumni Reunion 2026', date:'2026-10-05', time:'17:00', type:'reunion', description:'Annual gathering of all alumni batches. Networking dinner, awards, and cultural events.', host:'Alumni Association', registrations:[234] },
    { id:7, collegeId:9, title:'Industry Leaders Webinar', date:'2026-09-18', time:'19:00', type:'webinar', description:'Live webinar with CTOs and Engineering Managers from top tech companies. Q&A session included.', host:'Career Development Cell', registrations:[] },
  ];

  /* ── Drive Reports (per drive) ──────────────────────────────────── */
  private driveReports: DriveReport[] = [
    { driveId:'d-701', driveTitle:'Software Engineer',    company:'TCS',          collegeId:7, recruiterId:213, applied:120, shortlisted:45, interviewed:30, offered:15, accepted:12, createdAt:'2026-08-01T00:00:00Z' },
    { driveId:'d-702', driveTitle:'Data Analyst',         company:'Wipro',        collegeId:7, recruiterId:213, applied:95,  shortlisted:30, interviewed:18, offered:10, accepted:8,  createdAt:'2026-08-05T00:00:00Z' },
    { driveId:'d-703', driveTitle:'Web Developer Intern', company:'Zoho',         collegeId:7, recruiterId:213, applied:80,  shortlisted:20, interviewed:12, offered:6,  accepted:6,  createdAt:'2026-08-10T00:00:00Z' },
    { driveId:'d-801', driveTitle:'Full Stack Developer', company:'Infosys',      collegeId:8, recruiterId:223, applied:180, shortlisted:72, interviewed:48, offered:24, accepted:20, createdAt:'2026-08-05T00:00:00Z' },
    { driveId:'d-802', driveTitle:'Cloud Engineer',       company:'Capgemini',    collegeId:8, recruiterId:223, applied:150, shortlisted:60, interviewed:40, offered:18, accepted:16, createdAt:'2026-08-08T00:00:00Z' },
    { driveId:'d-803', driveTitle:'Product Intern',       company:'Flipkart',     collegeId:8, recruiterId:223, applied:200, shortlisted:50, interviewed:30, offered:10, accepted:9,  createdAt:'2026-08-12T00:00:00Z' },
    { driveId:'d-901', driveTitle:'SDE-1',                company:'Microsoft',    collegeId:9, recruiterId:233, applied:250, shortlisted:40, interviewed:20, offered:8,  accepted:7,  createdAt:'2026-07-20T00:00:00Z' },
    { driveId:'d-902', driveTitle:'Software Engineer',    company:'Google',       collegeId:9, recruiterId:233, applied:300, shortlisted:35, interviewed:15, offered:5,  accepted:5,  createdAt:'2026-07-25T00:00:00Z' },
    { driveId:'d-904', driveTitle:'Data Scientist',       company:'Meta',         collegeId:9, recruiterId:233, applied:180, shortlisted:28, interviewed:14, offered:4,  accepted:4,  createdAt:'2026-08-02T00:00:00Z' },
  ];

  /* ── Placement dashboard data (per college) ──────────────────────── */
  private placementDashboards: PlacementDashboardData[] = [
    {
      collegeId: 7, totalStudents: 450, totalPlaced: 198, placementRate: 44,
      avgPackage: 6.8, highestPackage: 12.0,
      byDept: [
        { dept:'CSE',  total:120, placed:72,  rate:60, avgPackage:7.5 },
        { dept:'IT',   total:80,  placed:48,  rate:60, avgPackage:7.0 },
        { dept:'ECE',  total:90,  placed:36,  rate:40, avgPackage:6.5 },
        { dept:'MECH', total:100, placed:30,  rate:30, avgPackage:6.0 },
        { dept:'EEE',  total:60,  placed:12,  rate:20, avgPackage:5.5 },
      ],
      topCompanies: [
        { company:'TCS',      offers:45, avgPackage:7.0 },
        { company:'Wipro',    offers:38, avgPackage:6.5 },
        { company:'Accenture',offers:30, avgPackage:8.5 },
        { company:'Infosys',  offers:25, avgPackage:7.5 },
        { company:'HCL',      offers:20, avgPackage:6.0 },
      ],
      monthlyTrend: [
        { month:'Mar', placements:20 }, { month:'Apr', placements:35 },
        { month:'May', placements:45 }, { month:'Jun', placements:50 },
        { month:'Jul', placements:28 }, { month:'Aug', placements:20 },
      ],
    },
    {
      collegeId: 8, totalStudents: 680, totalPlaced: 408, placementRate: 60,
      avgPackage: 10.2, highestPackage: 22.0,
      byDept: [
        { dept:'CSE',  total:180, placed:144, rate:80, avgPackage:11.5 },
        { dept:'IT',   total:120, placed:90,  rate:75, avgPackage:10.0 },
        { dept:'ECE',  total:140, placed:84,  rate:60, avgPackage:9.5  },
        { dept:'MECH', total:140, placed:63,  rate:45, avgPackage:8.5  },
        { dept:'MBA',  total:100, placed:27,  rate:27, avgPackage:10.5 },
      ],
      topCompanies: [
        { company:'Infosys',  offers:72, avgPackage:10.0 },
        { company:'Capgemini',offers:58, avgPackage:9.5  },
        { company:'Qualcomm', offers:30, avgPackage:14.0 },
        { company:'HCL',      offers:42, avgPackage:9.0  },
        { company:'Flipkart', offers:20, avgPackage:14.0 },
      ],
      monthlyTrend: [
        { month:'Mar', placements:45 }, { month:'Apr', placements:72 },
        { month:'May', placements:90 }, { month:'Jun', placements:80 },
        { month:'Jul', placements:68 }, { month:'Aug', placements:53 },
      ],
    },
    {
      collegeId: 9, totalStudents: 520, totalPlaced: 442, placementRate: 85,
      avgPackage: 32.5, highestPackage: 60.0,
      byDept: [
        { dept:'CSE',  total:200, placed:190, rate:95, avgPackage:38.0 },
        { dept:'IT',   total:120, placed:108, rate:90, avgPackage:30.0 },
        { dept:'ECE',  total:100, placed:80,  rate:80, avgPackage:25.0 },
        { dept:'MECH', total:60,  placed:42,  rate:70, avgPackage:20.0 },
        { dept:'MBA',  total:40,  placed:22,  rate:55, avgPackage:22.0 },
      ],
      topCompanies: [
        { company:'Google',    offers:25, avgPackage:50.0 },
        { company:'Microsoft', offers:32, avgPackage:45.0 },
        { company:'Meta',      offers:18, avgPackage:55.0 },
        { company:'Amazon',    offers:40, avgPackage:35.0 },
        { company:'Razorpay',  offers:38, avgPackage:22.0 },
      ],
      monthlyTrend: [
        { month:'Mar', placements:60 }, { month:'Apr', placements:90 },
        { month:'May', placements:110 }, { month:'Jun', placements:95 },
        { month:'Jul', placements:50  }, { month:'Aug', placements:37 },
      ],
    },
  ];

  private nextNotifId = 5;
  private nextRequestId = 6;
  private nextInterviewId = 8;

  /* ═══ Drives / Search Methods ══════════════════════════════════════ */

  getDrivesByCollege(collegeId: number): DriveSearchResult[] {
    return this.drives.filter(d => d.collegeId === collegeId);
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
    return saved.map(s => this.drives.find(d => d.id === s.driveId && d.collegeId === collegeId)).filter(Boolean) as DriveSearchResult[];
  }

  getSavedDriveIds(userId: number): string[] {
    return this.savedDrives.filter(s => s.userId === userId).map(s => s.driveId);
  }

  saveDrive(userId: number, driveId: string): { success: boolean; message: string } {
    if (this.savedDrives.some(s => s.userId === userId && s.driveId === driveId)) {
      return { success: false, message: 'Drive already saved' };
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
    return this.applicationStages.filter(a => a.candidateId === candidateId);
  }

  getAppStats(candidateId: number): object {
    const apps = this.applicationStages.filter(a => a.candidateId === candidateId);
    const total = apps.length;
    const offers = apps.filter(a => a.stages.find(s => s.name === 'Offer' && s.status === 'current' || s.status === 'passed')).length;
    const active = apps.filter(a => a.stages.some(s => s.status === 'current')).length;
    const rejected = apps.filter(a => a.stages.some(s => s.status === 'failed')).length;
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
    const placed = new Set([...students.filter((u) => u.status === 'placed').map((u) => u.id), ...offers.map((a) => a.candidateId)]);
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
