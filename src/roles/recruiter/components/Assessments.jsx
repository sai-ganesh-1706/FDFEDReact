import React, { useState } from 'react';
import { Calendar, Video, Users, ExternalLink, Plus, Trash2, Mail } from 'lucide-react';
import ScheduleModal from './ScheduleModal';

export default function Assessments({ assessments, opportunities = [], onAddAssessment, onDeleteAssessment }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <div>
      <div className="assessments-header-banner">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>
            Assessments & Interviews
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            Schedule and coordinate coding tests, technical interviews, and HR discussions.
          </p>
        </div>
        <button 
          className="btn-primary-action"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setShowScheduleModal(true)}
        >
          <Plus size={16} />
          <span>Schedule New Round</span>
        </button>
      </div>

      {assessments.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>No assessment rounds currently scheduled.</p>
          <button className="btn-primary-action" onClick={() => setShowScheduleModal(true)}>
            Schedule First Round
          </button>
        </div>
      ) : (
        <div className="assessments-list-grid">
          {assessments.map((item) => (
            <div key={item.id} className="assessment-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="assessment-type-pill">{item.type}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2937', marginTop: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    Role: <strong>{item.role}</strong>
                  </p>
                </div>

                <button 
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                  title="Remove Round"
                  onClick={() => {
                    if (window.confirm(`Delete assessment round "${item.title}"?`)) {
                      onDeleteAssessment(item.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="assessment-meta-list">
                <div className="assessment-meta-item">
                  <Calendar size={15} color="#0F8F63" />
                  <span>{item.date} at {item.time} ({item.duration})</span>
                </div>

                <div className="assessment-meta-item">
                  <Video size={15} color="#4F46E5" />
                  <span>Platform: {item.platform}</span>
                </div>

                <div className="assessment-meta-item">
                  <Users size={15} color="#D97706" />
                  <span>{item.candidates} candidates invited</span>
                </div>

                {item.candidateEmail && (
                  <div className="assessment-meta-item">
                    <Mail size={15} color="#7C3AED" />
                    <span style={{ color: '#7C3AED', fontWeight: 500 }}>
                      For: {item.candidateEmail}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '6px', 
                    fontSize: '13px', 
                    color: '#0F8F63', 
                    fontWeight: 600, 
                    textDecoration: 'none',
                    padding: '8px',
                    background: '#ECFDF5',
                    borderRadius: '8px'
                  }}
                >
                  <span>Open Session Link</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal 
          onClose={() => setShowScheduleModal(false)}
          onAddAssessment={onAddAssessment}
          opportunities={opportunities}
        />
      )}
    </div>
  );
}
