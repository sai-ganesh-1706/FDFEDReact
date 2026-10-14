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
];
const AVATAR_COLORS = ['#7C3AED', '#4f46e5', '#f59e0b', '#ec4899', '#10b981', '#3b82f6'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EMPTY = () => ({
  stats: {
    totalCandidates: 0, placementRate: 0, highestPkg: 0, companiesVisited: 0, totalApps: 0,
    avgPkg: 0, offersAccepted: 0, internships: 0, pending: 0, published: 0, totalOpps: 0, totalApplicants: 0,
  },
  stakeholders: { candidates: 0, recruiters: 0, activeDrives: 0, alumni: 0 },
  branches: [],
  topCompanies: [],
  deptData: [],
  monthlyTrend: [],
  trend: { labels: [], fullTime: [], internships: [] },
  submissions: [],
  drives: [],
  interviews: [],
  recruiters: [],
  users: [],
  applications: [],
  notifications: [],
});

function resetMock() {
  Object.assign(MOCK, EMPTY());
}
resetMock();

const lpa = (salary) => {
  const match = String(salary || '').match(/(\d+(?:\.\d+)?)\s*(?:-\s*\d+(?:\.\d+)?\s*)?LPA/i);
  return match ? parseFloat(match[1]) : null;
};
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
    submitter: o.submittedBy || 'Recruiter',
    submitted: '',
    deadline: o.deadline,
    desc: o.description || '',
    cgpa: o.cgpa,
    branches: (o.branches || []).join(', '),
    backlogs: o.backlogs || 'Not allowed',
    skills: o.tags || [],
    rounds: o.rounds || '',
    applied: applicantCount,
    rejectionRemark: o.rejectionRemark,
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
  else if (status === 'Assessment') status = 'Under Review';
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
  'Under Review': 'Assessment',
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
    return { ...base, rollNumber: u.roll, department: u.branch, cgpa: u.cgpa, backlogs: u.backlogs };
  }
  if (u.role === 'alumni') {
    return { ...base, company: u.company, batch: u.batch, referrals: u.referrals };
  }
  return { ...base, company: u.recCompany, headline: u.recDesignation, phone: u.recPhone, location: u.recLocation };
}

