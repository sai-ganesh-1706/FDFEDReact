import { LogOut } from 'lucide-react';

export default function SignOutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="sa-signout-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="sa-signout-card" role="dialog" aria-modal="true" aria-labelledby="sa-signout-title">
        <div className="sa-signout-icon" aria-hidden="true"><LogOut size={27} /></div>
        <h2 id="sa-signout-title">Sign Out</h2>
        <p>Are you sure you want to sign out of CareerNest?</p>
        <div className="sa-signout-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="sa-signout-confirm" onClick={onConfirm}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
