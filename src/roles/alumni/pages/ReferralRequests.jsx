import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ResumeModal from '../components/ResumeModal';
import DeclineModal from '../components/DeclineModal';
import SignOutModal from '../components/SignOutModal';
import '../styles/Alumni.css';

// Dummy summaries per candidate (keyed by id)
const DUMMY_SUMMARIES = {
  // ★ MAIN CANDIDATE — Shameer Basha Shaik
  'shameer-basha':
    'Shameer is a passionate Computer Science student (CGPA 8.7) from CareerNest University with strong expertise in React, Node.js, and AWS. He completed a successful summer internship at TechWave Solutions, improving frontend load times by 15%, and leads the college Coding Club. His HackerRank profile reflects consistent competitive programming performance — a well-rounded candidate for the Software Engineer role at TechCorp Solutions.',
  'arjun-sharma':
    'Arjun is a passionate Computer Science student with strong problem-solving skills and hands-on experience in Java and Spring Boot. He has consistently maintained a high CGPA and has demonstrated leadership in technical clubs.',
  'rahul-verma':
    'Rahul is a front-end enthusiast skilled in React and TypeScript, with a portfolio of production-grade UI projects. He is detail-oriented and has a strong design sensibility.',
  'priya-patel':
    'Priya is a data-driven thinker specializing in Python-based analytics and machine learning pipelines. She has hands-on Tableau experience and has led several data visualization projects.',
  'neha-gupta':
    'Neha is an exceptional IT graduate with a 9.1 CGPA and practical experience in cloud-native back-end architecture. Her internship at a high-growth startup demonstrates her ability to deliver results under pressure.',
  'karan-singh':
    'Karan combines mechanical engineering fundamentals with modern simulation tools. As the Formula Student team lead, he has demonstrated project management, CAD proficiency, and cross-functional collaboration.',
  'aisha-khan':
    'Aisha is a quality-focused engineer with a strong interest in test automation. She has completed Selenium certification and has practical experience automating web applications end-to-end.',
};

const DEFAULT_SUMMARY =
  'This candidate has a strong academic background and relevant technical skills. They have demonstrated initiative in pursuing their career goals and show promise as a professional in their field.';

