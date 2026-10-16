import api from '../../../services/api.js';

// Translate between the shapes the recruiter screens use and the backend's.

const initialsOf = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export const toOpportunity = (o) => ({
  id: o.id,
  title: o.title,
  company: o.company,
  location: o.location,
  ctc: o.salary,
  openings: String(o.openings ?? ''),
  cgpa: String(o.cgpa ?? ''),
  type: o.type,
  branches: o.branches || [],
  skills: o.tags || [],
  applications: o.applications ?? 0,
  deadline: o.deadline,
  status: o.status,
  rejectionRemark: o.rejectionRemark,
  description: o.description || '',
});

export const fromOpportunity = (o, extra = {}) => ({
  title: o.title,
  location: o.location,
  deadline: o.deadline,
  salary: o.ctc,
  openings: Number(o.openings) || 1,
  cgpa: Number(o.cgpa) || 0,
  branches: o.branches,
  type: o.type,
  tags: o.skills,
  description: o.description,
  ...extra,
});

export const toApplication = (a) => ({
  id: a.id,
  opportunityId: a.opportunityId,
  candidateId: a.candidateId,
  name: a.candidateName,
  initials: a.initials || initialsOf(a.candidateName),
  branch: a.branch || '',
  cgpa: a.cgpa ?? 0,
  role: a.title,
  status: a.status === 'Offer' ? 'Offered' : a.status,
  isReferred: !!a.hasReferral,
  appliedDate: a.appliedDate,
  email: a.email || '',
  phone: a.phone || '',
  resumeFile: a.resumeFile || '',
  rounds: a.rounds || { resume: 'Scheduled', assessment: 'Scheduled', technical: 'Scheduled', hr: 'Scheduled' },
  evaluation: a.evaluation,
  recruiterFeedback: a.recruiterFeedback,
  feedbackSent: a.feedbackSent,
  referrerName: a.referrerName || null,
  referrerInitials: a.referrerInitials || null,
  referrerCompany: a.referrerCompany || null,
  referrerBatch: a.referrerBatch || null,
  referrerAvatarColor: a.referrerAvatarColor || null,
  referrerDesignation: a.referrerDesignation || '',
  referrerEmail: a.referrerEmail || '',
  referralStatus: a.referralStatus || null,
  referralNote: a.referralNote || '',
  timeline: a.timeline || [],
});

export const toAssessment = (a) => ({ ...a });

export const fetchRecruiterData = async () => {
  const [opps, apps, assessments, notifications] = await Promise.all([
    api.get('/opportunities'),
    api.get('/applications'),
    api.get('/assessments'),
    api.get('/notifications').then((r) => r.data).catch(() => []),
  ]);
  return {
    opportunities: opps.data.map(toOpportunity),
    applications: apps.data.map(toApplication),
    assessments: assessments.data.map(toAssessment),
    notifications,
  };
};
