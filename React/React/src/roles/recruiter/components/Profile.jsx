import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Edit3, Check, AlertCircle } from 'lucide-react';

export default function Profile({ recruiter, onUpdateProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...recruiter });
  const [errors, setErrors] = useState({});

  const validate = (data = formData) => {
    const errs = {};

    // Full Name: only alphabets and spaces
    if (!data.name || !data.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(data.name.trim())) {
      errs.name = 'Full Name must contain only letters and spaces.';
    }

    // Company Name: only alphabets and spaces
    if (!data.company || !data.company.trim()) {
      errs.company = 'Company Name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(data.company.trim())) {
      errs.company = 'Company Name must contain only letters and spaces.';
    }

    // Designation / Role: only alphabets and spaces
    if (!data.role || !data.role.trim()) {
      errs.role = 'Designation is required.';
    } else if (!/^[A-Za-z\s]+$/.test(data.role.trim())) {
      errs.role = 'Designation must contain only letters and spaces.';
    }

    // Department: only alphabets and spaces
    if (!data.department || !data.department.trim()) {
      errs.department = 'Department is required.';
    } else if (!/^[A-Za-z\s]+$/.test(data.department.trim())) {
      errs.department = 'Department must contain only letters and spaces.';
    }

    // Email Address: valid email format
    if (!data.email || !data.email.trim()) {
      errs.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    // Phone Number: only digits
    if (!data.phone || !data.phone.trim()) {
      errs.phone = 'Phone Number is required.';
    } else if (!/^\d+$/.test(data.phone.trim())) {
      errs.phone = 'Phone Number must contain only digits.';
    }

    return errs;
  };

  const handleToggleEdit = () => {
    if (!isEditing) {
      const initialData = { ...recruiter };
      setFormData(initialData);
      setErrors(validate(initialData));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setErrors({});
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    const errs = validate(updated);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      return;
    }
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
            onClick={handleToggleEdit}
          >
            <Edit3 size={15} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} noValidate>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className={`form-input${errors.name ? ' input-error' : ''}`}
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                {errors.name && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  className={`form-input${errors.company ? ' input-error' : ''}`}
                  value={formData.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
                {errors.company && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.company}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Designation / Role</label>
                <input 
                  type="text" 
                  className={`form-input${errors.role ? ' input-error' : ''}`}
                  value={formData.role || ''}
                  onChange={(e) => handleChange('role', e.target.value)}
                />
                {errors.role && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.role}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Department</label>
                <input 
                  type="text" 
                  className={`form-input${errors.department ? ' input-error' : ''}`}
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                />
                {errors.department && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.department}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className={`form-input${errors.email ? ' input-error' : ''}`}
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
                {errors.email && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className={`form-input${errors.phone ? ' input-error' : ''}`}
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
                {errors.phone && (
                  <span className="field-error" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} /> {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-group full-width">
                <label>Office Location</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn-secondary-action"
                onClick={() => {
                  setIsEditing(false);
                  setErrors({});
                }}
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
