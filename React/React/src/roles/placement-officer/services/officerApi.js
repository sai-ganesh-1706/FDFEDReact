import { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api.js';
import { MOCK } from '../data/mockdata';

// Everything the placement officer screens show comes from the API. The screens
// still read the shapes they always did (MOCK.stats, MOCK.submissions, ...), so
// this module fills that object from the backend and clears the sample values.

const BRANCH_COLORS = [
  { color: '#00c950', colorClass: 'green' },
  { color: '#10b981', colorClass: 'teal' },
  { color: '#f0b100', colorClass: 'orange' },
  { color: '#ef4444', colorClass: 'red' },
  { color: '#f59e0b', colorClass: 'amber' },
  { color: '#6366f1', colorClass: 'indigo' },
];
const AVATAR_COLORS = ['#7C3AED', '#4f46e5', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];

const EMPTY = () => ({
  stats: {
    totalCandidates: 0, placementRate: 0, highestPkg: 0, companiesVisited: 0, totalApps: 0,
    avgPkg: 0, studentsPlaced: 0, offersMade: 0, internships: 0, pending: 0, published: 0, totalOpps: 0, totalApplicants: 0,
  },
  stakeholders: { candidates: 0, recruiters: 0, activeDrives: 0, alumni: 0 },
  branches: [],
  topCompanies: [],
  monthlyTrend: [],
  trend: { labels: [], fullTime: [], internships: [] },
  submissions: [],
  drives: [],
  interviews: [],
  recruiters: [],
  announcements: [],
  users: [],
  applications: [],
  notifications: [],
});

function resetMock() {
  Object.assign(MOCK, EMPTY());
}
resetMock();

const hash = (text = '') => [...text].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

export const OFFER_STATUSES = ['Offer', 'Offered'];

export function toSubmission(o, applicantCount) {
  return {
    id: o.id,
    title: o.title,
    company: o.company,
    status: o.status === 'Published' ? 'published' : o.status,
    avatar: (o.company || '?')[0].toUpperCase(),
    avatarBg: AVATAR_COLORS[hash(o.company) % AVATAR_COLORS.length],
    type: o.type === 'Internship' ? 'internship' : 'placement',
    location: o.location,
    pkg: o.salary,
    openings: o.openings,
    duration: o.duration || '',
    submitter: o.submittedBy || 'Recruiter',
    submitted: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    deadline: o.deadline,
    desc: o.description || '',
    cgpa: o.cgpa,
    branches: (o.branches || []).join(', '),
    backlogs: o.backlogs || 'Not specified',
    skills: o.tags || [],
    rounds: o.rounds || '',
    applied: applicantCount,
    rejectionRemark: o.rejectionRemark,
    createdAt: o.createdAt || '',
  };
}

// Reverse of the edit form: the screen edits strings, the API wants typed fields.
export function fromSubmissionEdit(form) {
  return {
    title: form.title,
    company: form.company,
    type: form.type === 'internship' ? 'Internship' : 'Full-Time',
    salary: form.pkg,
    location: form.location,
    cgpa: form.cgpa !== '' ? Number(form.cgpa) : undefined,
    branches: form.branches ? form.branches.split(',').map((b) => b.trim()).filter(Boolean) : undefined,
    backlogs: form.backlogs,
    deadline: form.deadline,
    description: form.desc,
  };
}

export function toTrackedApplication(a) {
  let status = a.status;
  if (OFFER_STATUSES.includes(status)) status = 'Selected';
  else if (status === 'Shortlisted') status = 'Shortlisted';
  else if (status === 'Interview') status = 'Interview Scheduled';
  else if (status === 'Withdrawn') status = 'Rejected';
  return {
    id: a.id,
    candidateId: a.candidateId,
    candidate: a.candidateName,
    role: a.title,
    company: a.company,
    date: a.appliedDate,
    status,
    branch: a.branch || '',
    email: a.email || '',
    cgpa: a.cgpa,
    interviewDate: a.interviewDate || '',
    remarks: a.remarks || '',
  };
}

export const fromTrackedStatus = (status) => ({
  'Under Review': 'Shortlisted',
  'Interview Scheduled': 'Interview',
  Selected: 'Offered',
}[status] || status);

export function toOversightUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    roll: u.rollNumber || '',
    branch: u.department || '',
    cgpa: u.cgpa ?? 0,
    backlogs: u.backlogs ?? 0,
    status: u.status || 'active',
    company: u.company || '',
    batch: u.batch || '',
    referrals: u.referrals ?? 0,
    recCompany: u.company || '',
    recDesignation: u.headline || '',
    recPhone: u.phone || '',
    recLocation: u.location || '',
  };
}

