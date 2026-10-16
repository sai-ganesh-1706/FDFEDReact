import { useEffect, useState } from 'react';
import { ExternalLink, Mail, ShieldCheck, User } from 'lucide-react';
import api, { errorMessage, readSession } from '../../../services/api.js';
import ChangePasswordModal from '../../../shared/components/ChangePasswordModal.jsx';

const EMPTY_EDIT_FIELDS = {
  name: '', email: '', phone: '', department: '', location: '', about: '', linkedin: '', portfolio: '',
};

export default function Profile({ showToast, onProfileUpdated }) {
  const session = readSession() || {};
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState(EMPTY_EDIT_FIELDS);
  const [saving, setSaving] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!session.id) { if (active) setLoading(false); return; }
      try {
        const { data } = await api.get(`/users/${session.id}`);
        if (active) setProfile(data);
      } catch (error) {
        if (active) showToast?.(errorMessage(error, 'Failed to load profile.'), 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [session.id, showToast]);

  const setField = (field) => (event) => setFields((current) => ({ ...current, [field]: event.target.value }));

  const startEditing = () => {
    if (!profile) return;
    setFields({
      name: profile.name || '', email: profile.email || '', phone: profile.phone || '',
      department: profile.department || '', location: profile.location || '', about: profile.about || '',
      linkedin: profile.socialLinks?.linkedin || '', portfolio: profile.socialLinks?.portfolio || '',
    });
    setIsEditing(true);
  };

  const save = async () => {
    if (!session.id || saving) return;
    setSaving(true);
    try {
      const { data: updated } = await api.put(`/users/${session.id}`, {
        name: fields.name.trim(), email: fields.email.trim(), phone: fields.phone.trim(),
        department: fields.department.trim(), location: fields.location.trim(), about: fields.about.trim(),
        socialLinks: { linkedin: fields.linkedin.trim(), portfolio: fields.portfolio.trim() },
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

  if (loading) return <div className="sa-profile-loading">Loading profile…</div>;
  if (!profile) return <div className="sa-profile-loading">Profile not found.</div>;

  const initials = (profile.name || 'SA').split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <section className="sa-profile-hero">
        <div className="sa-profile-hero-avatar" aria-hidden="true">{initials}</div>
        <div className="sa-profile-hero-info">
          <h2>{profile.name}</h2>
          <p><ShieldCheck size={14} /> Super Administrator</p>
          <p><Mail size={14} /> {profile.email}</p>
        </div>
        <div className="sa-profile-hero-actions">
          {isEditing ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsEditing(false)} disabled={saving}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsChangePasswordOpen(true)}>Change Password</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={startEditing}>Edit Profile</button>
            </>
          )}
        </div>
      </section>

      <div className="sa-profile-grid">
        <section className="sa-profile-section">
          <h3><User size={16} /> Personal Information</h3>
          {isEditing ? <EditForm fields={fields} setField={setField} /> : (
            <div className="sa-profile-details">
              <InfoRow label="Full Name" value={profile.name} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone" value={profile.phone} />
              <InfoRow label="Department" value={profile.department} />
              <InfoRow label="Location" value={profile.location} />
              <InfoRow label="About" value={profile.about} />
            </div>
          )}
        </section>

        <section className="sa-profile-section">
          <h3><ShieldCheck size={16} /> Platform Access</h3>
          <div className="sa-profile-details">
            <InfoRow label="Role" value="Super Administrator" />
            <InfoRow label="Scope" value="All colleges and platform settings" />
            <InfoRow label="Account Status" value={profile.status || 'active'} />
          </div>

          <h3 className="sa-profile-social-title"><ExternalLink size={16} /> Social Links</h3>
          {isEditing ? (
            <div className="sa-profile-edit-form">
              <Field label="LinkedIn" type="url" value={fields.linkedin} onChange={setField('linkedin')} placeholder="https://linkedin.com/in/..." />
              <Field label="Portfolio / Website" type="url" value={fields.portfolio} onChange={setField('portfolio')} placeholder="https://..." />
            </div>
          ) : (
            <div className="sa-profile-details">
              <LinkRow label="LinkedIn" value={profile.socialLinks?.linkedin} />
              <LinkRow label="Portfolio" value={profile.socialLinks?.portfolio} />
            </div>
          )}
        </section>
      </div>

      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} userId={session.id} accentColor="#7c3aed" />
    </>
  );
}

function EditForm({ fields, setField }) {
  return (
    <div className="sa-profile-edit-form">
      <Field label="Full Name" value={fields.name} onChange={setField('name')} />
      <Field label="Email Address" type="email" value={fields.email} onChange={setField('email')} />
      <Field label="Phone Number" type="tel" value={fields.phone} onChange={setField('phone')} />
      <Field label="Department" value={fields.department} onChange={setField('department')} />
      <Field label="Location" value={fields.location} onChange={setField('location')} />
      <div className="sa-profile-field"><label htmlFor="sa-about">About</label><textarea id="sa-about" rows={3} value={fields.about} onChange={setField('about')} /></div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  const id = `sa-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return <div className="sa-profile-field"><label htmlFor={id}>{label}</label><input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} /></div>;
}

function InfoRow({ label, value }) {
  return <div className="sa-profile-info-row"><span>{label}</span><strong>{value || '—'}</strong></div>;
}

function LinkRow({ label, value }) {
  return <div className="sa-profile-info-row"><span>{label}</span>{value ? <a href={value} target="_blank" rel="noopener noreferrer">{value} <ExternalLink size={12} /></a> : <strong>—</strong>}</div>;
}
