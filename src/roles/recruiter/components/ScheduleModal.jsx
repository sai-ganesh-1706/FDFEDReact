import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ScheduleModal({ onClose, onAddAssessment, opportunities = [] }) {
  const [title, setTitle] = useState('');
  const [role, setRole] = useState(opportunities[0]?.title || 'Software Engineer');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('60 min');
  const [platform, setPlatform] = useState('Google Meet');
  const [type, setType] = useState('Technical Interview');
  const [link, setLink] = useState('');
  const [candidates, setCandidates] = useState('5');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Please fill out the round title and date.');
      return;
    }

    let formattedLink = link.trim();
    if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
      formattedLink = `https://${formattedLink}`;
    }

    const newAssessment = {
      id: Date.now(),
      title: title.trim(),
      role: role.trim(),
      candidateEmail: candidateEmail.trim(),
      date,
      time: time || '10:00 AM',
      duration,
      candidates: parseInt(candidates, 10) || 1,
      platform: platform.trim() || 'Online',
      link: formattedLink || 'https://meet.google.com',
      type,
      isDraft: false
    };

    onAddAssessment(newAssessment);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Schedule Assessment / Interview</h3>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Round Title *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Technical Round 1 - Problem Solving"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Target Role *</label>
            {opportunities.length > 0 ? (
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.title}>{opp.title}</option>
                ))}
                <option value="All Shortlisted Candidates">All Shortlisted Candidates</option>
              </select>
            ) : (
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label>Candidate Email ID</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. candidate@example.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
            />
            <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
              Optional — specify if this interview is for a single candidate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Date *</label>
              <input 
                type="date" 
                className="form-input" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input 
                type="time" 
                className="form-input" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Round Type</label>
              <select 
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Online Test">Online Test</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="HR Interview">HR Interview</option>
              </select>
            </div>

            <div className="form-group">
              <label>Platform</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Google Meet, HackerRank, etc."
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="form-group">
              <label>Duration</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 60 min"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Candidates Count</label>
              <input 
                type="number" 
                className="form-input" 
                min="1"
                value={candidates}
                onChange={(e) => setCandidates(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Meeting / Assessment Link</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://meet.google.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary-action" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-action">
              Schedule Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
