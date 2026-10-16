import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import './styles/p5.css';
import './styles/user-oversight.css';
import api, { errorMessage, readSession } from '../../../services/api.js';
import { useOfficerData, fromOversightUser } from '../services/officerApi';

/* ─── helpers ──────────────────────────────────────────────── */
const EMPTY_FORM = {
  name: '', email: '', status: 'active',
  roll: '', branch: '', cgpa: '', backlogs: '',
  company: '', batch: '', referrals: '',
  recCompany: '', recDesignation: '', recPhone: '', recLocation: '',
};

const safeNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const safeInteger = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
};

function Avatar({ name, size = 36 }) {
  const initials = name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?';
  const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#db2777', '#0891b2'];
  const bg = colors[name ? name.charCodeAt(0) % colors.length : 0];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: bg, color: '#fff', fontSize: size * 0.38,
      fontWeight: 700, flexShrink: 0, letterSpacing: '-.5px',
    }}>{initials}</span>
  );
}

/* ─── Field component with clear labels and error display ──── */
function Field({ label, required, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1.4 }}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function Input({ hasError, style, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = hasError ? '#ef4444' : focused ? '#7c3aed' : '#d1d5db';
  const boxShadow = hasError
    ? (focused ? '0 0 0 3px rgba(239,68,68,.2)' : '0 0 0 1px rgba(239,68,68,.3)')
    : (focused ? '0 0 0 3px rgba(124,58,237,.12)' : 'none');

  return (
    <input
      {...props}
      onFocus={(e) => {
        setFocused(true);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        if (onBlur) onBlur(e);
      }}
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e2939',
        background: '#fff',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color .15s, box-shadow .15s',
        ...style,
      }}
    />
  );
}

