import React, { useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, ChevronRight, Mail, Search, UserRound } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import './styles/p6.css';
import { useOfficerData } from '../services/officerApi';

const STATUS_CLASS = { Applied: 'app-status--applied', 'Under Review': 'app-status--review', Shortlisted: 'app-status--shortlisted', 'Interview Scheduled': 'app-status--interview', Selected: 'app-status--selected', Rejected: 'app-status--rejected' };
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'C';
const placementStatus = (applications) => {
  if (applications.some((app) => app.status === 'Selected')) return 'Placed';
  if (applications.some((app) => ['Shortlisted', 'Interview Scheduled'].includes(app.status))) return 'In progress';
  if (applications.length) return 'Applying';
  return 'No applications';
};
function StatusBadge({ status }) { return <span className={`app-status ${STATUS_CLASS[status] || `app-status--${status.toLowerCase().replaceAll(' ', '-')}`}`}>{status}</span>; }

export default function AppTracking({ onNavigate, activePage = 'p6' }) {
  const { data, ready, error } = useOfficerData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const candidates = useMemo(() => (data.users || []).filter((user) => user.role === 'candidate'), [data.users]);
  const applications = data.applications || [];
  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedCandidateId);
  const selectedApplications = selectedCandidate ? applications.filter((app) => app.candidateId === selectedCandidate.id || app.candidate === selectedCandidate.name) : [];
  const filteredCandidates = candidates.filter((candidate) => {
    const term = searchQuery.trim().toLowerCase();
    return !term || candidate.name.toLowerCase().includes(term) || candidate.roll.toLowerCase().includes(term);
  });
  return <div className="frame">
    <Sidebar activePage={activePage} onNavigate={onNavigate} />
    <Header title="Application Tracker" onNavigate={onNavigate} />
    <main className="main-content app-tracker" id="mainContent">
      {!selectedCandidate ? <section aria-labelledby="candidate-list-title">
        <div className="app-tracker__heading"><div><p className="app-tracker__eyebrow">Candidate management</p><h1 id="candidate-list-title">Candidate Applications</h1><p>Choose a candidate to view their applications and manage each status.</p></div><div className="app-tracker__count"><UserRound size={18} /> {candidates.length} Candidates</div></div>
        <label className="candidate-search"><Search size={19} aria-hidden="true" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by candidate name or roll number" aria-label="Search candidates" /></label>
        {error ? <div className="tracker-message tracker-message--error">{error}</div> : !ready ? <div className="tracker-message">Loading candidates…</div> : filteredCandidates.length === 0 ? <div className="tracker-empty"><UserRound size={28} /><strong>No candidates found</strong><span>Try a different name or roll number.</span></div> : <div className="candidate-table-wrap"><table className="candidate-table"><thead><tr><th>Candidate</th><th>Roll Number</th><th>Branch</th><th>Email</th><th>Placement Status</th><th aria-label="View profile" /></tr></thead><tbody>{filteredCandidates.map((candidate) => {
          const candidateApplications = applications.filter((app) => app.candidateId === candidate.id || app.candidate === candidate.name);
          return <tr key={candidate.id} tabIndex={0} role="button" onClick={() => setSelectedCandidateId(candidate.id)} onKeyDown={(event) => event.key === 'Enter' && setSelectedCandidateId(candidate.id)}><td><span className="candidate-cell"><span className="candidate-avatar">{initials(candidate.name)}</span><strong>{candidate.name}</strong></span></td><td>{candidate.roll || '—'}</td><td>{candidate.branch || '—'}</td><td className="candidate-email">{candidate.email}</td><td><StatusBadge status={placementStatus(candidateApplications)} /></td><td><ChevronRight size={20} aria-hidden="true" /></td></tr>;
        })}</tbody></table></div>}
      </section> : <section aria-labelledby="candidate-profile-title">
        <button type="button" className="tracker-back" onClick={() => setSelectedCandidateId(null)}><ArrowLeft size={18} /> Back to candidates</button>
        <div className="candidate-profile-card"><div className="candidate-profile-card__avatar">{initials(selectedCandidate.name)}</div><div className="candidate-profile-card__main"><p className="app-tracker__eyebrow">Candidate profile</p><h1 id="candidate-profile-title">{selectedCandidate.name}</h1><div className="candidate-profile-card__details"><span>{selectedCandidate.roll || 'Roll number unavailable'}</span><span>{selectedCandidate.branch || 'Branch unavailable'}</span><span><Mail size={15} /> {selectedCandidate.email}</span></div></div><div className="candidate-profile-card__status"><span>Overall placement status</span><StatusBadge status={placementStatus(selectedApplications)} /></div></div>
        <div className="opportunities-heading"><div><h2>Applied Opportunities</h2><p>{selectedApplications.length ? `${selectedApplications.length} application${selectedApplications.length === 1 ? '' : 's'} for this candidate` : 'No applications have been submitted yet.'}</p></div></div>
        {selectedApplications.length === 0 ? <div className="tracker-empty"><BriefcaseBusiness size={28} /><strong>No applied opportunities</strong><span>This candidate has not applied to any placement opportunities yet.</span></div> : <div className="opportunity-list">{selectedApplications.map((application) => <article className="candidate-application" key={application.id}><div className="candidate-application__company">{application.company?.slice(0, 1).toUpperCase() || 'C'}</div><div className="candidate-application__info"><h3>{application.role}</h3><p>{application.company}</p><span><CalendarDays size={14} /> Applied {application.date || '—'}</span>{application.interviewDate && <span><CalendarDays size={14} /> Interview {application.interviewDate}</span>}</div><div className="candidate-application__status"><span>Application status</span><StatusBadge status={application.status} /></div></article>)}</div>}
      </section>}
    </main>
  </div>;
}
