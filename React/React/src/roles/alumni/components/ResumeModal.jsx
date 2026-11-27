// Data Flow (roles/alumni/components/ResumeModal.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice, referralsSlice) -> useSelector(selectResumeModal) -> UI render
// User Actions -> dispatch(fetchReferralResume, createObjectURL) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { errorMessage } from '../../../services/api.js';
import {
  resetResumeModal,
  selectResumeModal,
  setResumeDocument,
  setResumeError,
  setResumeLoading,
} from '../store/alumniSlice.js';
import { fetchReferralResume } from '../../../store/slices/referralsSlice.js';

export default function ResumeModal({ isOpen, onClose, candidateName = 'Candidate', candidate = null }) {
  const dispatch = useDispatch();
  const { documentUrl, fileType, error, loading } = useSelector(selectResumeModal);

  useEffect(() => {
    dispatch(resetResumeModal());
    if (!isOpen || !candidate?.id) {
      return;
    }
    let active = true;
    let url = '';
    dispatch(setResumeLoading(true));
    dispatch(fetchReferralResume(candidate.id))
      .unwrap()
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        dispatch(setResumeDocument({ documentUrl: url, fileType: blob.type }));
      })
      .catch((failure) => {
        if (!active) return;
        dispatch(setResumeError(errorMessage(failure, 'Could not load the resume document.')));
      })
      .finally(() => {
        if (active) dispatch(setResumeLoading(false));
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [dispatch, isOpen, candidate?.id]);

  if (!isOpen) return null;
  const isPdf = fileType === 'application/pdf';
  const extension = isPdf ? 'pdf' : fileType.includes('wordprocessingml') ? 'docx' : 'doc';
  const downloadName = `${(candidateName || 'Candidate').replace(/[^a-z0-9_-]+/gi, '_')}_Resume.${extension}`;

  return (
    <div className="resume-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="resume-modal" role="dialog" aria-modal="true" aria-labelledby="alumni-resume-title">
        <div className="resume-modal-header">
          <div className="resume-modal-title" id="alumni-resume-title">{candidateName}'s applied resume</div>
          <div className="resume-modal-actions-top">
            {documentUrl && <a className="resume-download-btn" href={documentUrl} download={downloadName}>Download resume</a>}
            <button type="button" className="resume-modal-close" onClick={onClose} aria-label="Close resume">×</button>
          </div>
        </div>
        <div className="resume-modal-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loading && <p>Loading the resume submitted with this application…</p>}
          {!loading && error && <p role="alert" style={{ padding: 24, textAlign: 'center' }}>{error}</p>}
          {!loading && documentUrl && (isPdf
            ? <iframe title={`${candidateName}'s applied resume`} src={documentUrl} className="resume-iframe" />
            : <p style={{ padding: 24, textAlign: 'center' }}>This Word document is available to download. PDF resumes can be previewed here.</p>)}
        </div>
      </section>
    </div>
  );
}