function build({ opps, apps, users, recruiters }) {
  const students = users.filter((u) => u.role === 'candidate');
  const alumni = users.filter((u) => u.role === 'alumni');
  const reviewable = opps.filter((o) => ['pending', 'approved', 'rejected', 'Published'].includes(o.status));
  const published = opps.filter((o) => o.status === 'Published');
  const countFor = (id) => apps.filter((a) => a.opportunityId === id).length;
  const offers = apps.filter((a) => OFFER_STATUSES.includes(a.status));
  const placedIds = new Set([...students.filter((s) => s.status === 'placed').map((s) => s.id), ...offers.map((a) => a.candidateId)]);
  const packages = published.map((o) => lpa(o.salary)).filter((v) => v != null);

  const byDept = new Map();
  students.forEach((s) => {
    const key = s.department || 'Other';
    const entry = byDept.get(key) || { name: key, total: 0, placed: 0 };
    entry.total += 1;
    if (placedIds.has(s.id)) entry.placed += 1;
    byDept.set(key, entry);
  });
  const branches = [...byDept.values()].map((b, i) => ({ ...b, ...BRANCH_COLORS[i % BRANCH_COLORS.length] }));

  const now = new Date();
  const months = Array.from({ length: 8 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - (7 - i), 1));
  const bucket = (a) => {
    const d = new Date(a.appliedDate);
    return months.findIndex((m) => m.getFullYear() === d.getFullYear() && m.getMonth() === d.getMonth());
  };
  const fullTime = months.map(() => 0);
  const internships = months.map(() => 0);
  apps.forEach((a) => {
    const i = bucket(a);
    if (i < 0) return;
    if (a.type === 'Internship') internships[i] += 1; else fullTime[i] += 1;
  });

  const pendingOpps = opps.filter((o) => o.status === 'pending');
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
  ];

  const oppById = new Map(opps.map((o) => [o.id, o]));
  const studentById = new Map(students.map((s) => [s.id, s]));
  const avg = (values) => (values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : 0);

  const offersByCompany = new Map();
  offers.forEach((a) => {
    const entry = offersByCompany.get(a.company) || { company: a.company, offers: 0, packages: [] };
    entry.offers += 1;
    const pkg = lpa(oppById.get(a.opportunityId)?.salary);
    if (pkg != null) entry.packages.push(pkg);
    offersByCompany.set(a.company, entry);
  });
  const topCompanies = [...offersByCompany.values()]
    .sort((x, y) => y.offers - x.offers)
    .map((c) => ({ company: c.company, offers: c.offers, avgPackage: avg(c.packages) }));

  const deptData = [...byDept.values()].map((b) => {
    const packages = offers
      .filter((a) => (studentById.get(a.candidateId)?.department || 'Other') === b.name)
      .map((a) => lpa(oppById.get(a.opportunityId)?.salary))
      .filter((v) => v != null);
    return {
      dept: b.name, total: b.total, placed: b.placed,
      rate: b.total ? Math.round((b.placed / b.total) * 100) : 0,
      avgPackage: avg(packages),
    };
  });

  const monthlyTrend = months.map((m, i) => ({
    month: MONTHS[m.getMonth()],
    placements: offers.filter((a) => bucket(a) === i).length,
  }));

  return {
    topCompanies,
    deptData,
    monthlyTrend,
    stats: {
      totalCandidates: students.length,
      placementRate: students.length ? Math.round((placedIds.size / students.length) * 100) : 0,
      highestPkg: packages.length ? Math.max(...packages) : 0,
      companiesVisited: new Set(published.map((o) => o.company)).size,
      totalApps: apps.length,
      avgPkg: packages.length ? Math.round(packages.reduce((s, v) => s + v, 0) / packages.length) : 0,
      offersAccepted: offers.length,
      internships: opps.filter((o) => o.type === 'Internship').length,
      pending: pendingOpps.length,
      published: published.length,
      totalOpps: reviewable.length,
      totalApplicants: apps.length,
    },
    stakeholders: {
      candidates: students.length,
      recruiters: recruiters.length,
      activeDrives: published.length,
      alumni: alumni.length,
    },
    branches,
    trend: { labels: months.map((m) => MONTHS[m.getMonth()]), fullTime, internships },
    submissions: reviewable.map((o) => toSubmission(o, countFor(o.id))),
    drives: published.slice(0, 3).map((o) => ({
      company: o.company, role: o.title,
      badge: countFor(o.id) ? 'Applications Open' : 'Open for Applications', badgeClass: 'green',
    })),
    interviews: apps.filter((a) => a.status === 'Interview').slice(0, 2).map((a) => ({
      company: a.company, round: 'Interview', time: a.interviewDate || 'To be scheduled',
    })),
    recruiters,
    users: users.filter((u) => ['candidate', 'alumni', 'recruiter'].includes(u.role)).map(toOversightUser),
    applications: apps.map(toTrackedApplication),
    notifications,
  };
}

let inflight = null;
let lastLoad = 0;

/** Load everything the officer screens need and publish it on MOCK. Calls within 2s share one fetch. */
export function loadOfficerData({ force = false } = {}) {
  if (!force && inflight && Date.now() - lastLoad < 2000) return inflight;
  lastLoad = Date.now();
  inflight = Promise.all([
    api.get('/opportunities'),
    api.get('/applications'),
    api.get('/users'),
    api.get('/recruiters'),
  ]).then(([opps, apps, users, recruiters]) => {
    const data = build({ opps: opps.data, apps: apps.data, users: users.data, recruiters: recruiters.data });
    Object.assign(MOCK, data);
    return data;
  });
  inflight.catch(() => { inflight = null; });
  return inflight;
}

/** Hook: returns the loaded data (or empty values until it arrives) and a refresh function. */
export function useOfficerData() {
  const [state, setState] = useState({ data: MOCK, ready: false, error: '' });
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
    loadOfficerData()
      .then((data) => { if (!cancelled) setState({ data, ready: true, error: '' }); })
      .catch(() => { if (!cancelled) setState((prev) => ({ ...prev, error: 'Could not load data from the server.' })); });
    return () => { cancelled = true; };
  }, []);
  return { ...state, refresh };
}