export default function ReferralRequests({
  referrals = [],
  alumniData,
  initialFilter = 'all',
  openCardId = null,
  onUpdateReferralStatus,
  onNavigate,
}) {
  const [currentFilter, setCurrentFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCards, setOpenCards] = useState(() => (openCardId ? { [openCardId]: true } : {}));
  const [replyMessages, setReplyMessages] = useState({});
  const [resumeModalData, setResumeModalData] = useState({ isOpen: false, candidateName: '', candidateId: '' });
  const [declineModalData, setDeclineModalData] = useState({ isOpen: false, candidateId: null, candidateName: '' });
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const alumni = alumniData || {
    initials: 'SR',
    name: 'Sneha Reddy',
    email: 'sneha@google.com',
    company: 'Google',
  };

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    approved: referrals.filter((r) => r.status === 'approved').length,
    declined: referrals.filter((r) => r.status === 'declined').length,
  };

  const toggleCard = (id) => {
    setOpenCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReplyChange = (id, text) => {
    setReplyMessages((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const handleAccept = (candidateId, e) => {
    e.stopPropagation();
    const note = (replyMessages[candidateId] || '').trim() || 'Referral approved.';
    if (onUpdateReferralStatus) {
      onUpdateReferralStatus(candidateId, 'approved', note);
    }
  };

  const handleOpenDeclineModal = (candidate, e) => {
    e.stopPropagation();
    setDeclineModalData({
      isOpen: true,
      candidateId: candidate.id,
      candidateName: candidate.name,
    });
  };

  const handleConfirmDecline = (reason) => {
    if (onUpdateReferralStatus && declineModalData.candidateId) {
      onUpdateReferralStatus(declineModalData.candidateId, 'declined', reason);
    }
    setDeclineModalData({ isOpen: false, candidateId: null, candidateName: '' });
  };

  // Filter and search
  const filteredReferrals = referrals.filter((r) => {
    const matchesTab = currentFilter === 'all' || r.status === currentFilter;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTab;

    const searchableText = `${r.name} ${r.department} ${r.cgpa} ${r.batch} ${r.role} ${r.company}`.toLowerCase();
    return matchesTab && searchableText.includes(query);
  });

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="referrals"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumni}
      />

      <main className="main">
        <header className="topbar">
          <h1 className="page-title">Referral Requests</h1>

          {/* Search Bar */}
          <div className="search-container">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="search-input"
              placeholder="Search by name, year, dept, or cgpa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Topbar Avatar → Profile */}
          <button
            type="button"
            className="avatar avatar--topbar"
            title="My Profile"
            onClick={() => onNavigate && onNavigate('profile')}
            style={{ cursor: 'pointer', border: 'none', marginLeft: '12px', flexShrink: 0 }}
          >
            {alumni.initials || 'SR'}
          </button>
        </header>

        {/* Filter Tabs */}
        <div className="tabs" id="filter-tabs">
          {['all', 'pending', 'approved', 'declined'].map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              className={`tab ${currentFilter === filterKey ? 'tab--active' : ''}`}
              onClick={() => setCurrentFilter(filterKey)}
            >
              {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)} ({counts[filterKey] || 0})
            </button>
          ))}
        </div>

        {/* Cards List */}
        <div className="cards">
          {filteredReferrals.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div className="empty-state-title">No referrals found</div>
              <div className="empty-state-desc">
                We couldn't find any referral requests matching your current filters or search query.
              </div>
            </div>
          ) : (
            filteredReferrals.map((r) => {
              const isOpen = !!openCards[r.id];
              const isPending = r.status === 'pending';
              const candidateSummary = DUMMY_SUMMARIES[r.id] || DEFAULT_SUMMARY;

              return (
                <div
                  key={r.id}
                  className="card"
                  id={r.id}
                  data-status={r.status}
                  onClick={() => toggleCard(r.id)}
                >
                  <div className="card-header">
                    <div className="card-left">
                      <div className="avatar">{r.initials}</div>
                      <div className="card-info">
                        <div className="card-name">{r.name}</div>
                        <p className="card-detail">
                          {r.department} • CGPA: {r.cgpa} • Batch {r.batch}
                        </p>
                        <p className="card-for">
                          <span className="label">For: </span>
                          <span className="value">
                            {r.role} at {r.company}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="card-right">
                      <span className={`badge badge--${r.status}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                      <svg
                        className="chevron"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#4a5565"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      className="dropdown-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <hr className="divider" />

                      {/* Profile Summary */}
                      <h3 className="section-title">Profile Summary</h3>
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '12px 14px',
                          marginBottom: '16px',
                          color: '#475569',
                          fontSize: '13.5px',
                          lineHeight: 1.6,
                          fontStyle: 'italic',
                        }}
                      >
                        "{candidateSummary}"
                      </div>

                      <h3 className="section-title">Candidate Details</h3>
                      <div className="details-grid">
                        <div className="detail-box">
                          <div className="detail-label">Department</div>
                          <div className="detail-value">{r.department}</div>
                        </div>
                        <div className="detail-box">
                          <div className="detail-label">CGPA</div>
                          <div className="detail-value">{r.cgpa}</div>
                        </div>
                        <div className="detail-box">
                          <div className="detail-label">Graduation Batch</div>
                          <div className="detail-value">{r.batch}</div>
                        </div>
                      </div>

                      <h3 className="section-title">Applied For</h3>
                      <div className="applied-grid">
                        <div className="applied-col">
                          <div className="applied-line">
                            <span className="applied-label">Role:</span> {r.role}
                          </div>
                          <div className="applied-line">
                            <span className="applied-label">Salary:</span> {r.salary}
                          </div>
                          <div className="tags-row">
                            {r.skills &&
                              r.skills.map((s, idx) => (
                                <span key={idx} className="tag">
                                  {s}
                                </span>
                              ))}
                          </div>
                        </div>
                        <div className="applied-col">
                          <div className="applied-line">
                            <span className="applied-label">Company:</span> {r.company}
                          </div>
                          <div className="applied-line">
                            <span className="applied-label">Location:</span> {r.location}
                          </div>
                        </div>
                      </div>

                      <h3 className="section-title">Candidate Message</h3>
                      <div className="message-box">{r.message}</div>

                      <button
                        type="button"
                        className="resume-btn"
                        onClick={() =>
                          setResumeModalData({
                            isOpen: true,
                            candidateName: r.name,
                            candidateId: r.id,
                            candidate: r,
                          })
                        }
                      >
                        View Resume / Profile
                      </button>

                      {isPending ? (
                        <>
                          <h3 className="section-title">Message to Candidate</h3>
                          <textarea
                            className="reply-box"
                            placeholder="Write a message.."
                            value={replyMessages[r.id] || ''}
                            onChange={(e) => handleReplyChange(r.id, e.target.value)}
                          />

                          <h3 className="section-title">Actions</h3>
                          <div className="actions-row">
                            <button
                              type="button"
                              className="accept-btn"
                              onClick={(e) => handleAccept(r.id, e)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Accept &amp; Refer
                            </button>
                            <button
                              type="button"
                              className="decline-btn"
                              onClick={(e) => handleOpenDeclineModal(r, e)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                              Decline
                            </button>
                          </div>
                        </>
                      ) : (
                        r.alumniNote && (
                          <>
                            <h3 className="section-title">
                              {r.status === 'declined' ? 'Alumni Note (Reason for Decline)' : 'Alumni Note'}
                            </h3>
                            <div
                              className={`alumni-note ${
                                r.status === 'approved' ? 'alumni-note--approved' : 'alumni-note--declined'
                              }`}
                            >
                              {r.alumniNote}
                            </div>
                          </>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      <ResumeModal
        isOpen={resumeModalData.isOpen}
        candidateName={resumeModalData.candidateName}
        candidate={resumeModalData.candidate}
        onClose={() => setResumeModalData({ isOpen: false, candidateName: '', candidateId: '', candidate: null })}
      />

      <DeclineModal
        isOpen={declineModalData.isOpen}
        candidateName={declineModalData.candidateName}
        onClose={() => setDeclineModalData({ isOpen: false, candidateId: null, candidateName: '' })}
        onConfirm={handleConfirmDecline}
      />

      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </div>
  );
}
