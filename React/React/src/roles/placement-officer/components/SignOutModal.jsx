import React from 'react';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="placement-signout-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="placement-signout-popup" role="dialog" aria-modal="true" aria-labelledby="placement-signout-title">
        <div className="placement-signout-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h2 id="placement-signout-title">Sign Out</h2>
        <p>Are you sure you want to sign out of CareerNest?</p>
        <div className="placement-signout-actions">
          <button type="button" className="placement-signout-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="placement-signout-confirm" onClick={onConfirm}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