export function fromOversightUser(u) {
  const base = { name: u.name, email: u.email, status: u.status };
  if (u.role === 'candidate') {
    return {
      ...base,
      rollNumber: u.roll,
      department: u.branch,
      cgpa: Number.isFinite(Number(u.cgpa)) ? Number(u.cgpa) : 0,
      backlogs: Number.isInteger(Number(u.backlogs)) ? Number(u.backlogs) : 0,
    };
  }
  if (u.role === 'alumni') {
    return {
      ...base,
      company: u.company,
      batch: u.batch,
      referrals: Number.isInteger(Number(u.referrals)) ? Number(u.referrals) : 0,
    };
  }
  return { ...base, company: u.recCompany, headline: u.recDesignation, phone: u.recPhone, location: u.recLocation };
}

function build({ opps, apps, users, recruiters, placement, assessments = [], announcements = [], inbox = [] }) {
  const students = users.filter((u) => u.role === 'candidate');
  const alumni = users.filter((u) => u.role === 'alumni');
  const reviewable = opps.filter((o) => !o.isDemo && ['pending', 'approved', 'rejected', 'published'].includes(normaliseOpportunityStatus(o.status)));
  const published = reviewable.filter((o) => normaliseOpportunityStatus(o.status) === 'published');
  const countFor = (id) => apps.filter((a) => a.opportunityId === id).length;

  const pendingOpps = reviewable.filter((o) => normaliseOpportunityStatus(o.status) === 'pending');
  const pendingRecruiters = recruiters.filter((r) => r.status === 'pending');
  const notifications = [
    ...pendingOpps.map((o, i) => ({
      id: `opp-${o.id}`, type: 'warning', title: 'Opportunity Pending Review',
      message: `${o.title} by ${o.company} is awaiting your review.`, time: 'Pending', href: 'p2.html', read: false, order: i,
    })),
    ...pendingRecruiters.map((r) => ({
      id: `rec-${r.id}`, type: 'recruiter', title: 'Recruiter Pending Verification',
      message: `${r.name} from ${r.company} is awaiting approval.`, time: 'Pending', href: 'p4.html', read: false,
    })),
    // Real messages delivered to this officer (college announcements, platform notices)
    ...inbox.map((n) => ({
      id: `inbox-${n.id}`, type: 'info', title: n.title, message: n.message,
      time: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '',
      href: '#', read: !!n.isRead, order: 100,
    })),
  ];

  const oppById = new Map(opps.map((o) => [o.id, o]));

  return {
    topCompanies: placement.topCompanies,
    monthlyTrend: placement.monthlyTrend,
    stats: {
      totalCandidates: placement.totalStudents,
      placementRate: placement.placementRate,
      highestPkg: placement.highestPackage,
      companiesVisited: placement.companiesVisited,
      totalApps: placement.totalApplications,
      avgPkg: placement.avgPackage,
      studentsPlaced: placement.totalPlaced,
      offersMade: placement.totalOffers,
      internships: placement.internshipApplications,
      pending: pendingOpps.length,
      published: published.length,
      totalOpps: reviewable.length,
      totalApplicants: placement.uniqueApplicants,
    },
    stakeholders: {
      candidates: students.length,
      recruiters: recruiters.length,
      activeDrives: published.length,
      alumni: alumni.length,
    },
    branches: placement.byDept.map((b, i) => ({ name: b.dept, total: b.total, placed: b.placed, ...BRANCH_COLORS[i % BRANCH_COLORS.length] })),
    trend: placement.applicationTrend,
    submissions: reviewable
      .slice()
      .sort((a, b) => {
        const priority = { pending: 0, approved: 1, published: 2, rejected: 3 };
        const statusOrder = priority[normaliseOpportunityStatus(a.status)] - priority[normaliseOpportunityStatus(b.status)];
        return statusOrder || (Date.parse(b.createdAt || '') || 0) - (Date.parse(a.createdAt || '') || 0) || b.id - a.id;
      })
      .map((o) => ({ ...toSubmission(o, countFor(o.id)), status: normaliseOpportunityStatus(o.status) })),
    drives: published
      .slice()
      .sort((a, b) => Date.parse(b.createdAt || '') - Date.parse(a.createdAt || '') || b.id - a.id)
      .slice(0, 5)
      .map((o) => {
        const applicants = countFor(o.id);
        return {
          company: o.company,
          role: o.title,
          badge: applicants ? `${applicants} applicant${applicants === 1 ? '' : 's'}` : 'Open for applications',
          badgeClass: applicants ? 'blue' : 'green',
        };
      }),
    // A recruiter can schedule an interview for one applicant or everyone on
    // an opportunity. Drive-wide schedules do not change every application's
    // status, so the dashboard must use the assessment/interview records—not
    // application status—as its source of truth.
    interviews: assessments
      .filter((a) => !a.isDraft && /interview/i.test(a.type || ''))
      .filter((a) => !a.date || a.date >= new Date().toISOString().slice(0, 10))
      .slice()
      .sort((a, b) => {
        const dateOrder = String(a.date || '').localeCompare(String(b.date || ''));
        if (dateOrder) return dateOrder;
        return String(a.time || '').localeCompare(String(b.time || ''));
      })
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        company: a.company || oppById.get(a.opportunityId)?.company || 'Company to be confirmed',
        round: `${a.type}${a.candidates ? ` - ${a.candidates} candidate${a.candidates === 1 ? '' : 's'}` : ''}`,
        time: [a.date, a.time].filter(Boolean).join(' - ') || 'To be scheduled',
      })),
    recruiters,
    announcements: announcements.map((a) => ({
      id: a.id, title: a.title, message: a.message, type: a.type, author: a.author,
      date: new Date(a.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    })),
    users: users.filter((u) => ['candidate', 'alumni', 'recruiter'].includes(u.role)).map(toOversightUser),
    applications: apps.map(toTrackedApplication),
    notifications,
  };
}

