import { LogOut } from 'lucide-react';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="ca-signout-overlay"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className="ca-signout-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ca-signout-title"
      >
        <div className="ca-signout-icon" aria-hidden="true"><LogOut size={27} /></div>
        <h2 id="ca-signout-title">Sign Out</h2>
        <p>Are you sure you want to sign out of CareerNest?</p>
        <div className="ca-signout-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="ca-signout-confirm" onClick={onConfirm}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
