// Data Flow (roles/alumni/pages/ReferralRequests.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice, referralsSlice) -> useSelector(selectAlumni, selectAlumniSignOutOpen, selectReferralsUi) -> UI render
// User Actions -> dispatch(fetchReferrals, respondToReferral) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { errorMessage } from '../../../services/api.js';
import { infoDialog } from '../../../shared/components/AppDialog.jsx';
import {
  
  closeAlumniSignOut,
  closeDeclineModal,
  closeResumeModal,
  initReferralsUi,
  openAlumniSignOut,
  openDeclineModal,
  openResumeModal,
  selectAlumni,
  selectAlumniSignOutOpen,
  selectReferralsUi,
  setAlumniLoadError,
  setAlumniPage,
  setReferralReplyMessage,
  setReferralsFilter,
  setReferralsSearch,
  toggleReferralCard,
} from '../store/alumniSlice.js';
import { fetchReferrals, respondToReferral } from '../../../store/slices/referralsSlice.js';
import Sidebar from '../components/Sidebar';
import ResumeModal from '../components/ResumeModal';
import DeclineModal from '../components/DeclineModal';
import SignOutModal from '../components/SignOutModal';
import '../styles/Alumni.css';

export default function ReferralRequests({
  initialFilter = 'all',
  openCardId = null,
}) {
  const dispatch = useDispatch();
  // Redux data source: alumniSlice (selectAlumni -> referrals from referralsSlice, selectReferralsUi -> filters/modals).
  const { alumniData, referrals = [] } = useSelector(selectAlumni, shallowEqual);
  const {
    currentFilter,
    searchQuery,
    openCards,
    replyMessages,
    resumeReferralId,
    declineReferralId,
  } = useSelector(selectReferralsUi);
  const isSignOutOpen = useSelector(selectAlumniSignOutOpen);

  useEffect(() => {
    dispatch(initReferralsUi({ initialFilter, openCardId }));
  }, [dispatch, initialFilter, openCardId]);

  const alumni = alumniData || {};
  const resumeReferral = referrals.find((referral) => referral.id === resumeReferralId);
  const declineReferral = referrals.find((referral) => referral.id === declineReferralId);

  const counts = {
    all: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    approved: referrals.filter((r) => r.status === 'approved').length,
    declined: referrals.filter((r) => r.status === 'declined').length,
  };

  const toggleCard = (id) => {
    dispatch(toggleReferralCard(id));
  };

  const handleReplyChange = (id, text) => {
    dispatch(setReferralReplyMessage({ id, text }));
  };

  const handleAccept = async (candidateId, e) => {
    e.stopPropagation();
    const note = (replyMessages[candidateId] || '').trim() || 'Referral approved.';
    try {
      await dispatch(respondToReferral({
        id: candidateId,
        data: { status: 'Approved', alumniResponse: note },
      })).unwrap();
      await dispatch(fetchReferrals()).unwrap().catch(() => {
        dispatch(setAlumniLoadError('Response saved. Could not refresh referral requests.'));
      });
    } catch (error) {
      infoDialog(errorMessage(error, 'Could not save your response. Please try again.'));
    }
  };

  const handleOpenDeclineModal = (candidate, e) => {
    e.stopPropagation();
    dispatch(openDeclineModal(candidate.id));
  };

  const handleConfirmDecline = async (reason) => {
    if (declineReferral) {
      try {
        await dispatch(respondToReferral({
          id: declineReferral.id,
          data: { status: 'Rejected', alumniResponse: reason || undefined },
        })).unwrap();
        await dispatch(fetchReferrals()).unwrap().catch(() => {
          dispatch(setAlumniLoadError('Response saved. Could not refresh referral requests.'));
        });
      } catch (error) {
        infoDialog(errorMessage(error, 'Could not save your response. Please try again.'));
      }
    }
    dispatch(closeDeclineModal());
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
        onOpenSignOut={() => dispatch(openAlumniSignOut())}
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
              onChange={(e) => dispatch(setReferralsSearch(e.target.value))}
            />
          </div>

          {/* Topbar Avatar â†’ Profile */}
          <button
            type="button"
            className="avatar avatar--topbar"
            title="My Profile"
            onClick={() => {
              dispatch(setAlumniPage({ page: 'profile', props: {} }));
            }}
            style={{ cursor: 'pointer', border: 'none', marginLeft: '12px', flexShrink: 0 }}
          >
            {alumni.initials || ''}
          </button>
        </header>

        {/* Filter Tabs */}
        <div className="tabs" id="filter-tabs">
          {['all', 'pending', 'approved', 'declined'].map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              className={`tab ${currentFilter === filterKey ? 'tab--active' : ''}`}
              onClick={() => dispatch(setReferralsFilter(filterKey))}
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
                          {r.department} â€¢ CGPA: {r.cgpa} â€¢ Batch {r.batch}
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
                        onClick={() => dispatch(openResumeModal(r.id))}
                      >
                        View Applied Resume
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
        isOpen={Boolean(resumeReferral)}
        candidateName={resumeReferral?.name}
        candidate={resumeReferral}
        onClose={() => dispatch(closeResumeModal())}
      />

      <DeclineModal
        isOpen={Boolean(declineReferral)}
        candidateName={declineReferral?.name}
        onClose={() => dispatch(closeDeclineModal())}
        onConfirm={handleConfirmDecline}
      />

      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => dispatch(closeAlumniSignOut())}
      />
    </div>
  );
}
