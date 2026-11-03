import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../../services/api.js';

export default function ResumeModal({ isOpen, onClose, candidateName = 'Candidate', candidate = null }) {
  const [documentUrl, setDocumentUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !candidate?.id) return;
    let active = true;
    let url = '';
    setDocumentUrl('');
    setFileType('');
    setError('');
    setLoading(true);
    api.get(`/applications/referrals/${candidate.id}/resume`, { responseType: 'blob' })
      .then(({ data }) => {
        if (!active) return;
        url = URL.createObjectURL(data);
        setDocumentUrl(url);
        setFileType(data.type);
      })
      .catch(async (failure) => {
        if (!active) return;
        let message = errorMessage(failure, 'Could not load the resume document.');
        if (failure.response?.data instanceof Blob) {
          try {
            const body = JSON.parse(await failure.response.data.text());
            message = Array.isArray(body.message) ? body.message.join(', ') : body.message || message;
          } catch { /* Keep the standard error. */ }
        }
        if (active) setError(message);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [isOpen, candidate?.id]);

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
