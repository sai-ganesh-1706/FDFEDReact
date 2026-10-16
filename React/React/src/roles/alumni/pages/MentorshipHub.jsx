import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import featuresApi from '../data/featuresApi';
import '../styles/Alumni.css';

export default function MentorshipHub({ alumniData, onNavigate }) {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // Send request form state
  const [alumniId, setAlumniId] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadReceived = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await featuresApi.getMentorshipReceived();
      setReceivedRequests(data || []);
    
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('STANDARD') || msg.includes('403')) {
        setErrorMessage('STANDARD_REQUIRED');
      } else {
        setErrorMessage(msg || 'Failed to load mentorship requests');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'received') {
      loadReceived();
    }
  }, [activeTab, loadReceived]);

  const handleRespond = async (id, newStatus) => {
    try {
      await featuresApi.respondMentorship(id, newStatus);
    
      setReceivedRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(`Error updating request: ${err?.message || ''}`);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!alumniId || !topic || !message) {
      alert('Please fill all fields.');
      return;
    }

    try {
      await featuresApi.requestMentorship({
        alumniId: Number(alumniId),
        topic,
        message,
        studentName: localStorage.getItem('userName') || alumniData?.name || 'Alumni Member',
      });
    

      setSuccessMessage('✓ Mentorship request sent successfully!');
      setAlumniId('');
      setTopic('');
      setMessage('');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(`Error sending request: ${err?.message || ''}`);
    }
  };

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="mentorship"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumniData}
      />

      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">Mentorship Hub</h1>
            <span
              style={{
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              ⭐ Standard
            </span>
          </div>
          <div className="topbar-right">
            <div className="avatar avatar--topbar" title="My Profile">
              {alumniData?.initials || 'SR'}
            </div>
          </div>
        </header>

        <div className="mentorship-container">
          <p className="portal-sub">
            Manage mentorship requests from students and give back to the community.
          </p>

          {/* Mentorship Tabs Bar */}
          <div className="mentorship-tabs-bar">
            <button
              type="button"
              className={`mentor-tab ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              📬 Received Requests
            </button>
            <button
              type="button"
              className={`mentor-tab ${activeTab === 'send' ? 'active' : ''}`}
              onClick={() => setActiveTab('send')}
            >
              ✉️ Request Mentorship
            </button>
          </div>

          {/* Tab 1: Received Requests */}
          {activeTab === 'received' && (
            <div className="tab-content-area">
              {loading && (
                <div className="empty-state">
                  <div className="empty-state-title">Loading requests...</div>
                </div>
              )}

              {!loading && errorMessage === 'STANDARD_REQUIRED' && (
                <div className="empty-state">
                  <div className="empty-state-icon">🔒</div>
                  <div className="empty-state-title">Standard Plan Required</div>
                  <div className="empty-state-desc">
                    Mentorship features require the Standard plan. Contact your college admin to upgrade.
                  </div>
                </div>
              )}

              {!loading && errorMessage && errorMessage !== 'STANDARD_REQUIRED' && (
                <div className="empty-state">
                  <div className="empty-state-title">Error</div>
                  <div className="empty-state-desc">{errorMessage}</div>
                </div>
              )}

              {!loading && !errorMessage && receivedRequests.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-title">No requests yet</div>
                  <div className="empty-state-desc">
                    When students request mentorship from you, they'll appear here.
                  </div>
                </div>
              )}

              {!loading && !errorMessage && receivedRequests.length > 0 && (
                <div className="req-list">
                  {receivedRequests.map((r) => {
                    const isPending = r.status === 'pending';
                    const dateStr = r.createdAt ? r.createdAt.split('T')[0] : 'Recently';

                    return (
                      <div key={r.id} className="req-card">
                        <div className="req-head">
                          <div>
                            <div className="req-name">👤 {r.studentName}</div>
                            <div className="req-topic">📚 {r.topic}</div>
                          </div>

                          <span
                            className={`status-pill ${
                              r.status === 'accepted'
                                ? 's-accepted'
                                : r.status === 'rejected'
                                ? 's-rejected'
                                : 's-pending'
                            }`}
                          >
                            {r.status === 'accepted'
                              ? '✓ Accepted'
                              : r.status === 'rejected'
                              ? '✕ Rejected'
                              : '⏳ Pending'}
                          </span>
                        </div>

                        <div className="req-msg">"{r.message}"</div>
                        <div className="req-date">Requested on {dateStr}</div>

                        {isPending && (
                          <div className="req-actions">
                            <button
                              type="button"
                              className="btn-accept-pill"
                              onClick={() => handleRespond(r.id, 'accepted')}
                            >
                              ✓ Accept
                            </button>
                            <button
                              type="button"
                              className="btn-reject-pill"
                              onClick={() => handleRespond(r.id, 'rejected')}
                            >
                              ✕ Decline
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Send Mentorship Request */}
          {activeTab === 'send' && (
            <div className="tab-content-area">
              <div className="send-card">
                <h2>✉️ Request Mentorship</h2>
                <form onSubmit={handleSendRequest}>
                  <div className="form-group-custom">
                    <label htmlFor="req-alumni-id">Alumni User ID to Request</label>
                    <input
                      id="req-alumni-id"
                      type="number"
                      placeholder="Enter alumni user ID (e.g. 226)"
                      value={alumniId}
                      onChange={(e) => setAlumniId(e.target.value)}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label htmlFor="req-topic">Topic / Area of Guidance</label>
                    <input
                      id="req-topic"
                      type="text"
                      placeholder="e.g. FAANG Interview Preparation, Product Management"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label htmlFor="req-message">Your Message</label>
                    <textarea
                      id="req-message"
                      placeholder="Introduce yourself and explain what kind of guidance you need..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="submit-btn-custom">
                    Send Request
                  </button>

                  {successMessage && (
                    <div className="success-msg-box">{successMessage}</div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </div>
  );
}

