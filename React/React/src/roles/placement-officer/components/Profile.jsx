import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import api, { errorMessage, readSession } from '../../../services/api.js';
import { useOfficerData } from '../services/officerApi';
import ChangePasswordModal from '../../../shared/components/ChangePasswordModal';


/* ── Validation helpers ─────────────────────────────── */
const EMAIL_REGEX = /^[a-zA-Z0-9]+([._%+-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{10,16}$/;
const NAME_REGEX  = /^[A-Za-z\s.'\-]{2,60}$/;

function validate(form) {
  const errors = {};
  const nameTrim = form.name.trim();
  const emailTrim = form.email.trim();
  const phoneTrim = form.phone.trim();
  const empIdTrim = form.employeeId.trim();
  const instTrim = form.institution.trim();
  const deptTrim = form.department.trim();
  const locTrim = form.location.trim();

  if (!nameTrim) {
    errors.name = 'Full name is required.';
  } else if (!NAME_REGEX.test(nameTrim)) {
    errors.name = 'Name must contain only letters, spaces, or dots (2–60 characters).';
  }

  if (!emailTrim) {
    errors.email = 'Email address is required.';
  } else if (!/^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@college\.edu$/i.test(emailTrim)) {
    errors.email = 'Placement Officer email must strictly end with @college.edu (e.g. rajesh@college.edu).';
  }

  if (phoneTrim) {
    const digits = phoneTrim.replace(/\D/g, '');
    if (!PHONE_REGEX.test(phoneTrim) || digits.length < 10) {
      errors.phone = 'Enter a valid phone number with at least 10 digits (e.g. +91 98765 43210).';
    }
  }

  const EMP_ID_REGEX = /^[A-Za-z]{2,5}-[A-Za-z]{2,5}-\d{4}-\d{2,4}$/;
  if (!empIdTrim) {
    errors.employeeId = 'Employee ID is required.';
  } else if (!EMP_ID_REGEX.test(empIdTrim)) {
    errors.employeeId = 'Employee ID must match institutional format: NIT-TPO-YYYY-XXX (e.g. NIT-TPO-2018-042).';
  }

  if (!instTrim) {
    errors.institution = 'Institution is required.';
  } else if (instTrim.length < 3) {
    errors.institution = 'Institution must be at least 3 characters.';
  }

  if (!deptTrim) {
    errors.department = 'Department is required.';
  } else if (deptTrim.length < 2) {
    errors.department = 'Department must be at least 2 characters.';
  }

  if (!locTrim) {
    errors.location = 'Location is required.';
  } else if (locTrim.length < 2) {
    errors.location = 'Location must be at least 2 characters.';
  }

  if (form.linkedin && !/^https?:\/\/.+\..+/.test(form.linkedin) && !form.linkedin.startsWith('linkedin.com')) {
    errors.linkedin = 'Enter a valid LinkedIn URL.';
  }

  if (form.website && !/^https?:\/\/.+\..+/.test(form.website) && !form.website.includes('.')) {
    errors.website = 'Enter a valid website URL.';
  }

  return errors;
}

/* ── Styled input helper ─────────────────────────────── */
function FieldGroup({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontWeight: 600, fontSize: '12px',
        color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px'
      }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function StyledInput({ hasError, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block', width: '100%', boxSizing: 'border-box',
        padding: '10px 12px', fontSize: '14px', color: '#1e2939',
        borderRadius: '8px', fontFamily: 'inherit', outline: 'none',
        border: `1.5px solid ${hasError ? '#ef4444' : focused ? '#7c3aed' : '#d1d5db'}`,
        boxShadow: focused ? `0 0 0 3px rgba(${hasError ? '239,68,68' : '124,58,237'},.1)` : 'none',
        background: '#fff', transition: 'border-color .15s, box-shadow .15s',
      }}
    />
  );
}

function StyledTextarea({ hasError, rows = 3, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      rows={rows}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        display: 'block', width: '100%', boxSizing: 'border-box',
        padding: '10px 12px', fontSize: '14px', color: '#1e2939',
        borderRadius: '8px', fontFamily: 'inherit', outline: 'none', resize: 'vertical',
        border: `1.5px solid ${hasError ? '#ef4444' : focused ? '#7c3aed' : '#d1d5db'}`,
        boxShadow: focused ? `0 0 0 3px rgba(${hasError ? '239,68,68' : '124,58,237'},.1)` : 'none',
        background: '#fff', transition: 'border-color .15s, box-shadow .15s',
      }}
    />
  );
}

function SectionEditButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      style={{
        padding: '5px 12px', background: '#f5f3ff', border: '1.5px solid #e9d5ff',
        borderRadius: '8px', color: '#7c3aed', fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', transition: 'background .15s',
      }}
      onMouseEnter={(event) => { event.currentTarget.style.background = '#ede9fe'; }}
      onMouseLeave={(event) => { event.currentTarget.style.background = '#f5f3ff'; }}
    >
      Edit
    </button>
  );
}

function InlineEditActions({ onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '14px' }}>
      <button type="button" onClick={onCancel} style={{ padding: '7px 12px', border: '1px solid #d1d5db', borderRadius: '7px', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
      <button type="button" onClick={onSave} style={{ padding: '7px 12px', border: 0, borderRadius: '7px', background: '#7c3aed', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Save</button>
    </div>
  );
}

/* ── Edit Profile Modal ──────────────────────────────── */
function EditProfileModal({ userData, onSave, onClose }) {
  const educationToText = (education = []) => education
    .map((item) => [item.degree, item.institution, item.year].filter(Boolean).join(' | '))
    .join('\n');
  const achievementsToText = (achievements = []) => achievements
    .map((item) => [item.title, item.desc].filter(Boolean).join(' | '))
    .join('\n');
  const [form, setForm] = useState({
    name:        userData.name        || '',
    email:       userData.email       || '',
    phone:       userData.phone       || '',
    institution: userData.institution || '',
    department:  userData.department  || '',
    location:    userData.location    || '',
    employeeId:  userData.employeeId  || '',
    bio:         userData.bio         || '',
    linkedin:    userData.social?.linkedin || '',
    website:     userData.social?.website  || '',
    educationText: educationToText(userData.education),
    skillsText: userData.skills?.join(', ') || '',
    achievementsText: achievementsToText(userData.achievements),
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setField = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    // Clear error on change
    if (errors[key]) setErrors(err => ({ ...err, [key]: undefined }));
  };

  const handleBlur = (key) => () => {
    setTouched(t => ({ ...t, [key]: true }));
    const fieldErrors = validate(form);
    setErrors(prev => ({ ...prev, [key]: fieldErrors[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = validate(form);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Mark all fields touched so errors show
      const allTouched = Object.fromEntries(Object.keys(form).map(k => [k, true]));
      setTouched(allTouched);
      return;
    }
    const toRows = (value) => value.split('\n').map((row) => row.trim()).filter(Boolean);
    onSave({
      ...form,
      education: toRows(form.educationText).map((row) => {
        const [degree = '', institution = '', year = ''] = row.split('|').map((part) => part.trim());
        return { degree, institution, year };
      }),
      skills: form.skillsText.split(',').map((skill) => skill.trim()).filter(Boolean),
      achievements: toRows(form.achievementsText).map((row) => {
        const [title = '', desc = ''] = row.split('|').map((part) => part.trim());
        return { title, desc };
      }),
    });
  };

  const fieldError = (key) => touched[key] ? errors[key] : undefined;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '580px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,.3)',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e2939' }}>
              ✏️ Edit Profile
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9ca3af' }}>
              Update your personal and professional information.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1, padding: '4px' }}
          >×</button>
        </div>

        {/* Security notice */}
        <div style={{
          margin: '16px 24px 0',
          padding: '10px 14px',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '10px', fontSize: '12px', color: '#1d4ed8',
          display: 'flex', alignItems: 'flex-start', gap: '8px', flexShrink: 0,
        }}>
          <span style={{ flexShrink: 0, marginTop: '1px' }}>🔒</span>
          <span>
            <strong>Security Notice:</strong> Changes to your email and Employee ID affect your login credentials.
            Ensure all information is accurate before saving.
          </span>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FieldGroup label="Full Name" required error={fieldError('name')}>
              <StyledInput
                type="text" placeholder="Dr. Rajesh Nair"
                value={form.name} onChange={setField('name')} onBlur={handleBlur('name')}
                hasError={!!fieldError('name')}
              />
            </FieldGroup>

            <FieldGroup label="Employee ID" required error={fieldError('employeeId')}>
              <StyledInput
                type="text" placeholder="NIT-TPO-2018-042"
                value={form.employeeId} onChange={setField('employeeId')} onBlur={handleBlur('employeeId')}
                hasError={!!fieldError('employeeId')}
              />
            </FieldGroup>

            <FieldGroup label="Email Address" required error={fieldError('email')}>
              <StyledInput
                type="email" placeholder="name@college.edu"
                value={form.email} onChange={setField('email')} onBlur={handleBlur('email')}
                hasError={!!fieldError('email')}
              />
            </FieldGroup>

            <FieldGroup label="Phone Number" error={fieldError('phone')}>
              <StyledInput
                type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={setField('phone')} onBlur={handleBlur('phone')}
                hasError={!!fieldError('phone')}
              />
            </FieldGroup>

            <FieldGroup label="Institution" required error={fieldError('institution')}>
              <StyledInput
                type="text" placeholder="e.g. NIT Calicut"
                value={form.institution} onChange={setField('institution')} onBlur={handleBlur('institution')}
                hasError={!!fieldError('institution')}
              />
            </FieldGroup>

            <FieldGroup label="Department" required error={fieldError('department')}>
              <StyledInput
                type="text" placeholder="e.g. Training & Placement Cell"
                value={form.department} onChange={setField('department')} onBlur={handleBlur('department')}
                hasError={!!fieldError('department')}
              />
            </FieldGroup>

            <FieldGroup label="Location" required error={fieldError('location')}>
              <StyledInput
                type="text" placeholder="e.g. Calicut, Kerala"
                value={form.location} onChange={setField('location')} onBlur={handleBlur('location')}
                hasError={!!fieldError('location')}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Bio / About" error={fieldError('bio')}>
            <StyledTextarea
              rows={3} placeholder="Short professional bio..."
              value={form.bio} onChange={setField('bio')} onBlur={handleBlur('bio')}
              hasError={!!fieldError('bio')}
            />
          </FieldGroup>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', margin: '4px 0 12px' }}>
            Professional Links (Optional)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FieldGroup label="LinkedIn URL" error={fieldError('linkedin')}>
              <StyledInput
                type="text" placeholder="linkedin.com/in/yourname"
                value={form.linkedin} onChange={setField('linkedin')} onBlur={handleBlur('linkedin')}
                hasError={!!fieldError('linkedin')}
              />
            </FieldGroup>

            <FieldGroup label="Website URL" error={fieldError('website')}>
              <StyledInput
                type="text" placeholder="tpo.college.ac.in"
                value={form.website} onChange={setField('website')} onBlur={handleBlur('website')}
                hasError={!!fieldError('website')}
              />
            </FieldGroup>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', margin: '4px 0 12px' }}>
            Qualifications & Expertise
          </p>
          <FieldGroup label="Education">
            <StyledTextarea
              rows={3} placeholder={'One qualification per line: Degree | Institution | Year\nExample: M.Tech | NIT Calicut | 2012'}
              value={form.educationText} onChange={setField('educationText')}
            />
          </FieldGroup>
          <FieldGroup label="Skills & Expertise">
            <StyledInput
              type="text" placeholder="e.g. Campus Recruitment, Employer Relations, Career Counseling"
              value={form.skillsText} onChange={setField('skillsText')}
            />
          </FieldGroup>
          <FieldGroup label="Achievements & Honors">
            <StyledTextarea
              rows={3} placeholder={'One achievement per line: Title | Description\nExample: Placement Excellence Award | Recognized for placement outcomes'}
              value={form.achievementsText} onChange={setField('achievementsText')}
            />
          </FieldGroup>
        </form>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #e5e7eb',
          display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124,58,237,.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            💾 Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Profile Component ──────────────────────────── */
export default function Profile({ onNavigate, activePage = 'profile' }) {
  const session = readSession() || {};
  const initialsOf = (name = '') => name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const [userData, setUserData] = useState({
    name: session.name || '', email: session.email || '', initials: initialsOf(session.name),
    role: 'Placement Officer', phone: '', department: '', institution: '', employeeId: '', joined: '',
    location: '', bio: '', education: [], skills: [], achievements: [], activity: {}, social: {},
  });
  const { data: officerData } = useOfficerData();

  useEffect(() => {
    api.get(`/users/${session.id}`).then(({ data: user }) => {
      const extra = user.resumeData?.officerProfile || {};
      setUserData({
        name: user.name, email: user.email, initials: user.avatar || initialsOf(user.name),
        role: user.headline || 'Placement Officer', phone: user.phone || '',
        department: user.department || '', institution: user.university || '',
        employeeId: extra.employeeId || '', joined: user.joinedDate || '',
        location: user.location || '', bio: user.about || '',
        education: extra.education || [], skills: extra.skills || [], achievements: extra.achievements || [],
        activity: {}, social: { linkedin: user.socialLinks?.linkedin || '', website: user.socialLinks?.portfolio || '' },
      });
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [editingSection, setEditingSection] = useState(null);
  const [draft, setDraft] = useState({});
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const act = userData.activity || {};

  const stats = officerData.stats;
  const actItems = [
    { label: 'Drives Managed',       value: stats.published,                                              color: '#7c3aed' },
    { label: 'Students Placed',      value: stats.offersAccepted,                                         color: '#10b981' },
    { label: 'Recruiters Onboarded', value: (officerData.recruiters || []).filter(r => r.status === 'active').length, color: '#3b82f6' },
    { label: 'Total Applications',   value: stats.totalApps,                                              color: '#f59e0b' },
    { label: 'Placement Rate',       value: `${stats.placementRate}%`,                                    color: '#ec4899' },
    { label: 'Candidates',           value: stats.totalCandidates,                                        color: '#06b6d4' },
  ];

  const startInlineEdit = (section) => {
    const educationText = (userData.education || []).map((item) => [item.degree, item.institution, item.year].filter(Boolean).join(' | ')).join('\n');
    const achievementsText = (userData.achievements || []).map((item) => [item.title, item.desc].filter(Boolean).join(' | ')).join('\n');
    const drafts = {
      personal: { name: userData.name, email: userData.email, phone: userData.phone, institution: userData.institution, department: userData.department, location: userData.location, employeeId: userData.employeeId },
      about: { bio: userData.bio },
      education: { educationText },
      achievements: { achievementsText },
      skills: { skillsText: (userData.skills || []).join(', ') },
      links: { linkedin: userData.social?.linkedin || '', website: userData.social?.website || '' },
    };
    setDraft(drafts[section] || {});
    setEditingSection(section);
  };

  const updateDraft = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

  const handleSave = async (form) => {
    const next = {
      ...userData,
      name:        form.name,
      email:       form.email,
      phone:       form.phone,
      institution: form.institution,
      department:  form.department,
      location:    form.location,
      employeeId:  form.employeeId,
      bio:         form.bio,
      education:   form.education,
      skills:      form.skills,
      achievements: form.achievements,
      social: { linkedin: form.linkedin, website: form.website },
      initials: initialsOf(form.name),
    };
    try {
      await api.put(`/users/${session.id}`, {
        name: next.name, email: next.email, phone: next.phone, university: next.institution, department: next.department,
        location: next.location, about: next.bio,
        socialLinks: { linkedin: next.social.linkedin, portfolio: next.social.website },
        resumeData: { officerProfile: { employeeId: next.employeeId, education: next.education, skills: next.skills, achievements: next.achievements } },
      });
      localStorage.setItem('loggedInUser', JSON.stringify({ ...session, name: next.name, email: next.email }));
      setUserData(next);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (error) {
      window.alert(errorMessage(error, 'Could not save your profile.'));
    }
  };

  const saveInlineEdit = async () => {
    const baseForm = {
      name: userData.name, email: userData.email, phone: userData.phone, institution: userData.institution,
      department: userData.department, location: userData.location, employeeId: userData.employeeId,
      bio: userData.bio, education: userData.education, skills: userData.skills, achievements: userData.achievements,
      linkedin: userData.social?.linkedin || '', website: userData.social?.website || '',
    };
    if (editingSection === 'personal') Object.assign(baseForm, draft);
    if (editingSection === 'about') baseForm.bio = draft.bio || '';
    if (editingSection === 'education') {
      baseForm.education = (draft.educationText || '').split('\n').map((row) => row.trim()).filter(Boolean).map((row) => {
        const [degree = '', institution = '', year = ''] = row.split('|').map((part) => part.trim());
        return { degree, institution, year };
      });
    }
    if (editingSection === 'achievements') {
      baseForm.achievements = (draft.achievementsText || '').split('\n').map((row) => row.trim()).filter(Boolean).map((row) => {
        const [title = '', desc = ''] = row.split('|').map((part) => part.trim());
        return { title, desc };
      });
    }
    if (editingSection === 'skills') baseForm.skills = (draft.skillsText || '').split(',').map((skill) => skill.trim()).filter(Boolean);
    if (editingSection === 'links') { baseForm.linkedin = draft.linkedin || ''; baseForm.website = draft.website || ''; }
    await handleSave(baseForm);
    setEditingSection(null);
  };

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Placement Officer Profile" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
        {/* Back navigation button */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => onNavigate('p1')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', background: '#fff', border: '1px solid #e5e7eb',
              borderRadius: '8px', color: '#374151', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            ← Back to Dashboard
          </button>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            style={{
              padding: '9px 16px', background: '#fff', border: '1.5px solid #ddd6fe', borderRadius: '10px',
              color: '#6d28d9', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              marginLeft: 'auto', marginRight: '-2px',
            }}
          >
            Change Password
          </button>

          <button
            onClick={() => startInlineEdit('about')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '9px 20px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124,58,237,.3)', transition: 'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            ✏️ Edit Profile
          </button>
        </div>

        {/* Save success banner */}
        {saveSuccess && (
          <div style={{
            marginBottom: '16px', padding: '12px 18px',
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: '10px', color: '#166534', fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            Profile updated successfully.
          </div>
        )}

        {/* Hero Card */}
        <div className="hero-card" style={{ marginBottom: '24px' }}>
          <div className="pm-header">
            <div className="pm-avatar">{userData.initials || 'RN'}</div>
            <div className="pm-header-info">
              <h1 className="pm-name">{userData.name || 'Dr. Rajesh Nair'}</h1>
              <div className="pm-role-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                {userData.role || 'Senior Placement Officer'}
              </div>
            </div>
          </div>
          {editingSection === 'about' ? (
            <div style={{ marginTop: '18px' }}>
              <StyledTextarea rows={3} value={draft.bio || ''} onChange={updateDraft('bio')} placeholder="Short professional bio..." />
              <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
            </div>
          ) : (
            <div className="pm-bio">{userData.bio || 'Dedicated placement officer bridging academia and industry.'}</div>
          )}
        </div>

        {/* Two-Column: Personal Info & Activity Overview */}
        <div className="panels-row" style={{ marginBottom: '24px' }}>
          <div className="panel">
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <h3>Personal Information</h3>
              <button
                onClick={() => startInlineEdit('personal')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '5px 12px', background: '#f5f3ff', border: '1.5px solid #e9d5ff',
                  borderRadius: '8px', color: '#7c3aed', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
              >
                ✏️ Edit
              </button>
            </div>
            <div className="panel-body">
              {editingSection === 'personal' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                    <StyledInput value={draft.name || ''} onChange={updateDraft('name')} placeholder="Full name" />
                    <StyledInput type="email" value={draft.email || ''} onChange={updateDraft('email')} placeholder="Email address" />
                    <StyledInput value={draft.phone || ''} onChange={updateDraft('phone')} placeholder="Phone number" />
                    <StyledInput value={draft.employeeId || ''} onChange={updateDraft('employeeId')} placeholder="Employee ID" />
                    <StyledInput value={draft.institution || ''} onChange={updateDraft('institution')} placeholder="Institution" />
                    <StyledInput value={draft.department || ''} onChange={updateDraft('department')} placeholder="Department" />
                    <StyledInput value={draft.location || ''} onChange={updateDraft('location')} placeholder="Location" />
                  </div>
                  <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
                </>
              ) : <div className="pm-info-grid">
                <div className="pm-info-item">
                  <div className="pm-info-label">Email</div>
                  <div className="pm-info-value">{userData.email}</div>
                </div>
                <div className="pm-info-item">
                  <div className="pm-info-label">Phone</div>
                  <div className="pm-info-value">{userData.phone}</div>
                </div>
                <div className="pm-info-item">
                  <div className="pm-info-label">Institution</div>
                  <div className="pm-info-value">{userData.institution}</div>
                </div>
                <div className="pm-info-item">
                  <div className="pm-info-label">Department</div>
                  <div className="pm-info-value">{userData.department}</div>
                </div>
                <div className="pm-info-item">
                  <div className="pm-info-label">Location</div>
                  <div className="pm-info-value">{userData.location}</div>
                </div>
                <div className="pm-info-item">
                  <div className="pm-info-label">Employee ID</div>
                  <div className="pm-info-value">{userData.employeeId}</div>
                </div>
              </div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h3>Activity Overview</h3>
            </div>
            <div className="panel-body">
              <div className="pm-stats-grid">
                {actItems.map((item, idx) => (
                  <div className="pm-stat-item" key={idx}>
                    <div className="pm-stat-value" style={{ color: item.color }}>
                      {item.value}
                    </div>
                    <div className="pm-stat-label">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column: Education & Achievements + Skills & Links */}
        <div className="panels-row">
          <div className="panel">
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <h3>Education</h3>
              <SectionEditButton label="education" onClick={() => startInlineEdit('education')} />
            </div>
            <div className="panel-body">
              {editingSection === 'education' ? (
                <>
                  <StyledTextarea rows={4} value={draft.educationText || ''} onChange={updateDraft('educationText')} placeholder={'One qualification per line: Degree | Institution | Year'} />
                  <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
                </>
              ) : <div className="pm-edu-timeline">
                {(userData.education || []).map((ed, idx) => (
                  <div className="pm-edu-item" key={idx}>
                    <div className="pm-edu-dot" />
                    <div>
                      <div className="pm-edu-degree">{ed.degree}</div>
                      <div className="pm-edu-inst">{ed.institution} &bull; {ed.year}</div>
                    </div>
                  </div>
                ))}
              </div>}
            </div>

            <div className="panel-header" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', justifyContent: 'space-between' }}>
              <h3>Achievements &amp; Honors</h3>
              <SectionEditButton label="achievements" onClick={() => startInlineEdit('achievements')} />
            </div>
            <div className="panel-body">
              {editingSection === 'achievements' ? (
                <>
                  <StyledTextarea rows={4} value={draft.achievementsText || ''} onChange={updateDraft('achievementsText')} placeholder={'One achievement per line: Title | Description'} />
                  <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
                </>
              ) : <div className="pm-achieve-list">
                {(userData.achievements || []).map((a, idx) => (
                  <div className="pm-achieve-card" key={idx}>
                    <div className="pm-achieve-icon">🏆</div>
                    <div>
                      <div className="pm-achieve-title">{a.title}</div>
                      <div className="pm-achieve-desc">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header" style={{ justifyContent: 'space-between' }}>
              <h3>Skills &amp; Expertise</h3>
              <SectionEditButton label="skills and expertise" onClick={() => startInlineEdit('skills')} />
            </div>
            <div className="panel-body">
              {editingSection === 'skills' ? (
                <>
                  <StyledInput value={draft.skillsText || ''} onChange={updateDraft('skillsText')} placeholder="Separate skills with commas" />
                  <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
                </>
              ) : <div className="pm-skills-wrap">
                {(userData.skills || []).map((s, idx) => (
                  <span className="pm-skill" key={idx}>{s}</span>
                ))}
              </div>}
            </div>

            {userData.social && (
              <>
                <div className="panel-header" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', justifyContent: 'space-between' }}>
                  <h3>Professional Links</h3>
                  <SectionEditButton label="professional links" onClick={() => startInlineEdit('links')} />
                </div>
                <div className="panel-body">
                  {editingSection === 'links' ? (
                    <>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <StyledInput value={draft.linkedin || ''} onChange={updateDraft('linkedin')} placeholder="LinkedIn URL" />
                        <StyledInput value={draft.website || ''} onChange={updateDraft('website')} placeholder="Website URL" />
                      </div>
                      <InlineEditActions onSave={saveInlineEdit} onCancel={() => setEditingSection(null)} />
                    </>
                  ) : <div className="pm-social-row" style={{ flexDirection: 'column' }}>
                    {userData.social.linkedin && (
                      <a className="pm-social-link" href={`https://${userData.social.linkedin}`} target="_blank" rel="noreferrer">
                        🔗 LinkedIn Profile
                      </a>
                    )}
                    {userData.social.website && (
                      <a className="pm-social-link" href={`https://${userData.social.website}`} target="_blank" rel="noreferrer">
                        🌐 Institutional Webpage
                      </a>
                    )}
                  </div>}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userId={session.id}
      />
    </div>
  );
}
