import React, { useEffect, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';

export default function CATopbar({ title, userName, avatarInitials, onProfileClick, onSignOutClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="topbar">
      <span className="topbar-title">{title}</span>
      <div className="topbar-right">
        <span className="user-name">{userName}</span>
        <div className="topbar-profile-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className="avatar avatar-button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            aria-label="Open profile menu"
            title="Profile menu"
          >
            {avatarInitials}
          </button>
          {dropdownOpen && (
            <div className="ca-profile-dropdown" role="menu">
              <button
                type="button"
                className="ca-profile-dd-item"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); onProfileClick?.(); }}
              >
                <User size={15} />
                My Profile
              </button>
              <div className="ca-profile-dd-divider" />
              <button
                type="button"
                className="ca-profile-dd-item ca-profile-dd-signout"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); onSignOutClick?.(); }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

