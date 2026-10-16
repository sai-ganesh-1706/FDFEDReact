import React, { useState } from 'react';
import { MapPin, Calendar, Plus, Trash2, Users, Edit3, X } from 'lucide-react';

export default function MyOpportunities({ 
  opportunities, 
  onUpdateOpportunity,
  onDeleteOpportunity, 
  setActiveTab,
  setSelectedRoleFilter 
}) {
  const [editingOpp, setEditingOpp] = useState(null);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingOpp) return;
    if (onUpdateOpportunity) {
      onUpdateOpportunity(editingOpp);
    }
    setEditingOpp(null);
  };

  const handleToggleStatus = (opp) => {
    const nextStatus = opp.status === 'Published' ? 'Closed' : 'Published';
    if (onUpdateOpportunity) {
      onUpdateOpportunity({ ...opp, status: nextStatus });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>My Opportunities</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            Manage published job openings, track real-time applicants, and edit hiring requirements.
          </p>
        </div>
        <button 
          className="btn-primary-action"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => setActiveTab('post')}
        >
          <Plus size={16} />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {opportunities.length === 0 ? (
        <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '16px' }}>No active opportunities posted yet.</p>
          <button className="btn-primary-action" onClick={() => setActiveTab('post')}>
            Post Your First Opportunity
          </button>
        </div>
      ) : (
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <div key={opp.id} className="opp-card-custom">
              <div className="opp-card-top">
                <h3 className="opp-card-title">{opp.title}</h3>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ 
                    background: '#EFF6FF', 
                    color: '#1D4ED8', 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    padding: '3px 8px', 
                    borderRadius: '12px' 
                  }}>
                    {opp.type}
                  </span>
                  <button 
                    type="button"
                    onClick={() => handleToggleStatus(opp)}
                    title="Click to toggle status"
                    className={`badge-status ${(opp.status || 'published').toLowerCase()}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {opp.status}
                  </button>
                </div>
              </div>

              <div className="opp-card-meta">
                <div className="meta-row">
                  <MapPin size={15} />
                  <span>{opp.location}</span>
                </div>
                <div className="meta-row">
                  <Calendar size={15} />
                  <span>Deadline: {opp.deadline} · <strong>{opp.applications}</strong> applicants</span>
                </div>
              </div>

              <div className="opp-details-grid">
                <div className="detail-col">
                  <h5>Compensation</h5>
                  <p>{opp.ctc}</p>
                </div>
                <div className="detail-col">
                  <h5>Openings</h5>
                  <p>{opp.openings}</p>
                </div>
                <div className="detail-col">
                  <h5>Min CGPA</h5>
                  <p>{opp.cgpa || '0'}</p>
                </div>
                <div className="detail-col">
                  <h5>Branches</h5>
                  <p>
                    {Array.isArray(opp.branches) ? opp.branches.join(', ') : 'All'}
                  </p>
                </div>
              </div>

              <div className="opp-actions-row">
                <button 
                  className="btn-view-apps"
                  onClick={() => {
                    if (setSelectedRoleFilter) {
                      setSelectedRoleFilter(opp.title);
                    }
                    setActiveTab('applications');
                  }}
                >
                  <Users size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  View Applications ({opp.applications || 0})
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn-secondary-action"
                    style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Edit Opportunity"
                    onClick={() => setEditingOpp({ ...opp })}
                  >
                    <Edit3 size={15} />
                  </button>

                  <button 
                    className="btn-delete-opp"
                    title="Delete Opportunity"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove "${opp.title}"?`)) {
                        onDeleteOpportunity(opp.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT OPPORTUNITY MODAL */}
      {editingOpp && (
        <div className="modal-backdrop" onClick={() => setEditingOpp(null)}>
          <div className="modal-content-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Opportunity: {editingOpp.title}</h3>
              <button className="btn-close-modal" onClick={() => setEditingOpp(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingOpp.title}
                    onChange={(e) => setEditingOpp({ ...editingOpp, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="form-select"
                    value={editingOpp.type}
                    onChange={(e) => setEditingOpp({ ...editingOpp, type: e.target.value })}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingOpp.location}
                    onChange={(e) => setEditingOpp({ ...editingOpp, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Compensation / CTC</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={editingOpp.ctc}
                    onChange={(e) => setEditingOpp({ ...editingOpp, ctc: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Openings</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={editingOpp.openings}
                    onChange={(e) => setEditingOpp({ ...editingOpp, openings: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum CGPA</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="form-input" 
                    value={editingOpp.cgpa}
                    onChange={(e) => setEditingOpp({ ...editingOpp, cgpa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={editingOpp.deadline}
                    onChange={(e) => setEditingOpp({ ...editingOpp, deadline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    className="form-select"
                    value={editingOpp.status}
                    onChange={(e) => setEditingOpp({ ...editingOpp, status: e.target.value })}
                  >
                    <option value="Published">Published</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary-action" onClick={() => setEditingOpp(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
