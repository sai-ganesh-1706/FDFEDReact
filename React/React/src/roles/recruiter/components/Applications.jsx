import React, { useState } from 'react';
import { Search, Star, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import CandidateModal from './CandidateModal';

export default function Applications({ 
  applications, 
  onUpdateStatus, 
  onUpdateRound,
  onUpdateEvaluation,
  selectedRoleFilter,
  setSelectedRoleFilter,
  onSchedule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReferred, setFilterReferred] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const statuses = ['All', 'Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered', 'Rejected'];

  // Extract unique roles from applications
  const uniqueRoles = ['All Roles', ...new Set(applications.map(a => a.role))];

  // Filtering logic
  const filtered = applications.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesReferred = !filterReferred || app.isReferred;
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesRole = !selectedRoleFilter || selectedRoleFilter === 'All Roles' || app.role === selectedRoleFilter;

    return matchesSearch && matchesReferred && matchesStatus && matchesRole;
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Candidate Applications</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
          Review candidate resumes, evaluate test scores, and manage hiring pipeline stages.
        </p>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="filter-toolbar">
        <div className="search-box-wrap">
          <Search size={16} color="#9CA3AF" />
          <input 
            type="text" 
            placeholder="Search by candidate name, branch, or role..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          {/* Role Filter */}
          <select 
            className="form-select"
            style={{ padding: '8px 12px', fontSize: '13px' }}
            value={selectedRoleFilter || 'All Roles'}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Referred only */}
          <button 
            type="button"
            className={`btn-filter-pill ${filterReferred ? 'active' : ''}`}
            onClick={() => setFilterReferred(!filterReferred)}
          >
            <Star size={14} fill={filterReferred ? '#F59E0B' : 'none'} color={filterReferred ? '#F59E0B' : '#6B7280'} />
            <span>Referred Only</span>
          </button>
        </div>
      </div>

      {/* STATUS TABS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        {statuses.map((st) => {
          const count = st === 'All' 
            ? applications.length 
            : applications.filter(a => a.status === st).length;
          const isActive = statusFilter === st;
          return (
            <button
              key={st}
              type="button"
              className={`btn-filter-pill ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? '#0F8F63' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                borderColor: isActive ? '#0F8F63' : '#E5E7EB'
              }}
              onClick={() => setStatusFilter(st)}
            >
              <span>{st}</span>
              <span style={{ 
                background: isActive ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                color: isActive ? 'white' : '#6B7280',
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px', fontWeight: 600 }}>
        Showing {filtered.length} candidates
      </div>

      {/* APPLICATIONS LIST */}
      <div className="applications-list-wrap">
        {filtered.map((app) => {
          const statusClass = (app.status || 'applied').toLowerCase();
          return (
            <div key={app.id} className="app-card-detailed">
              <div className="app-card-left" onClick={() => setSelectedCandidate(app)}>
                <div className="app-card-avatar">{app.initials}</div>
                <div className="app-card-content">
                  <h4>
                    <span>{app.name}</span>
                    {app.isReferred && <span className="tag-referred-badge">⭐ Referred</span>}
                  </h4>
                  <p className="app-card-metadata">
                    {app.branch} · CGPA: <strong>{app.cgpa}</strong> · Role: <strong>{app.role}</strong>
                  </p>
                  {app.isReferred && app.referrerName && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      color: '#92400E',
                    }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: app.referrerAvatarColor || '#D97706',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}>
                        {app.referrerInitials || app.referrerName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span>
                        Referred by <strong>{app.referrerName}</strong>{app.referrerDesignation ? ` · ${app.referrerDesignation}` : ''}
                        {app.referrerCompany && <span> · {app.referrerCompany}</span>}
                        {app.referrerBatch && <span> · {app.referrerBatch}</span>}
                      </span>
                    </div>
                  )}
                </div>
              </div>

 <div className="app-card-right" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {onSchedule && ['Shortlisted', 'Interview'].includes(app.status) && (
                  <button
                    className="btn-secondary-action"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => onSchedule(app.id)}
                    title="Schedule an assessment or interview for this candidate"
                  >
                    Schedule
                  </button>
                )}
                <button 
                  className={`badge-status ${statusClass}`}
                  onClick={() => setSelectedCandidate(app)}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {app.status} ▾
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>No candidates match the specified filter criteria.</p>
          </div>
        )}
      </div>

      {/* Candidate Evaluation Modal */}
      {selectedCandidate && (
        <CandidateModal 
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStatus={(id, newStatus) => {
            onUpdateStatus(id, newStatus);
            setSelectedCandidate(prev => prev ? { ...prev, status: newStatus } : null);
          }}
          onUpdateRound={(id, roundKey, val) => {
            onUpdateRound(id, roundKey, val);
            setSelectedCandidate(prev => prev ? {
              ...prev,
              rounds: { ...prev.rounds, [roundKey]: val }
            } : null);
          }}
          onUpdateEvaluation={(id, evalMetrics, feedback, sent) => {
            if (onUpdateEvaluation) {
              onUpdateEvaluation(id, evalMetrics, feedback, sent);
            }
            setSelectedCandidate(prev => prev ? {
              ...prev,
              evaluation: evalMetrics,
              ...(feedback !== undefined ? { recruiterFeedback: feedback } : {}),
              ...(sent !== undefined ? { feedbackSent: sent } : {})
            } : null);
          }}
        />
      )}
    </div>
  );
}
