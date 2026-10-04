import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import { mockEvents } from '../data/alumniData';
import '../styles/Alumni.css';

export default function AlumniEvents({ alumniData, onNavigate }) {
  const [events, setEvents] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (typeof window !== 'undefined' && window.FeaturesAPI?.alumni?.getEvents) {
        const data = await window.FeaturesAPI.alumni.getEvents();
        setEvents(data || []);
        const currentUserId = Number(localStorage.getItem('userId') || 0);
        const userRegs = new Set(
          (data || [])
            .filter((e) => e.registrations && e.registrations.includes(currentUserId))
            .map((e) => e.id)
        );
        setRegisteredIds(userRegs);
      } else {
        setEvents(mockEvents);
        setRegisteredIds(new Set([1])); // default register in 1
      }
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('STANDARD') || msg.includes('403')) {
        setErrorMessage('STANDARD_REQUIRED');
      } else {
        setErrorMessage(msg || 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleRegister = async (eventId) => {
    try {
      if (typeof window !== 'undefined' && window.FeaturesAPI?.alumni?.registerEvent) {
        const res = await window.FeaturesAPI.alumni.registerEvent(eventId);
        if (res.success) {
          setRegisteredIds((prev) => new Set([...prev, eventId]));
        }
      } else {
        setRegisteredIds((prev) => new Set([...prev, eventId]));
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, registrations: [...(e.registrations || []), 999] }
              : e
          )
        );
      }
    } catch (err) {
      alert(`Registration error: ${err?.message || ''}`);
    }
  };

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="events"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumniData}
      />

      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">College Events</h1>
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

        <div className="events-container">
          <p className="portal-sub">
            Browse and register for placement drives, workshops, networking meetups, and alumni reunions.
          </p>

          {loading && (
            <div className="empty-state">
              <div className="empty-state-title">Loading events...</div>
            </div>
          )}

          {!loading && errorMessage === 'STANDARD_REQUIRED' && (
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <div className="empty-state-title">Standard Plan Required</div>
              <div className="empty-state-desc">
                College Events require the Standard plan. Contact your college administrator to upgrade.
              </div>
            </div>
          )}

          {!loading && errorMessage && errorMessage !== 'STANDARD_REQUIRED' && (
            <div className="empty-state">
              <div className="empty-state-title">Error</div>
              <div className="empty-state-desc">{errorMessage}</div>
            </div>
          )}

          {!loading && !errorMessage && events.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-title">No upcoming events</div>
              <div className="empty-state-desc">Check back soon for new events and webinars.</div>
            </div>
          )}

          {!loading && !errorMessage && events.length > 0 && (
            <div className="events-list">
              {events.map((e) => {
                const eventDate = new Date(e.date);
                const day = !isNaN(eventDate.getDate()) ? eventDate.getDate() : '15';
                const month = !isNaN(eventDate.getDate())
                  ? eventDate.toLocaleString('default', { month: 'short' })
                  : 'FEB';
                const isRegistered = registeredIds.has(e.id);

                return (
                  <div key={e.id} className="event-card">
                    <div className={`event-date-block type-${e.type || 'webinar'}`}>
                      <div className="eday">{day}</div>
                      <div className="emon">{month}</div>
                    </div>

                    <div className="event-info">
                      <div className="event-title">{e.title}</div>
                      <div className="event-host">By {e.host}</div>
                      <div className="event-desc">{e.description}</div>

                      <div className="event-meta">
                        <span className="meta-chip">🕐 {e.time}</span>
                        <span className={`type-chip-ev type-${e.type || 'webinar'}`}>
                          {e.type}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          👥 {(e.registrations || []).length} registered
                        </span>
                      </div>

                      {isRegistered ? (
                        <button type="button" className="reg-btn registered" disabled>
                          ✓ Registered
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="reg-btn"
                          onClick={() => handleRegister(e.id)}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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

