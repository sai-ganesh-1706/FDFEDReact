// Data Flow (roles/alumni/components/DeclineModal.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice) -> useSelector(selectDeclineModal) -> UI render
// User Actions -> dispatch(slice actions) -> Slice reducers/thunks -> Redux state update
import { useDispatch, useSelector } from 'react-redux';
import {
  resetDeclineModal,
  selectDeclineModal,
  setDeclineError,
  setDeclineReason,
} from '../store/alumniSlice.js';

export default function DeclineModal({ isOpen, candidateName, onClose, onConfirm }) {
  const dispatch = useDispatch();
  const { reason, error } = useSelector(selectDeclineModal);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const words = reason.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount < 10) {
      dispatch(setDeclineError(`Reason must be at least 10 words. (${wordCount}/10)`));
      return;
    }

    onConfirm(reason.trim());
    dispatch(resetDeclineModal());
  };

  return (
    <div
      className="decline-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="decline-modal">
        <div className="decline-modal-header">
          <div className="decline-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e60000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Decline Application</span>
          </div>
          <button
            type="button"
            className="resume-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <div className="decline-warning">
          <strong>Warning:</strong> You are about to decline <strong>{candidateName}</strong>'s application. Please provide a reason for the rejection.
        </div>

        <label className="decline-label" htmlFor="decline-reason-input">
          Remarks / Reason for Decline <span style={{ color: '#e60000' }}>*</span>
        </label>
        <textarea
          id="decline-reason-input"
          className="decline-textarea"
          placeholder="Enter the reason for declining this candidate's application..."
          value={reason}
          onChange={(e) => dispatch(setDeclineReason(e.target.value))}
          style={error ? { borderColor: '#e60000', boxShadow: '0 0 0 3px rgba(230,0,0,0.15)' } : {}}
        />
        {error && <div className="decline-error">{error}</div>}

        <div className="decline-modal-actions">
          <button type="button" className="decline-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="decline-confirm-btn" onClick={handleConfirm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span>Confirm Decline</span>
          </button>
        </div>
      </div>
    </div>
  );
}

