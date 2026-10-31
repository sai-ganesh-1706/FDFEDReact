import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p4.css';
import api, { errorMessage } from '../../../services/api.js';
import { useOfficerData } from '../services/officerApi';


export default function Recruiters({ onNavigate, activePage = 'p4' }) {
  /* ── Recruiters come from the API; approvals write to it and reload ── */
  const { data, refresh, error: loadError } = useOfficerData();
  const recruiters = data.recruiters || [];

  const act = async (request) => {
    try {
      await request();
      await refresh();
      return true;
    } catch (error) {
      window.alert(errorMessage(error, 'That action could not be completed.'));
      return false;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [openProfileIdx, setOpenProfileIdx] = useState(null);
  const [openVerifyIdx, setOpenVerifyIdx] = useState(null);
  const [openDeclineIdx, setOpenDeclineIdx] = useState(null);
  const [declineRemarks, setDeclineRemarks] = useState('');
  const [declineError, setDeclineError] = useState(false);
  const [credentials, setCredentials] = useState(null);   // shown once after a recruiter is verified
  const [copied, setCopied] = useState(false);

  const recStats = {
    total: recruiters.length,
    active: recruiters.filter((r) => r.status === 'active').length,
    pending: recruiters.filter((r) => r.status === 'pending').length,
    declined: recruiters.filter((r) => r.status === 'declined').length,
  };

  const pendingCount = recStats.pending;

  const filtered = recruiters.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    );
  });

  const toggleProfile = (idx) => {
    setOpenProfileIdx(openProfileIdx === idx ? null : idx);
    setOpenVerifyIdx(null);
    setOpenDeclineIdx(null);
  };

  const toggleVerify = (idx) => {
    setOpenVerifyIdx(openVerifyIdx === idx ? null : idx);
    setOpenProfileIdx(null);
    setOpenDeclineIdx(null);
  };

  const openDeclineDrawer = (idx) => {
    setOpenDeclineIdx(idx);
    setOpenVerifyIdx(null);
    setDeclineRemarks('');
    setDeclineError(false);
  };

  const approveRecruiter = async (idx) => {
    const recruiter = recruiters.find((r) => r.id === idx);
    if (!recruiter) return;
    try {
      const { data: result } = await api.patch(`/recruiters/${recruiter.id}/approve`);
      await refresh();
      setCredentials({ name: recruiter.name, company: recruiter.company, ...result.credentials });
      setCopied(false);
    } catch (error) {
      window.alert(errorMessage(error, 'That action could not be completed.'));
    }
    setOpenVerifyIdx(null);
  };

  const confirmDecline = async (idx) => {
    const wordCount = declineRemarks.trim().split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount < 10) {
      setDeclineError(true);
      return;
    }
    setDeclineError(false);
    const recruiter = recruiters.find((r) => r.id === idx);
    if (!recruiter) return;
    await act(() => api.patch(`/recruiters/${recruiter.id}/decline`, { remark: declineRemarks.trim() }));
    setOpenDeclineIdx(null);
    setDeclineRemarks('');
  };

  const statItems = [
    { value: recStats.total, label: 'Total Recruiters', colorClass: 'blue', stroke: '#3B82F6' },
    { value: recStats.active, label: 'Active', colorClass: 'green', stroke: '#22C55E' },
    { value: recStats.pending, label: 'Pending Verification', colorClass: 'yellow', stroke: '#EAB308' },
    { value: recStats.declined, label: 'Declined', colorClass: 'red', stroke: '#EF4444' },
  ];

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Recruiter Management" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
        {loadError && <p role="alert" style={{ color: '#b91c1c', marginBottom: 12 }}>{loadError}</p>}
        {/* Hero Card */}
        <div className="hero-card">
          <h1>Recruiter Management Center</h1>
          <p className="hero-sub">Manage and verify corporate recruiter partners registered on the CareerNest placement portal.</p>
          <button
            className="hero-btn"
            id="viewRecruitersBtn"
            onClick={() => {
              const el = document.getElementById('recruiterTable');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9810fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View Recruiter Directory
          </button>
        </div>

        {/* Alert Bar */}
        <div className={`alert-bar ${pendingCount > 0 ? 'alert-yellow' : ''}`} style={pendingCount === 0 ? { background: '#f0fdf4', border: '1px solid #bbf7d0' } : {}}>
          <div className="alert-left">
            {pendingCount > 0 ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p><strong>{pendingCount} recruiter(s)</strong> awaiting verification. Review and approve pending requests to grant portal access.</p>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p style={{ color: '#166534' }}><strong>All recruiters verified!</strong> No pending verifications at this time.</p>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row" id="statsRow">
          {statItems.map((item, idx) => (
            <div className="stat-card" key={idx}>
              <div className="stat-data">
                <div className="stat-label">{item.label}</div>
                <div className="stat-value">{item.value}</div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          ))}
        </div>

        {/* Recruiter Table */}
        <div className="table-card" id="recruiterTable">
          <div className="search-wrap">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="searchInput"
              type="text"
              placeholder="Search recruiters by name, company, role, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <table className="rec-table">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Company</th>
                <th>Role</th>
                <th>Published Opportunities</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="recBody">
              {filtered.map((r) => {
                const realIdx = r.id;
                const isPending = r.status === 'pending';
                const isProfileOpen = openProfileIdx === realIdx;
                const isVerifyOpen = openVerifyIdx === realIdx;
                const isDeclineOpen = openDeclineIdx === realIdx;

                return (
                  <React.Fragment key={r.id}>
                  {false && <tr key={realIdx} className="rec-row" data-i={realIdx}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>{r.company}</td>
                    <td>{r.role}</td>
                    <td>{r.opps}</td>
                    <td>
                      <span className={`status-badge ${r.status}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {r.status === 'pending' && (
                        <>
                          <button className="btn-approve-sm" onClick={() => approveRecruiter(realIdx)}>Approve</button>
                          <button className="btn-decline-sm" onClick={() => declineRecruiter(realIdx)}>Decline</button>
                        </>
                      )}
                      {r.status === 'active' && <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>Verified</span>}
                      {r.status === 'declined' && <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: 600 }}>Declined</span>}
                    </td>
                  </tr>}
                  <React.Fragment key={realIdx}>
                    {/* Main Row */}
                    <tr className="rec-row" data-i={realIdx}>
                      <td>
                        <div className="rec-name">
                          <div className="rec-avatar">{r.name[0]}</div>
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td>{r.company}</td>
                      <td>{r.role}</td>
                      <td>{r.opps} published {r.opps === 1 ? 'opportunity' : 'opportunities'}</td>
                      <td>
                        <span className={`badge-status badge-${r.status}`}>
                          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-profile" onClick={() => toggleProfile(realIdx)}>
                            View Profile <span className="chev" style={{ transform: isProfileOpen ? 'rotate(180deg)' : '' }}>▼</span>
                          </button>
                          {isPending && (
                            <button className="btn-verify" onClick={() => toggleVerify(realIdx)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>{' '}
                              Verify
                            </button>
                          )}
                          {r.status === 'active' && (
                            <span style={{ color: '#059669', fontSize: '12px', fontWeight: 600 }}>Verified</span>
                          )}
                          {r.status === 'declined' && (
                            <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>Declined</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Profile Panel */}
                    {isProfileOpen && <tr className="profile-panel open" data-i={realIdx}>
                      <td colSpan="6">
                        <div className="profile-inner">
                          <h4>Profile Details</h4>
                          <div className="profile-grid">
                            <div className="profile-col">
                              <div className="profile-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9810fa" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                <div>
                                  <div className="profile-lbl">Email</div>
                                  <div className="profile-val">{r.email}</div>
                                </div>
                              </div>
                              <div className="profile-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9810fa" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                <div>
                                  <div className="profile-lbl">Phone</div>
                                  <div className="profile-val">{r.phone}</div>
                                </div>
                              </div>
                              <div className="profile-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9810fa" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <div>
                                  <div className="profile-lbl">Location</div>
                                  <div className="profile-val">{r.location}</div>
                                </div>
                              </div>
                              <div className="profile-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9810fa" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                <div>
                                  <div className="profile-lbl">Join Date</div>
                                  <div className="profile-val">{r.joined}</div>
                                </div>
                              </div>
                            </div>
                            <div className="profile-bio">
                              <div className="profile-bio-lbl">{r.message ? 'Message to the placement cell' : 'Bio & Company Overview'}</div>
                              <p>{r.message || r.bio || 'No additional details were provided.'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>}

                    {/* Expandable Verification Panel */}
                    {isPending && isVerifyOpen && (
                      <tr className="verify-panel open" data-i={realIdx}>
                        <td colSpan="6">
                          <div className="verify-inner">
                            <div className="verify-head">
                              <h4>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                Verify Corporate Recruiter
                              </h4>
                              <button className="close-btn" onClick={() => setOpenVerifyIdx(null)}>&times;</button>
                            </div>

                            <div className="verify-grid">
                              <div className="verify-left">
                                <div className="cred-box">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                  </svg>
                                  <div>
                                    <div className="cred-title">Login Credentials Ready</div>
                                    <div className="cred-desc">
                                      Credentials will be sent to <strong>{r.email}</strong> upon approval.
                                    </div>
                                  </div>
                                </div>

                                <div className="verify-person">
                                  <div className="rec-avatar">{r.name[0]}</div>
                                  <div>
                                    <div className="verify-person-name">{r.name}</div>
                                    <div className="verify-person-role">{r.role} at {r.company}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="verify-right">
                                <p className="verify-desc">
                                  Review the recruiter's application and determine whether to approve or decline their hiring access to our students.
                                </p>
                                <div className="verify-note">
                                  <strong>Note:</strong> Approving will immediately dispatch credentials and activate job posting permissions.
                                </div>
                                <div className="verify-actions">
                                  <button className="btn-approve" onClick={() => approveRecruiter(realIdx)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>{' '}
                                    Approve &amp; Send Credentials
                                  </button>
                                  <button className="btn-decline" onClick={() => openDeclineDrawer(realIdx)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>{' '}
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expandable Decline Panel with 10-word validation */}
                    {isPending && isDeclineOpen && (
                      <tr className="decline-panel open" data-i={realIdx}>
                        <td colSpan="6">
                          <div className="decline-inner">
                            <div className="decline-head">
                              <h4>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                                Decline Recruiter Application
                              </h4>
                              <button className="close-btn" onClick={() => setOpenDeclineIdx(null)}>&times;</button>
                            </div>

                            <div className="decline-warn">
                              <strong>Warning:</strong> You are declining <strong>{r.name}</strong> from <strong>{r.company}</strong>. Please provide constructive feedback.
                            </div>

                            <label className="decline-label">
                              Remarks / Reason for Decline <span className="decline-req">*</span>{' '}
                              <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#6b7280' }}>(minimum 10 words required)</span>
                            </label>

                            {/* Word-count progress bar */}
                            {(() => {
                              const wc = declineRemarks.trim() === '' ? 0 : declineRemarks.trim().split(/\s+/).filter(w => w.length > 0).length;
                              const pct = Math.min((wc / 10) * 100, 100);
                              return (
                                <div style={{ marginBottom: '8px' }}>
                                  <div style={{ height: '4px', borderRadius: '4px', background: '#f3f4f6', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: wc >= 10 ? '#22c55e' : '#f59e0b', transition: 'width .2s, background .2s', borderRadius: '4px' }} />
                                  </div>
                                  <span style={{ fontSize: '11px', color: wc >= 10 ? '#166534' : '#92400e', fontWeight: 600, marginTop: '3px', display: 'inline-block' }}>
                                    {wc} / 10 words {wc >= 10 ? '(Minimum reached)' : '(Minimum 10 words required)'}
                                  </span>
                                </div>
                              );
                            })()}

                            <textarea
                              className="decline-textarea"
                              placeholder="Please explain why this registration cannot be approved at this time (minimum 10 words)..."
                              value={declineRemarks}
                              onChange={(e) => { setDeclineRemarks(e.target.value); if (declineError) setDeclineError(false); }}
                              style={declineError ? { borderColor: '#ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,.1)' } : {}}
                            />

                            {declineError && (
                              <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '-6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ⚠ Remarks must be at least 10 words. Please provide a detailed reason.
                              </div>
                            )}

                            <div className="decline-btns">
                              <button className="decline-cancel-btn" onClick={() => setOpenDeclineIdx(null)}>
                                Cancel
                              </button>
                              <button className="decline-confirm-btn" onClick={() => confirmDecline(realIdx)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>{' '}
                                Confirm Decline
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {credentials && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 460, width: '100%', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 34, textAlign: 'center' }}>✅</div>
            <h3 style={{ textAlign: 'center', margin: '6px 0 4px', fontSize: 20 }}>{credentials.name} is verified</h3>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 18 }}>
              Share these login details with the recruiter at {credentials.company}. The password is shown only now.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 2 }}>
              <div><span style={{ color: '#64748b' }}>Email&nbsp;&nbsp;&nbsp;&nbsp;</span> <strong>{credentials.email}</strong></div>
              <div><span style={{ color: '#64748b' }}>Password</span> <strong style={{ fontFamily: 'monospace', fontSize: 15 }}>{credentials.password}</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button
                className="btn-profile"
                onClick={() => {
                  navigator.clipboard?.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
                  setCopied(true);
                }}
              >{copied ? 'Copied ✓' : 'Copy credentials'}</button>
              <button className="btn-approve" onClick={() => setCredentials(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
