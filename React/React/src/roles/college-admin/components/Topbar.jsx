// Data Flow (roles/college-admin/components/Topbar.jsx):
// Backend API -> Redux Thunks/Slices (collegeAdminSlice) -> useSelector(selectCollegeTopbarUi) -> UI render
// User Actions -> dispatch(slice actions) -> Slice reducers/thunks -> Redux state update
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LogOut, User } from 'lucide-react';
import { selectCollegeTopbarUi, setCollegeTopbarUi } from '../store/collegeAdminSlice.js';

export default function CATopbar({ title, userName, avatarInitials, onProfileClick, onSignOutClick }) {
  const dispatch = useDispatch();
  const { dropdownOpen } = useSelector(selectCollegeTopbarUi);
  const setDropdownOpen = (updater) => {
    const next = typeof updater === 'function' ? updater(dropdownOpen) : updater;
    dispatch(setCollegeTopbarUi({ dropdownOpen: next }));
  };
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(setCollegeTopbarUi({ dropdownOpen: false }));
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch, dropdownOpen]);

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

