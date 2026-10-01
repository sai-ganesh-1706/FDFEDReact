import React from 'react';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="signout-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="signout-popup">
        <div className="signout-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <div className="signout-title">Sign Out</div>
        <div className="signout-msg">Are you sure you want to sign out of CareerNest?</div>
        <div className="signout-btns">
          <button type="button" className="signout-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="signout-confirm"
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                window.location.href = '../../login.html';
              }
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