function Select({ hasError, style, onFocus, onBlur, value, onChange, children, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderColor = hasError ? '#ef4444' : focused ? '#7c3aed' : '#d1d5db';
  const boxShadow = hasError
    ? (focused ? '0 0 0 3px rgba(239,68,68,.2)' : '0 0 0 1px rgba(239,68,68,.3)')
    : (focused ? '0 0 0 3px rgba(124,58,237,.12)' : 'none');

  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={(e) => { setFocused(true); if (onFocus) onFocus(e); }}
      onBlur={(e) => { setFocused(false); if (onBlur) onBlur(e); }}
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        padding: '10px 12px',
        border: `1.5px solid ${borderColor}`,
        boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: '#1e2939',
        background: '#fff',
        fontFamily: 'inherit',
        outline: 'none',
        cursor: 'pointer',
        transition: 'border-color .15s, box-shadow .15s',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/* ─── Delete Confirmation Modal ────────────────────────────── */
function DeleteModal({ user, onConfirm, onCancel }) {
  if (!user) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
        animation: 'slideIn .25s ease',
      }}>
        {/* header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            flexShrink: 0, width: '44px', height: '44px', borderRadius: '50%',
            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#1e2939' }}>Remove User</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong style={{ color: '#1e2939' }}>{user.name}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* user preview */}
        <div style={{
          margin: '20px 24px', padding: '14px 16px',
          background: '#fafafa', border: '1px solid #f3f4f6', borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <Avatar name={user.name} size={38} />
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e2939' }}>{user.name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
          </div>
          <span style={{
            marginLeft: 'auto', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px',
            padding: '3px 10px', borderRadius: '999px',
            background: user.status === 'active' ? '#f0fdf4' : '#fef3c7',
            color: user.status === 'active' ? '#166534' : '#92400e',
            border: `1px solid ${user.status === 'active' ? '#bbf7d0' : '#fde68a'}`,
          }}>{user.status}</span>
        </div>

        {/* actions */}
        <div style={{ padding: '0 24px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db',
              background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'background .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 20px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239,68,68,.3)', transition: 'opacity .15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Validation Helpers & Regular Expressions ──────────────── */
// Standard valid email — any proper domain
const BASIC_EMAIL_REGEX = /^[a-zA-Z0-9]+([._%+\-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.\-][a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

// Candidate: strictly @college.edu only
const CANDIDATE_EMAIL_REGEX = /^[a-zA-Z0-9]+([._\-][a-zA-Z0-9]+)*@college\.edu$/i;

// Blocked personal webmail domains — for recruiters (alumni & others accept any valid email)
const BLOCKED_PERSONAL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'mail.com', 'proton.me', 'rediffmail.com', 'aol.com', 'zoho.com', 'live.com',
  'yahoo.in', 'ymail.com', 'inbox.com', 'gmx.com',
];

// Fixed Roll number format: 'B' + 2-digit batch + 2-letter branch + 3-digit serial (e.g. B22CS012)
const CANDIDATE_ROLL_REGEX = /^B\d{2}(CS|EC|ME|CV|IT|EE)\d{3}$/;

// Branch to expected 2-letter Roll Code mapping
const BRANCH_CODE_MAP = {
  'Computer Science': 'CS',
  'Electronics': 'EC',
  'Mechanical': 'ME',
  'Civil': 'CV',
  'IT': 'IT',
  'EEE': 'EE'
};

// Phone: proper phone number — '+' optional, digits with spaces/dashes/parens, minimum 10 digits total
const PHONE_REGEX = /^\+?[\d\s\-().]{10,20}$/;

// Location: must be a textual string — letters, spaces, commas, hyphens, dots only. No pure numbers.
const LOCATION_REGEX = /^[A-Za-z][A-Za-z\s,.\-]{1,79}$/;

// Company name: must contain at least one letter (not purely numeric); allows digits in company names
const COMPANY_REGEX = /^(?=.*[A-Za-z])[A-Za-z0-9\s&.,'\-]{2,80}$/;

// Designation / Role: must be text (letters, spaces, slashes, hyphens, ampersands)
const DESIGNATION_REGEX = /^[A-Za-z][A-Za-z0-9\s\/\-&.]{1,79}$/;

// CGPA: strictly 0.00 to 10.00
const CGPA_REGEX = /^(10(\.0{1,2})?|[0-9](\.\d{1,2})?)$/;

// Name: 2 to 60 characters with letters, spaces, dots, hyphens, apostrophes
const NAME_REGEX = /^[A-Za-z\s.'\-]{2,60}$/;

const CURRENT_YEAR = new Date().getFullYear();


function validateSingleField(key, value, systemRole, allForm = {}) {
  const val = String(value || '').trim();

  switch (key) {
    case 'name':
      if (!val) return 'Full name is required.';
      if (!NAME_REGEX.test(val)) return 'Name must contain only letters, spaces, or dots (2–60 characters).';
      return '';

    case 'email': {
      if (!val) return 'Email address is required.';
      if (!BASIC_EMAIL_REGEX.test(val)) return 'Enter a valid email address (e.g. name@example.com).';
      if (systemRole === 'candidate' && !CANDIDATE_EMAIL_REGEX.test(val)) {
        return 'Candidate email must end with @college.edu (e.g. student@college.edu).';
      }
      return '';
    }

    case 'roll':
      if (systemRole === 'candidate') {
        if (!val) return 'Roll number is required.';
        const upperVal = val.toUpperCase();
        if (!CANDIDATE_ROLL_REGEX.test(upperVal)) {
          return 'Roll number must strictly match the format: B{YY}{BRANCH}{NUM} (e.g. B22CS012). Valid branch codes: CS, EC, ME, CV, IT, EE.';
        }
        // Cross-validate with selected branch if branch is chosen
        if (allForm.branch && BRANCH_CODE_MAP[allForm.branch]) {
          const expectedCode = BRANCH_CODE_MAP[allForm.branch];
          const actualCode = upperVal.slice(3, 5);
          if (actualCode !== expectedCode) {
            return `Roll branch code '${actualCode}' does not match selected branch '${allForm.branch}' (expected '${expectedCode}').`;
          }
        }
      }
      return '';

    case 'branch':
      if (systemRole === 'candidate') {
        if (!val) return 'Please select a branch.';
      }
      return '';

    case 'cgpa':
      if (systemRole === 'candidate') {
        if (!val) return 'CGPA is required.';
        if (!CGPA_REGEX.test(val)) return 'CGPA must be between 0.00 and 10.00 (max 2 decimal places).';
        const num = parseFloat(val);
        if (isNaN(num) || num < 0 || num > 10) return 'CGPA must be between 0.00 and 10.00.';
      }
      return '';

    case 'backlogs':
      if (systemRole === 'candidate') {
        if (val !== '') {
          const num = Number(val);
          if (val.includes('-') || isNaN(num) || num < 0 || !Number.isInteger(num)) {
            return 'Backlogs cannot be negative (must be a whole number 0 or greater).';
          }
          if (num > 50) return 'Backlogs count cannot exceed 50.';
        }
      }
      return '';

    case 'company':
      if (systemRole === 'alumni') {
        if (!val) return 'Current company is required.';
        if (!COMPANY_REGEX.test(val)) {
          return 'Company name must contain letters and be 2–80 characters (e.g. Google, Tata Consultancy Services).';
        }
      }
      return '';

    case 'batch':
      if (systemRole === 'alumni') {
        if (!val) return 'Batch year is required.';
        if (!/^\d{4}$/.test(val)) return 'Batch year must be a 4-digit year (e.g. 2022).';
        const yr = parseInt(val, 10);
        if (yr < 1990 || yr > CURRENT_YEAR) return `Batch year must be between 1990 and ${CURRENT_YEAR}.`;
      }
      return '';

    case 'referrals':
      if (systemRole === 'alumni') {
        if (val !== '') {
          const num = Number(val);
          if (val.includes('-') || isNaN(num) || num < 0 || !Number.isInteger(num)) {
            return 'Referrals must be a whole number 0 or greater (no negatives).';
          }
          if (num > 10) return 'Referrals cannot exceed 10.';
        }
      }
      return '';

    case 'recCompany':
      if (systemRole === 'recruiter') {
        if (!val) return 'Company name is required.';
        if (!COMPANY_REGEX.test(val)) {
          return 'Company name must contain letters and be 2–80 characters (e.g. TechCorp Solutions).';
        }
      }
      return '';

    case 'recDesignation':
      if (systemRole === 'recruiter') {
        if (!val) return 'Designation / Role is required.';
        if (!DESIGNATION_REGEX.test(val)) {
          return 'Designation must be a text role name (e.g. HR Manager, Senior Engineer). No pure numbers allowed.';
        }
      }
      return '';

    case 'recPhone':
      if (systemRole === 'recruiter') {
        if (!val) return 'Corporate phone number is required.';
        const digits = val.replace(/\D/g, '');
        if (digits.length < 10) {
          return 'Phone number must contain at least 10 digits.';
        }
        if (!PHONE_REGEX.test(val)) {
          return 'Enter a valid phone number (digits, spaces, dashes, +country code). Example: +91 98765 43210';
        }
      }
      return '';

    case 'recLocation':
      if (systemRole === 'recruiter') {
        if (!val) return 'Office location is required.';
        if (!LOCATION_REGEX.test(val)) {
          return 'Location must be a text name (letters, spaces, commas only — no digits or symbols). Example: Mumbai, Maharashtra';
        }
      }
      return '';

    default:
      return '';
  }
}

/* ─── Main Component ────────────────────────────────────────── */
export default function UserOversight({ onNavigate, activePage = 'p5' }) {
  const [activeTab,   setActiveTab]   = useState('candidates');

  /* ── Users come from the API; every change writes to it and reloads ── */
  const { data, refresh } = useOfficerData();
  const users = data.users || [];

  const act = async (request) => {
    try {
      await request();
      await refresh();
      return true;
    } catch (error) {
      window.alert(errorMessage(error, 'That action could not be completed.'));
      return false;
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  /* add/edit modal */
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editSection, setEditSection] = useState('all');
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [touched,    setTouched]    = useState({});

  /* delete confirmation modal */
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newCreds, setNewCreds] = useState(null);   // login details to hand over after adding someone

  /* ── Derived ─────────────────────────────────────── */
  const currentRole = editUserId
    ? (users.find((u) => u.id === editUserId)?.role || 'candidate')
    : (activeTab === 'alumni' ? 'alumni' : 'candidate');

  const filteredUsers = users.filter((u) => {
    const roleMatch =
      (activeTab === 'candidates' && u.role === 'candidate') ||
      (activeTab === 'alumni'     && u.role === 'alumni');
    if (!roleMatch) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = (value) => String(value ?? '').toLowerCase().includes(q);
      const commonFields = [u.name, u.email];
      const roleFields = {
        candidates: [u.roll, u.branch, u.cgpa],
        alumni: [u.company, u.batch],
      };
      return [...commonFields, ...(roleFields[activeTab] || [])].some(matches);
    }
    return true;
  });

  const userCounts = {
    candidates: users.filter((u) => u.role === 'candidate').length,
    alumni:     users.filter((u) => u.role === 'alumni').length,
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  /* ── Field update with real-time negative blocking & validation ── */
  const handleFieldChange = (key, rawValue) => {
    let value = rawValue;

    // Proactively prevent negative values on typing for numeric fields
    if (key === 'referrals') {
      value = value.replace(/[^0-9]/g, '');
      if (value !== '' && Number(value) > 10) {
        value = '10';
      }
    } else if (key === 'backlogs') {
      value = value.replace(/[^0-9]/g, '');
    } else if (key === 'batch') {
      // Allow only digits, max 4
      value = value.replace(/[^0-9]/g, '').slice(0, 4);
    } else if (key === 'roll') {
      // Auto-uppercase roll number and strip invalid symbol characters
      value = value.toUpperCase().replace(/[^A-Z0-9\-_/]/g, '');
    } else if (key === 'cgpa') {
      // Strip negative sign from CGPA
      value = value.replace(/-/g, '');
    }

    setForm((f) => ({ ...f, [key]: value }));

    // Real-time revalidation if field was touched or has error
    if (touched[key] || formErrors[key]) {
      const error = validateSingleField(key, value, currentRole, { ...form, [key]: value });
      setFormErrors((prev) => ({ ...prev, [key]: error || undefined }));
    }
  };

  const handleBlur = (key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    const error = validateSingleField(key, form[key], currentRole, form);
    setFormErrors((prev) => ({ ...prev, [key]: error || undefined }));
  };

  /* ── Open modals ─────────────────────────────────── */
  const openAdd = () => {
    setEditUserId(null);
    setEditSection('all');
    setForm(EMPTY_FORM);
    setFormErrors({});
    setTouched({});
    setModalOpen(true);
  };

  const openEdit = (user, section) => {
    setEditUserId(user.id);
    setEditSection(section);
    setForm({
      name:           user.name   || '',
      email:          user.email  || '',
      status:         user.status || 'active',
      roll:           user.roll   || '',
      branch:         user.branch || '',
      cgpa:           user.cgpa   != null ? String(user.cgpa)      : '',
      backlogs:       user.backlogs != null ? String(user.backlogs) : '',
      company:        user.company        || '',
      batch:          user.batch          || '',
      referrals:      user.referrals != null ? String(user.referrals) : '',
      recCompany:     user.recCompany     || user.company || '',
      recDesignation: user.recDesignation || '',
      recPhone:       user.recPhone       || '',
      recLocation:    user.recLocation    || '',
    });
    setFormErrors({});
    setTouched({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditSection('all');
    setFormErrors({});
    setTouched({});
  };

  /* ── Full form validation on Save ─────────────────── */
  const validateAll = (systemRole) => {
    const errors = {};
    const fieldsToValidate = !editUserId || editSection === 'profile' ? ['name', 'email'] : [];

    if (systemRole === 'candidate' && (!editUserId || editSection === 'academic')) {
      fieldsToValidate.push('roll', 'branch', 'cgpa', 'backlogs');
    } else if (systemRole === 'alumni' && (!editUserId || editSection === 'employment')) {
      fieldsToValidate.push('company', 'batch', 'referrals');
    } else if (systemRole === 'recruiter' && (!editUserId || editSection === 'employment')) {
      fieldsToValidate.push('recCompany', 'recDesignation', 'recPhone', 'recLocation');
    }

    fieldsToValidate.forEach((key) => {
      const err = validateSingleField(key, form[key], systemRole, form);
      if (err) errors[key] = err;
    });

    return errors;
  };

  /* ── Save (Add / Edit) ───────────────────────────── */
  const saveUser = async () => {
    const systemRole = currentRole;
    const errors = validateAll(systemRole);

    // Mark all relevant fields as touched
    const allTouched = !editUserId || editSection === 'profile' ? { name: true, email: true } : {};
    if (systemRole === 'candidate' && (!editUserId || editSection === 'academic')) {
      allTouched.roll = true; allTouched.branch = true; allTouched.cgpa = true; allTouched.backlogs = true;
    } else if (systemRole === 'alumni' && (!editUserId || editSection === 'employment')) {
      allTouched.company = true; allTouched.batch = true; allTouched.referrals = true;
    } else if (systemRole === 'recruiter' && (!editUserId || editSection === 'employment')) {
      allTouched.recCompany = true; allTouched.recDesignation = true; allTouched.recPhone = true; allTouched.recLocation = true;
    }
    setTouched(allTouched);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim().toLowerCase();

    if (editUserId !== null) {
      const existing = users.find((u) => u.id === editUserId);
      if (!existing) return;
      const updated = { ...existing, name: trimmedName, email: trimmedEmail, status: form.status };
      if (existing.role === 'candidate') {
        updated.roll     = form.roll.trim().toUpperCase();
        updated.branch   = form.branch;
        updated.cgpa     = safeNumber(form.cgpa);
        updated.backlogs = safeInteger(form.backlogs);
      } else if (existing.role === 'alumni') {
        updated.company   = form.company.trim();
        updated.batch     = form.batch.trim();
        updated.referrals = safeInteger(form.referrals);
      } else if (existing.role === 'recruiter') {
        updated.recCompany     = form.recCompany.trim();
        updated.recDesignation = form.recDesignation.trim();
        updated.recPhone       = form.recPhone.trim();
        updated.recLocation    = form.recLocation.trim();
      }
      const saved = await act(() => api.put(`/users/${editUserId}`, fromOversightUser(updated)));
      if (!saved) return;
    } else {
      const newUser = {
        name:           trimmedName,
        email:          trimmedEmail,
        role:           systemRole,
        status:         form.status,
        roll:           form.roll.trim().toUpperCase(),
        branch:         form.branch,
        cgpa:           safeNumber(form.cgpa),
        backlogs:       safeInteger(form.backlogs),
        company:        form.company.trim(),
        batch:          form.batch.trim(),
        referrals:      safeInteger(form.referrals),
        recCompany:     (form.recCompany || '').trim(),
        recDesignation: (form.recDesignation || '').trim(),
        recPhone:       (form.recPhone || '').trim(),
        recLocation:    (form.recLocation || '').trim(),
      };
      // Only send the fields that belong to this role; the API rejects the rest.
      const payload = { ...fromOversightUser(newUser), role: systemRole };
      const collegeId = readSession()?.collegeId;
      if (collegeId != null) payload.collegeId = Number(collegeId);
      const created = await act(() => api.post('/users', payload));
      if (!created) return;
      setNewCreds({ name: trimmedName, email: trimmedEmail, password: '123', role: systemRole });
    }

    closeModal();
  };

  /* ── Delete flow ─────────────────────────────────── */
  const promptDelete = (user) => setDeleteTarget(user);
  const confirmDelete = async () => {
    const deleted = await act(() => api.delete(`/users/${deleteTarget.id}`));
    if (deleted) setDeleteTarget(null);
  };
  const cancelDelete = () => setDeleteTarget(null);

  /* ── Table render ────────────────────────────────── */
  const ActionBtns = ({ user }) => (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      <button
        className="btn-edit-sm"
        onClick={() => openEdit(user, 'profile')}
        style={{
          padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #7c3aed',
          background: '#faf5ff', color: '#7c3aed', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'background .15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#ede9fe'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#faf5ff'}
      >✏️ Edit</button>
      <button
        className="btn-edit-sm"
        onClick={() => openEdit(user, user.role === 'candidate' ? 'academic' : 'employment')}
        style={{
          padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #0f766e',
          background: '#f0fdfa', color: '#0f766e', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'background .15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#ccfbf1'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#f0fdfa'}
      >{user.role === 'candidate' ? 'Academic' : 'Employment'}</button>
      <button
        className="btn-delete-sm"
        onClick={() => promptDelete(user)}
        style={{
          padding: '6px 14px', borderRadius: '6px', border: '1.5px solid #ef4444',
          background: '#fef2f2', color: '#ef4444', fontSize: '12px', fontWeight: 600,
          cursor: 'pointer', transition: 'background .15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
      >🗑 Delete</button>
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
      fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
      background: status === 'active' ? '#f0fdf4' : '#fef3c7',
      color:      status === 'active' ? '#166534' : '#92400e',
      border:     `1px solid ${status === 'active' ? '#bbf7d0' : '#fde68a'}`,
    }}>{status}</span>
  );

  const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: '11px',
    fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '.5px', borderBottom: '1px solid #e5e7eb',
    background: '#fafafa', whiteSpace: 'nowrap',
  };
  const tdStyle = { padding: '14px 16px', fontSize: '14px', color: '#374151', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };

  const renderTable = () => {
    if (filteredUsers.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9ca3af' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔍</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>No users found</div>
          <div style={{ fontSize: '13px' }}>Try a different search or add a new user.</div>
        </div>
      );
    }

    if (activeTab === 'candidates') return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          {['Name', 'Email', 'Roll No', 'Branch', 'CGPA', 'Backlogs', 'Status', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
        </tr></thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id} style={{ transition: 'background .1s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fcfbff'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={u.name} size={32} />
                  <span style={{ fontWeight: 600, color: '#1e2939' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, color: '#6b7280' }}>{u.email}</td>
              <td style={tdStyle}><code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{u.roll || '—'}</code></td>
              <td style={tdStyle}>{u.branch || '—'}</td>
              <td style={{ ...tdStyle, fontWeight: 700, color: u.cgpa >= 8 ? '#059669' : u.cgpa >= 6 ? '#d97706' : '#ef4444' }}>{u.cgpa || '—'}</td>
              <td style={{ ...tdStyle, color: u.backlogs > 0 ? '#ef4444' : '#374151' }}>{u.backlogs}</td>
              <td style={tdStyle}><StatusBadge status={u.status} /></td>
              <td style={tdStyle}><ActionBtns user={u} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    if (activeTab === 'alumni') return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          {['Name', 'Email', 'Company', 'Batch', 'Referrals', 'Status', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
        </tr></thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fcfbff'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={u.name} size={32} />
                  <span style={{ fontWeight: 600, color: '#1e2939' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, color: '#6b7280' }}>{u.email}</td>
              <td style={tdStyle}>{u.company || '—'}</td>
              <td style={tdStyle}>{u.batch || '—'}</td>
              <td style={tdStyle}>
                <span style={{ fontWeight: 700, color: '#7c3aed' }}>{u.referrals || 0}</span>
              </td>
              <td style={tdStyle}><StatusBadge status={u.status} /></td>
              <td style={tdStyle}><ActionBtns user={u} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          {['Name', 'Email', 'Company', 'Designation', 'Status', 'Actions'].map((h) => <th key={h} style={thStyle}>{h}</th>)}
        </tr></thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fcfbff'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}
            >
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={u.name} size={32} />
                  <span style={{ fontWeight: 600, color: '#1e2939' }}>{u.name}</span>
                </div>
              </td>
              <td style={{ ...tdStyle, color: '#6b7280' }}>{u.email}</td>
              <td style={tdStyle}>{u.recCompany || u.company || '—'}</td>
              <td style={tdStyle}>{u.recDesignation || '—'}</td>
              <td style={tdStyle}><StatusBadge status={u.status} /></td>
              <td style={tdStyle}><ActionBtns user={u} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  /* ── Add/Edit Modal body fields ──────────────────── */
  const renderFormFields = () => {
    const systemRole = currentRole;
    const showProfileFields = !editUserId || editSection === 'profile';
    const showRoleFields = !editUserId || editSection === (systemRole === 'candidate' ? 'academic' : 'employment');

    return (
      <>
        {showProfileFields && <>
        <Field label="Full Name" required error={formErrors.name}>
          <Input
            type="text"
            placeholder="e.g. Aarav Sharma"
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            hasError={!!formErrors.name}
          />
        </Field>

        <Field
          label={
            systemRole === 'candidate'
              ? 'Candidate Email'
              : systemRole === 'alumni'
              ? 'Alumni Email'
              : 'Corporate / Official Email'
          }
          required
          error={formErrors.email}
        >
          <Input
            type="email"
            placeholder={
              systemRole === 'candidate'
                ? 'e.g. student@college.edu'
                : systemRole === 'alumni'
                ? 'e.g. alumni@example.com'
                : 'e.g. recruiter@company.com'
            }
            value={form.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            hasError={!!formErrors.email}
          />
        </Field>

        <Field label="Status">
          <Select
            value={form.status}
            onChange={(e) => handleFieldChange('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </Field>
        </>}

        {/* Candidate-specific */}
        {systemRole === 'candidate' && showRoleFields && (
          <>
            <Field label="Roll Number (Format: B22CS012)" required error={formErrors.roll}>
              <Input
                type="text"
                placeholder="e.g. B22CS012"
                value={form.roll}
                onChange={(e) => handleFieldChange('roll', e.target.value)}
                onBlur={() => handleBlur('roll')}
                hasError={!!formErrors.roll}
              />
            </Field>

            <Field label="Branch" required error={formErrors.branch}>
              <Select
                value={form.branch}
                onChange={(e) => handleFieldChange('branch', e.target.value)}
                onBlur={() => handleBlur('branch')}
                hasError={!!formErrors.branch}
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="IT">IT</option>
                <option value="EEE">EEE</option>
              </Select>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="CGPA (0 - 10)" required error={formErrors.cgpa}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 8.50"
                  value={form.cgpa}
                  onKeyDown={(e) => {
                    // Block negative sign, plus sign, and exponential notation on keypress
                    if (['-', '+', 'e', 'E'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleFieldChange('cgpa', e.target.value)}
                  onBlur={() => handleBlur('cgpa')}
                  hasError={!!formErrors.cgpa}
                />
              </Field>

              <Field label="Backlogs (≥ 0)" error={formErrors.backlogs}>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  placeholder="e.g. 0"
                  value={form.backlogs}
                  onKeyDown={(e) => {
                    // Strictly block negative sign, exponential, decimal, and plus signs
                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleFieldChange('backlogs', e.target.value)}
                  onBlur={() => handleBlur('backlogs')}
                  hasError={!!formErrors.backlogs}
                />
              </Field>
            </div>
          </>
        )}

        {/* Alumni-specific */}
        {systemRole === 'alumni' && showRoleFields && (
          <>
            <Field label="Current Company" required error={formErrors.company}>
              <Input
                type="text"
                placeholder="e.g. Google"
                value={form.company}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                onBlur={() => handleBlur('company')}
                hasError={!!formErrors.company}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Batch Year" required error={formErrors.batch}>
                <Input
                  type="number"
                  min="1990"
                  max={CURRENT_YEAR + 4}
                  placeholder="e.g. 2022"
                  value={form.batch}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleFieldChange('batch', e.target.value)}
                  onBlur={() => handleBlur('batch')}
                  hasError={!!formErrors.batch}
                />
              </Field>

              <Field label="Referrals (0 – 10)" error={formErrors.referrals}>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  placeholder="e.g. 2"
                  value={form.referrals}
                  onKeyDown={(e) => {
                    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => handleFieldChange('referrals', e.target.value)}
                  onBlur={() => handleBlur('referrals')}
                  hasError={!!formErrors.referrals}
                />
              </Field>
            </div>
          </>
        )}

        {/* Recruiter-specific */}
        {systemRole === 'recruiter' && showRoleFields && (
          <>
            <Field label="Company Name" required error={formErrors.recCompany}>
              <Input
                type="text"
                placeholder="e.g. TechCorp Solutions"
                value={form.recCompany}
                onChange={(e) => handleFieldChange('recCompany', e.target.value)}
                onBlur={() => handleBlur('recCompany')}
                hasError={!!formErrors.recCompany}
              />
            </Field>

            <Field label="Designation / Role" required error={formErrors.recDesignation}>
              <Input
                type="text"
                placeholder="e.g. HR Manager"
                value={form.recDesignation}
                onChange={(e) => handleFieldChange('recDesignation', e.target.value)}
                onBlur={() => handleBlur('recDesignation')}
                hasError={!!formErrors.recDesignation}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Field label="Phone" error={formErrors.recPhone}>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.recPhone}
                  onChange={(e) => handleFieldChange('recPhone', e.target.value)}
                  onBlur={() => handleBlur('recPhone')}
                  hasError={!!formErrors.recPhone}
                />
              </Field>

              <Field label="Location" error={formErrors.recLocation}>
                <Input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={form.recLocation}
                  onChange={(e) => handleFieldChange('recLocation', e.target.value)}
                  onBlur={() => handleBlur('recLocation')}
                  hasError={!!formErrors.recLocation}
                />
              </Field>
            </div>
          </>
        )}
      </>
    );
  };

  const modalTitle = editUserId
    ? (editSection === 'profile' ? 'Edit Profile Details' : `Edit ${currentRole === 'candidate' ? 'Academic' : 'Employment'} Details`)
    : `Add ${activeTab === 'alumni' ? 'Alumni' : 'Candidate'}`;

  /* ── Render ──────────────────────────────────────── */
  return (
    <div className="frame user-oversight-page">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <Header title="User Oversight" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
        {/* intro */}
        <section className="oversight-intro">
          <div>
            <h1>User Oversight</h1>
            <p>Manage placement candidates and alumni referrers from one workspace.</p>
          </div>
          <div className="oversight-summary">
            <span><strong>{userCounts.candidates}</strong> Candidates</span>
            <span><strong>{userCounts.alumni}</strong> Alumni</span>
          </div>
        </section>

        {/* tabs */}
        <div className="filter-tabs oversight-tabs">
          {[
            { key: 'candidates', label: 'Candidates',       count: userCounts.candidates },
            { key: 'alumni',     label: 'Alumni & Referrals', count: userCounts.alumni },
          ].map((t) => (
            <button key={t.key} type="button" className={`tab${activeTab === t.key ? ' active' : ''}`} onClick={() => switchTab(t.key)}>
              {t.label} <span>{t.count}</span>
            </button>
          ))}
        </div>

        {/* table card */}
        <div className="panel fade-in" id="userListContainer" style={{ marginTop: '20px', padding: '20px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ color: '#1e2939', fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              {{ candidates: 'Manage Candidates', alumni: 'Manage Alumni & Referrals' }[activeTab]}
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={{
                  candidates: 'Search name, email, roll no., branch, or CGPA…',
                  alumni: 'Search name, email, company, or batch…',
                  recruiters: 'Search name, email, company, or designation…',
                }[activeTab]}
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #d1d5db',
                  fontSize: '14px', color: '#1e2939', minWidth: '220px', boxSizing: 'border-box',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,.1)'; }}
                onBlur={(e)  => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={openAdd}
                style={{
                  padding: '8px 18px', borderRadius: '8px',
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff',
                  border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(124,58,237,.3)', transition: 'opacity .15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                + Add User
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            {renderTable()}
          </div>
        </div>
      </main>

      {/* ── Add / Edit Modal ──────────────────────────── */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,.25)',
            animation: 'slideIn .25s ease',
            maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          }}>
            {/* header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e2939' }}>{modalTitle}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  {editUserId ? `Update the user's information below.` : `Fill in the details to add a new ${activeTab === 'alumni' ? 'alumni' : 'candidate'}.`}
                </p>
              </div>
              <button
                className="modal-close" onClick={closeModal}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1, padding: '4px' }}
              >×</button>
            </div>

            {/* scrollable body */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
              {renderFormFields()}
            </div>

            {/* footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button
                onClick={closeModal}
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #d1d5db', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >Cancel</button>
              <button
                onClick={saveUser}
                style={{
                  padding: '9px 22px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124,58,237,.3)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {editUserId ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────── */}
      <DeleteModal
        user={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {newCreds && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,.25)' }}>
            <div style={{ fontSize: 34, textAlign: 'center' }}>🎉</div>
            <h3 style={{ textAlign: 'center', margin: '6px 0 4px', fontSize: 20 }}>{newCreds.name} can now sign in</h3>
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: 13, marginBottom: 18 }}>
              Account created as <strong>{newCreds.role}</strong>. Share these login details with them.
            </p>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, fontSize: 14, lineHeight: 2 }}>
              <div><span style={{ color: '#64748b' }}>Email&nbsp;&nbsp;&nbsp;&nbsp;</span> <strong>{newCreds.email}</strong></div>
              <div><span style={{ color: '#64748b' }}>Password</span> <strong style={{ fontFamily: 'monospace' }}>{newCreds.password}</strong></div>
            </div>
            <div style={{ textAlign: 'right', marginTop: 20 }}>
              <button
                onClick={() => setNewCreds(null)}
                style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