let inflight = null;
// The officer portal is a small single-page application, but several mounted
// components (the header and the current page) read the same dashboard data.
// Keep one live snapshot and notify every consumer after a mutation so an
// approve/publish/reject action never leaves another part of the portal stale.
let currentData = MOCK;
const subscribers = new Set();

function publish(data) {
  currentData = data;
  Object.assign(MOCK, data); // Compatibility for the two legacy report views.
  subscribers.forEach((subscriber) => subscriber(data));
}

function normaliseOpportunityStatus(status) {
  const value = String(status || '').toLowerCase();
  return value === 'published' ? 'published' : value;
}

/** Share concurrent reads, then discard the request so page changes fetch fresh data. */
export function loadOfficerData({ force = false } = {}) {
  if (!force && inflight) return inflight;
  inflight = Promise.all([
    api.get('/opportunities'),
    api.get('/applications'),
    api.get('/users/oversight'),
    api.get('/recruiters'),
    api.get('/assessments'),
    api.get('/features/officer/placement-dashboard'),
    api.get('/announcements').then((r) => r.data).catch(() => []),
    api.get('/notifications').then((r) => r.data).catch(() => []),
  ]).then(([opps, apps, users, recruiters, assessments, placement, announcements, inbox]) => {
    const data = build({
      opps: opps.data,
      apps: apps.data,
      users: users.data,
      recruiters: recruiters.data,
      assessments: assessments.data,
      placement: placement.data,
      announcements,
      inbox,
    });
    publish(data);
    return data;
  });
  const request = inflight;
  const clear = () => { if (inflight === request) inflight = null; };
  request.then(clear, clear);
  return inflight;
}

/** Hook: returns the loaded data (or empty values until it arrives) and a refresh function. */
export function useOfficerData() {
  const [state, setState] = useState({ data: currentData, ready: false, error: '' });
  const refresh = useCallback(async () => {
    try {
      const data = await loadOfficerData({ force: true });
      setState({ data, ready: true, error: '' });
      return data;
    } catch (error) {
      setState((prev) => ({ ...prev, error: 'Could not load data from the server.' }));
      return null;
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    const receive = (data) => {
      if (!cancelled) setState({ data, ready: true, error: '' });
    };
    subscribers.add(receive);
    const onFocus = () => { loadOfficerData({ force: true }).catch(() => {}); };
    window.addEventListener('focus', onFocus);
    loadOfficerData()
      .then((data) => { if (!cancelled) setState({ data, ready: true, error: '' }); })
      .catch(() => { if (!cancelled) setState((prev) => ({ ...prev, error: 'Could not load data from the server.' })); });
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      subscribers.delete(receive);
    };
  }, []);
  return { ...state, refresh };
}
