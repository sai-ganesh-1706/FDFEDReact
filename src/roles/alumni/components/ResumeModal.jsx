import React from 'react';

export default function ResumeModal({ isOpen, onClose, resumeUrl = 'test_resume.pdf', candidateName = 'Candidate' }) {
  if (!isOpen) return null;

  return (
    <div
      className="resume-modal-overlay"
      style={{ display: 'flex' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="resume-modal">
        <div className="resume-modal-header">
          <div className="resume-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e76a00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>{candidateName} Resume</span>
          </div>
          <div className="resume-modal-actions-top">
            <a href={resumeUrl} download className="resume-download-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </a>
            <button
              type="button"
              className="resume-modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="resume-modal-body">
          <iframe
            src={resumeUrl}
            className="resume-iframe"
            title={`${candidateName} Resume Document`}
          />
        </div>
      </div>
    </div>
  );
}

