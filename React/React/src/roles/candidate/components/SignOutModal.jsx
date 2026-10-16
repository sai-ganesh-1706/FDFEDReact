import { LogOut } from 'lucide-react';
import { clearSession } from '../../../services/api.js';

export default function SignOutModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const confirmSignOut = () => {
        clearSession();
        window.location.replace('/login');
    };

    return (
        <div className="candidate-signout-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className="candidate-signout-card" role="dialog" aria-modal="true" aria-labelledby="candidate-signout-title">
                <div className="candidate-signout-icon" aria-hidden="true"><LogOut size={27} /></div>
                <h2 id="candidate-signout-title">Sign Out</h2>
                <p>Are you sure you want to sign out of CareerNest?</p>
                <div className="candidate-signout-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button type="button" className="candidate-signout-confirm" onClick={confirmSignOut}>Sign Out</button>
                </div>
            </div>
        </div>
    );
}
