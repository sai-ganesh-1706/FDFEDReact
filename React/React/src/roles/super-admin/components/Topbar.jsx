import React, { useEffect, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';

export default function Topbar({ title, userName, avatarInitials, onProfileClick, onSignOutClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setDropdownOpen(false);
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <span className="user-name">{userName}</span>
        <div className="sa-topbar-profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="avatar sa-avatar-button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
            title="Profile menu"
          >
            {avatarInitials}
          </button>
          {dropdownOpen && (
            <div className="sa-profile-dropdown" role="menu">
              <button type="button" className="sa-profile-dd-item" role="menuitem" onClick={() => { setDropdownOpen(false); onProfileClick?.(); }}>
                <User size={15} /> My Profile
              </button>
              <div className="sa-profile-dd-divider" />
              <button type="button" className="sa-profile-dd-item sa-profile-dd-signout" role="menuitem" onClick={() => { setDropdownOpen(false); onSignOutClick?.(); }}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

