import { useEffect, useState } from 'react';
import { Building2, ExternalLink, Mail, Shield, User } from 'lucide-react';
import api, { errorMessage, readSession } from '../../../services/api.js';
import ChangePasswordModal from '../../../shared/components/ChangePasswordModal.jsx';

const EMPTY_EDIT_FIELDS = {
  name: '', email: '', phone: '', department: '', location: '', about: '', linkedin: '', portfolio: '',
};

export default function Profile({ collegeName, showToast, onProfileUpdated }) {
  const session = readSession() || {};
  const [profile, setProfile] = useState(null);
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFields, setEditFields] = useState(EMPTY_EDIT_FIELDS);
  const [saving, setSaving] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      if (!session.id) {
        if (active) setLoading(false);
        return;
      }
      try {
        const [userResponse, collegeResponse] = await Promise.all([
          api.get(`/users/${session.id}`),
          session.collegeId ? api.get(`/colleges/${session.collegeId}`) : Promise.resolve(null),
        ]);
        if (!active) return;
        setProfile(userResponse.data);
        setCollegeInfo(collegeResponse?.data || null);
      } catch (error) {
        if (active) showToast?.(errorMessage(error, 'Failed to load profile.'), 'error');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();
    return () => { active = false; };
  }, [session.id, session.collegeId, showToast]);

  const startEditing = () => {
    if (!profile) return;
    setEditFields({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      department: profile.department || '',
      location: profile.location || '',
      about: profile.about || '',
      linkedin: profile.socialLinks?.linkedin || '',
      portfolio: profile.socialLinks?.portfolio || '',
    });
    setIsEditing(true);
  };

  const setField = (field) => (event) => {
    setEditFields((current) => ({ ...current, [field]: event.target.value }));
  };

  const saveProfile = async () => {
    if (!session.id || saving) return;
    setSaving(true);
    try {
      const { data: updated } = await api.put(`/users/${session.id}`, {
        name: editFields.name.trim(),
        email: editFields.email.trim(),
        phone: editFields.phone.trim(),
        department: editFields.department.trim(),
        location: editFields.location.trim(),
        about: editFields.about.trim(),
        socialLinks: {
          linkedin: editFields.linkedin.trim(),
          portfolio: editFields.portfolio.trim(),
        },
      });
      setProfile(updated);
      const nextSession = { ...session, name: updated.name, email: updated.email };
      localStorage.setItem('loggedInUser', JSON.stringify(nextSession));
      onProfileUpdated?.(nextSession);
      setIsEditing(false);
      showToast?.('Profile updated successfully!');
    } catch (error) {
      showToast?.(errorMessage(error, 'Failed to update profile. Please try again.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="ca-profile-loading">Loading profile…</div>;
  if (!profile) return <div className="ca-profile-loading">Profile not found.</div>;

  const initials = (profile.name || 'CA').split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <section className="ca-profile-hero">
        <div className="ca-profile-hero-avatar" aria-hidden="true">{initials}</div>
        <div className="ca-profile-hero-info">
          <h2 className="ca-profile-hero-name">{profile.name}</h2>
          <p className="ca-profile-hero-role"><Shield size={14} /> College Administrator</p>
          <p className="ca-profile-hero-college"><Building2 size={14} /> {collegeName || 'College'}</p>
          <p className="ca-profile-hero-email"><Mail size={14} /> {profile.email}</p>
        </div>
        <div className="ca-profile-hero-actions">
          {isEditing ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsChangePasswordOpen(true)}>Change Password</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={startEditing}>Edit Profile</button>
            </>
          )}
        </div>
      </section>

      <div className="ca-profile-grid">
        <section className="ca-profile-section">
          <h3 className="ca-profile-section-title"><User size={16} /> Personal Information</h3>
          {isEditing ? <PersonalEditForm fields={editFields} setField={setField} /> : (
            <div className="ca-profile-details">
              <InfoRow label="Full Name" value={profile.name} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone" value={profile.phone} />
              <InfoRow label="Department" value={profile.department} />
              <InfoRow label="Location" value={profile.location} />
              <InfoRow label="About" value={profile.about} />
            </div>
          )}
        </section>

        <section className="ca-profile-section">
          <h3 className="ca-profile-section-title"><Building2 size={16} /> College Information</h3>
          <div className="ca-profile-details">
            <InfoRow label="College" value={collegeInfo?.name || collegeName} />
            <InfoRow label="Code" value={collegeInfo?.code} />
            <InfoRow label="Email" value={collegeInfo?.email} />
            <InfoRow label="Phone" value={collegeInfo?.phone} />
            <InfoRow label="Address" value={collegeInfo?.address} />
            {collegeInfo?.website && <LinkRow label="Website" value={collegeInfo.website} />}
          </div>

          <h3 className="ca-profile-section-title ca-profile-social-title"><ExternalLink size={16} /> Social Links</h3>
          {isEditing ? (
            <div className="ca-profile-edit-form">
              <Field label="LinkedIn" type="url" value={editFields.linkedin} onChange={setField('linkedin')} placeholder="https://linkedin.com/in/..." />
              <Field label="Portfolio / Website" type="url" value={editFields.portfolio} onChange={setField('portfolio')} placeholder="https://..." />
            </div>
          ) : (
            <div className="ca-profile-details">
              <LinkRow label="LinkedIn" value={profile.socialLinks?.linkedin} />
              <LinkRow label="Portfolio" value={profile.socialLinks?.portfolio} />
            </div>
          )}
        </section>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userId={session.id}
        accentColor="#0ea5e9"
      />
    </>
  );
}

function PersonalEditForm({ fields, setField }) {
  return (
    <div className="ca-profile-edit-form">
      <Field label="Full Name" value={fields.name} onChange={setField('name')} />
      <Field label="Email Address" type="email" value={fields.email} onChange={setField('email')} />
      <Field label="Phone Number" type="tel" value={fields.phone} onChange={setField('phone')} />
      <Field label="Department" value={fields.department} onChange={setField('department')} />
      <Field label="Location" value={fields.location} onChange={setField('location')} />
      <div className="ca-profile-field">
        <label htmlFor="ca-about">About</label>
        <textarea id="ca-about" rows={3} value={fields.about} onChange={setField('about')} />
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  const id = `ca-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <div className="ca-profile-field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} /></div>;
}

function InfoRow({ label, value }) {
  return <div className="ca-profile-info-row"><span className="ca-profile-info-label">{label}</span><span className="ca-profile-info-value">{value || '—'}</span></div>;
}

function LinkRow({ label, value }) {
  return (
    <div className="ca-profile-info-row">
      <span className="ca-profile-info-label">{label}</span>
      {value ? <a href={value} target="_blank" rel="noopener noreferrer" className="ca-profile-info-link">{value} <ExternalLink size={12} /></a> : <span className="ca-profile-info-value">—</span>}
    </div>
  );
}
