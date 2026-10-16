import { LogOut } from 'lucide-react';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="recruiter-signout-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="recruiter-signout-card" role="dialog" aria-modal="true" aria-labelledby="recruiter-signout-title">
        <div className="recruiter-signout-icon" aria-hidden="true"><LogOut size={27} /></div>
        <h2 id="recruiter-signout-title">Sign Out</h2>
        <p>Are you sure you want to sign out of CareerNest?</p>
        <div className="recruiter-signout-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="recruiter-signout-confirm" onClick={onConfirm}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
