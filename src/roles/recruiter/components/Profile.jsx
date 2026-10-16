import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Edit3, Check } from 'lucide-react';

export default function Profile({ recruiter, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...recruiter });

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Recruiter Profile</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
          Manage your personal information, company profile, and communication channels.
        </p>
      </div>

      <div className="profile-card-full">
        <div className="profile-top-wrap">
          <div className="profile-avatar-large">
            {recruiter.avatar || 'PK'}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937' }}>
              {recruiter.name}
            </h3>
            <p style={{ fontSize: '14px', color: '#0F8F63', fontWeight: 600 }}>
              {recruiter.role} at {recruiter.company}
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              Member since {recruiter.joinedDate || 'January 2024'}
            </p>
          </div>

          <button 
            type="button"
            className="btn-secondary-action"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit3 size={15} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Designation / Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Office Location</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-secondary-action"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary-action">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details-grid">
            <div className="profile-field-item">
              <label>Designation</label>
              <p>{recruiter.role}</p>
            </div>

            <div className="profile-field-item">
              <label>Organization</label>
              <p>{recruiter.company}</p>
            </div>

            <div className="profile-field-item">
              <label>Department</label>
              <p>{recruiter.department}</p>
            </div>

            <div className="profile-field-item">
              <label>Official Email</label>
              <p>{recruiter.email}</p>
            </div>

            <div className="profile-field-item">
              <label>Contact Phone</label>
              <p>{recruiter.phone}</p>
            </div>

            <div className="profile-field-item">
              <label>Location</label>
              <p>{recruiter.location}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
