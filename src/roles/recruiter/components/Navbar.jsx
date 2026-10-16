import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut } from 'lucide-react';

export default function Navbar({ title, recruiter, setActiveTab, onSignOut, notifications = [], onMarkAllRead }) {
  const unread = notifications.filter((n) => !n.isRead).length;
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header-bar">
      <div className="header-title">
        <h2>{title}</h2>
      </div>

      <div className="header-right">
        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowNotifs(!showNotifs)}
            title="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 2, right: 2, minWidth: 16, height: 16, borderRadius: 8, background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="dropdown-menu" style={{ width: 340, maxHeight: 420, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Notifications</h4>
                {unread > 0 && (
                  <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: '#0F8F63', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <hr className="dropdown-divider" />
              {notifications.length === 0 && (
                <div style={{ fontSize: '12px', color: '#6B7280', padding: '10px 0' }}>You're all caught up.</div>
              )}
              {notifications.map((n) => (
                <div key={n.id} style={{ fontSize: '12px', color: '#374151', padding: '8px 0', borderBottom: '1px solid #F3F4F6', opacity: n.isRead ? 0.65 : 1 }}>
                  <strong>{n.title}</strong>
                  <div style={{ color: '#6B7280', marginTop: 2 }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div 
            className="avatar avatar-nav" 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title="Recruiter Account"
          >
            {recruiter.avatar || 'PK'}
          </div>

          {showProfileMenu && (
            <div className="dropdown-menu">
              <h4>{recruiter.name}</h4>
              <p>{recruiter.email}</p>
              <p style={{ color: '#0F8F63', fontWeight: 600, marginTop: '2px' }}>
                {recruiter.company}
              </p>
              <hr className="dropdown-divider" />
              <button 
                className="dropdown-item-btn"
                onClick={() => {
                  setActiveTab('profile');
                  setShowProfileMenu(false);
                }}
              >
                <User size={15} />
                <span>My Profile</span>
              </button>
              <button 
                className="dropdown-item-btn danger"
                onClick={onSignOut}
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
