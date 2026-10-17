import { useEffect, useRef, useState } from 'react';
import { Camera, Pencil, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import '../styles/profile.css';

const RECORD_LABELS = {
    projects: { title: 'Project Name', subtitle: 'Technologies Used (e.g., React, Node)', showDuration: false, showDesc: true, showLink: true, showImg: false },
    education: { title: 'Degree', subtitle: 'Institution', showDuration: true, showDesc: true, showLink: false, showImg: false },
    certifications: { title: 'Certification Name', subtitle: 'Issuer', showDuration: true, showDesc: false, showLink: false, showImg: true },
    experience: { title: 'Title / Role', subtitle: 'Organization / Company', showDuration: true, showDesc: true, showLink: false, showImg: true },
    extracurricular: { title: 'Title / Role', subtitle: 'Organization / Company', showDuration: true, showDesc: true, showLink: false, showImg: true },
};

function formatMonthYear(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function Profile() {
    const { store, updateStore } = useStore();
    const { showSuccess } = useUI();
    const user = store.currentUser;
    const data = store.profileResumeData;

    // ---- Modal state ----
    const [modal, setModal] = useState(null); // 'intro' | 'about' | 'skills' | 'languages' | 'codingProfiles' | 'record' | null
    const [recordType, setRecordType] = useState(null);
    const [imageOptionsTarget, setImageOptionsTarget] = useState(null); // 'banner' | 'avatar' | null
    const [confirmDelete, setConfirmDelete] = useState(null); // { type, index } | null

    // ---- Form field state ----
    const [introForm, setIntroForm] = useState({ name: '', email: '', headline: '', location: '', university: '', batch: '', phone: '', github: '', linkedin: '', portfolio: '' });
    const [aboutText, setAboutText] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [langForm, setLangForm] = useState({ name: '', level: 'Native' });
    const [codingForm, setCodingForm] = useState({ platform: '', url: '', handle: '' });
    const [recordForm, setRecordForm] = useState({ title: '', subtitle: '', start: '', end: '', link: '', desc: '', imageBase64: '' });

    const storageInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const recordImgInputRef = useRef(null);
    const docUploadRef = useRef(null);

    // Refs for the dialog elements
    const dialogRefs = {
        intro: useRef(null),
        about: useRef(null),
        skills: useRef(null),
        languages: useRef(null),
        codingProfiles: useRef(null),
        record: useRef(null),
        imageOptions: useRef(null),
        confirmDelete: useRef(null),
    };

    useEffect(() => {
        Object.entries(dialogRefs).forEach(([key, ref]) => {
            const el = ref.current;
            if (!el) return;
            let shouldOpen = false;
            if (key === 'imageOptions') shouldOpen = !!imageOptionsTarget;
            else if (key === 'confirmDelete') shouldOpen = !!confirmDelete;
            else shouldOpen = modal === key;

            if (shouldOpen && !el.open) el.showModal();
            if (!shouldOpen && el.open) el.close();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modal, imageOptionsTarget, confirmDelete]);

    function closeModal() {
        setModal(null);
    }

    function openIntro() {
        setIntroForm({
            name: user.name || '',
            email: user.email || '',
            headline: user.headline || '',
            location: user.location || '',
            university: user.university || '',
            batch: user.batch || '',
            phone: user.phone || '',
            github: user.socialLinks?.github || '',
            linkedin: user.socialLinks?.linkedin || '',
            portfolio: user.socialLinks?.portfolio || '',
        });
        setModal('intro');
    }

    function openAbout() {
        setAboutText(user.about || '');
        setModal('about');
    }

    function openSkills() {
        setSkillInput('');
        setModal('skills');
    }

    function openLanguages() {
        setLangForm({ name: '', level: 'Native' });
        setModal('languages');
    }

    function openCoding() {
        setCodingForm({ platform: '', url: '', handle: '' });
        setModal('codingProfiles');
    }

    function openRecord(type) {
        setRecordType(type);
        setRecordForm({ title: '', subtitle: '', start: '', end: '', link: '', desc: '', imageBase64: '' });
        setModal('record');
    }

    function saveIntro(e) {
        e.preventDefault();
        updateStore((s) => {
            s.currentUser.name = introForm.name;
            s.currentUser.email = introForm.email;
            s.currentUser.headline = introForm.headline;
            s.currentUser.location = introForm.location;
            s.currentUser.university = introForm.university;
            s.currentUser.batch = introForm.batch;
            s.currentUser.phone = introForm.phone;
            s.currentUser.socialLinks = {
                github: introForm.github,
                linkedin: introForm.linkedin,
                portfolio: introForm.portfolio,
            };
            const parts = s.currentUser.name.split(' ');
            s.currentUser.avatar = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
        });
        closeModal();
        showSuccess('Profile Updated', 'Your intro details have been saved.');
    }

    function saveAbout(e) {
        e.preventDefault();
        updateStore((s) => {
            s.currentUser.about = aboutText;
        });
        closeModal();
    }

    function saveSkill(e) {
        e.preventDefault();
        const newSkill = skillInput.trim();
        if (!newSkill) return;
        updateStore((s) => {
            if (!s.profileResumeData.skills) s.profileResumeData.skills = [];
            s.profileResumeData.skills.push(newSkill);
        });
        closeModal();
    }

    function saveLanguage(e) {
        e.preventDefault();
        updateStore((s) => {
            if (!s.profileResumeData.languages) s.profileResumeData.languages = [];
            s.profileResumeData.languages.push({ name: langForm.name, level: langForm.level });
        });
        closeModal();
    }

    function saveCoding(e) {
        e.preventDefault();
        updateStore((s) => {
            if (!s.profileResumeData.codingProfiles) s.profileResumeData.codingProfiles = [];
            s.profileResumeData.codingProfiles.push({ platform: codingForm.platform, url: codingForm.url, handle: codingForm.handle });
        });
        closeModal();
    }

    function saveRecord(e) {
        e.preventDefault();
        const startStr = formatMonthYear(recordForm.start);
        const endStr = recordForm.end ? formatMonthYear(recordForm.end) : 'Present';
        const durationCombo = startStr ? `${startStr} - ${endStr}` : '';

        updateStore((s) => {
            if (!s.profileResumeData[recordType]) s.profileResumeData[recordType] = [];
            let newRecord = {};
            if (recordType === 'projects') {
                newRecord = { title: recordForm.title, tags: recordForm.subtitle, github: recordForm.link, description: recordForm.desc };
            } else if (recordType === 'education') {
                newRecord = { degree: recordForm.title, institution: recordForm.subtitle, duration: durationCombo, desc: recordForm.desc };
            } else if (recordType === 'certifications') {
                newRecord = { title: recordForm.title, issuer: recordForm.subtitle, date: startStr, image: recordForm.imageBase64 };
            } else {
                newRecord = { title: recordForm.title, company: recordForm.subtitle, duration: durationCombo, desc: recordForm.desc, image: recordForm.imageBase64 };
            }
            s.profileResumeData[recordType].push(newRecord);
        });
        closeModal();
        showSuccess('Record Added', 'The new entry has been added to your profile.');
    }

    async function handleRecordImageChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await fileToBase64(file);
        setRecordForm((prev) => ({ ...prev, imageBase64: base64 }));
    }

    function requestDelete(type, index) {
        setConfirmDelete({ type, index });
    }

    function executeDelete() {
        if (!confirmDelete) return;
        updateStore((s) => {
            if (s.profileResumeData[confirmDelete.type]) {
                s.profileResumeData[confirmDelete.type].splice(confirmDelete.index, 1);
            }
            s.notificationsData.unshift({ title: 'Record Deleted', message: 'Item removed successfully from your profile.', isRead: false });
        });
        setConfirmDelete(null);
    }

    function openImageOptions(target) {
        setImageOptionsTarget(target);
    }

    function triggerImageUpload(method) {
        setImageOptionsTarget(null);
        const inputRef = method === 'camera' ? cameraInputRef : storageInputRef;
        if (inputRef.current) inputRef.current.click();
    }

    function triggerImageDelete() {
        const target = imageOptionsTarget;
        setImageOptionsTarget(null);
        updateStore((s) => {
            s.currentUser[target] = '';
            s.notificationsData.unshift({ title: 'Image Deleted', message: 'Media successfully removed from your profile.', isRead: false });
        });
    }

    async function handleImageUpload(e, targetType) {
        const file = e.target.files[0];
        if (!file) return;
        const base64 = await fileToBase64(file);
        updateStore((s) => {
            if (targetType === 'banner') s.currentUser.bannerImage = base64;
            if (targetType === 'avatar') s.currentUser.avatarImage = base64;
        });
        e.target.value = '';
    }

    function handleDocUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        updateStore((s) => {
            if (!s.profileResumeData.additionalDocs) s.profileResumeData.additionalDocs = [];
            s.profileResumeData.additionalDocs.push({
                name: file.name,
                type: 'Document',
                size: (file.size / 1024).toFixed(0) + ' KB',
            });
            s.notificationsData.unshift({ title: 'Document Uploaded', message: `Successfully uploaded ${file.name}.`, isRead: false });
        });
        e.target.value = '';
    }

    const recLabel = recordType ? RECORD_LABELS[recordType] : null;

    return (
        <>
            <div className="dashboard-scroll-area">
                <div className="profile-layout">
                    {/* LEFT COLUMN */}
                    <div>
                        <div className="profile-card">
                            <div
                                className="profile-header-banner"
                                style={
                                    user.bannerImage
                                        ? { backgroundImage: `url(${user.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : {}
                                }
                            >

                                <div
                                    className="profile-picture-container"
                                    onClick={() => openImageOptions('avatarImage')}
                                    title="Edit Profile Picture"
                                    style={
                                        user.avatarImage
                                            ? { backgroundImage: `url(${user.avatarImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                            : {}
                                    }
                                >
                                    {!user.avatarImage && (user.avatar || 'SB')}
                                </div>

                                <input type="file" ref={storageInputRef} accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, imageOptionsTarget)} />
                                <input type="file" ref={cameraInputRef} accept="image/*" capture="user" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, imageOptionsTarget)} />
                            </div>
                            <div className="profile-header-details">
                                <div className="profile-header-actions">
                                    <button className="edit-btn edit-btn--label" onClick={openIntro}>
                                        <Pencil size={15} aria-hidden="true" /> Edit profile
                                    </button>
                                </div>
                                <h2>{user.name || 'Name'}</h2>
                                <p className="profile-headline">{user.headline || ''}</p>

                                <div className="profile-contact-list">
                                    <span>
                                        <i className="bx bx-map" /> <span>{user.location || ''}</span>
                                    </span>
                                    <span>
                                        <i className="bx bx-building" /> <span>{user.university || ''}</span>
                                    </span>
                                    <span>
                                        <i className="bx bx-envelope" /> <a href={`mailto:${user.email}`}>{user.email || ''}</a>
                                    </span>
                                    <span>
                                        <i className="bx bx-phone" /> <span>{user.phone || ''}</span>
                                    </span>
                                </div>
                                <div className="profile-contact-list">
                                    {user.socialLinks?.linkedin && (
                                        <span>
                                            <i className="bx bxl-linkedin-square" />{' '}
                                            <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer">
                                                LinkedIn
                                            </a>
                                        </span>
                                    )}
                                    {user.socialLinks?.github && (
                                        <span>
                                            <i className="bx bxl-github" />{' '}
                                            <a href={user.socialLinks.github} target="_blank" rel="noreferrer">
                                                GitHub
                                            </a>
                                        </span>
                                    )}
                                    {user.socialLinks?.portfolio && (
                                        <span>
                                            <i className="bx bx-link-external" />{' '}
                                            <a href={user.socialLinks.portfolio} target="_blank" rel="noreferrer">
                                                Portfolio
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="card-body">
                                <h3 className="section-title">
                                    About{' '}
                                    <button className="edit-btn edit-btn--label" onClick={openAbout}>
                                        <Pencil size={15} aria-hidden="true" /> Edit
                                    </button>
                                </h3>
                                <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                                    {user.about || 'Add a summary about yourself...'}
                                </p>
                            </div>
                        </div>

                        <TimelineCard
                            title="Experience"
                            list={data.experience}
                            iconCls="bx-briefcase"
                            bg="#f1f5f9"
                            color="var(--brand-primary)"
                            onAdd={() => openRecord('experience')}
                            onDelete={(idx) => requestDelete('experience', idx)}
                        />

                        <div className="profile-card">
                            <div className="card-body">
                                <h3 className="section-title">
                                    Coding Profiles{' '}
                                    <button className="edit-btn edit-btn--label" onClick={openCoding}>
                                        <Plus size={15} aria-hidden="true" /> Add
                                    </button>
                                </h3>
                                {!data.codingProfiles || data.codingProfiles.length === 0 ? (
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No coding profiles added.</p>
                                ) : (
                                    data.codingProfiles.map((item, index) => {
                                        const iconDict = { leetcode: 'bx-code-curly', hackerrank: 'bx-code-block', codeforces: 'bx-stats' };
                                        let iconMatch = 'bx-link';
                                        const searchStr = item.platform.toLowerCase();
                                        for (const key in iconDict) if (searchStr.includes(key)) iconMatch = iconDict[key];
                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 12,
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: 'var(--radius-md)',
                                                    transition: 'all 0.2s',
                                                    background: 'white',
                                                }}
                                            >
                                                <a href={item.url} target="_blank" rel="noreferrer" className="coding-profile-item" style={{ border: 'none', marginBottom: 0, flex: 1 }}>
                                                    <i className={`bx ${iconMatch} coding-icon`} />
                                                    <div>
                                                        <h5 style={{ fontSize: 15, marginBottom: 2 }}>{item.platform}</h5>
                                                        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{item.handle || 'View Profile'}</p>
                                                    </div>
                                                </a>
                                                <div style={{ paddingRight: 12 }}>
                                                    <button title="Delete" onClick={() => requestDelete('codingProfiles', index)} className="delete-icon-btn">
                                                        <Trash2 size={16} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <ProjectsCard list={data.projects} onAdd={() => openRecord('projects')} onDelete={(idx) => requestDelete('projects', idx)} />

                        <TimelineCard
                            title="Education"
                            list={data.education}
                            iconCls="bxs-graduation"
                            bg="#f5e6ff"
                            color="#9333ea"
                            onAdd={() => openRecord('education')}
                            onDelete={(idx) => requestDelete('education', idx)}
                        />
                    </div>

                    {/* RIGHT COLUMN */}
                    <div>
                        <div className="profile-card">
                            <div className="card-body">
                                <h3 className="section-title">Resumes &amp; Documents</h3>

                                <h4 style={{ fontSize: 14, marginBottom: 12, color: 'var(--text-secondary)' }}>Primary Resume</h4>
                                <div className="file-upload-row">
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div className="file-icon">
                                            <i className="bx bxs-file-pdf" />
                                        </div>
                                        <div className="file-details">
                                            <h5>{data.uploadedResume?.name}</h5>
                                            <p>
                                                {data.uploadedResume?.size} · Uploaded {data.uploadedResume?.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="file-actions">
                                        <i className="bx bx-trash" onClick={() => window.alert('Delete functionality coming soon!')} />
                                    </div>
                                </div>

                                <h4 style={{ fontSize: 14, marginTop: 24, marginBottom: 12, color: 'var(--text-secondary)' }}>Additional Documents</h4>
                                <div>
                                    {data.additionalDocs &&
                                        data.additionalDocs.map((doc, index) => (
                                            <div className="file-upload-row" style={{ padding: 12, background: '#f8fafc', border: '1px dashed #cbd5e1' }} key={index}>
                                                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                    <div className="file-icon" style={{ color: 'var(--blue-dark)', fontSize: 20 }}>
                                                        <i className="bx bx-file" />
                                                    </div>
                                                    <div className="file-details">
                                                        <h5 style={{ fontSize: 13 }}>{doc.name}</h5>
                                                        <p style={{ fontSize: 11 }}>
                                                            {doc.type} · {doc.size}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="file-actions">
                                                    <i className="bx bx-trash" style={{ cursor: 'pointer' }} onClick={() => requestDelete('additionalDocs', index)} />
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                <div className="drag-drop-box" onClick={() => docUploadRef.current && docUploadRef.current.click()}>
                                    <i className="bx bx-upload" />
                                    <h5>Upload Document (Marksheets, Proofs)</h5>
                                </div>
                                <input type="file" ref={docUploadRef} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleDocUpload} />
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="card-body">
                                <h3 className="section-title">
                                    Skills{' '}
                                    <button className="edit-btn edit-btn--label" onClick={openSkills}>
                                        <Pencil size={15} aria-hidden="true" /> Manage
                                    </button>
                                </h3>
                                <div className="skills-wrapper">
                                    {!data.skills || data.skills.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No skills added.</p>
                                    ) : (
                                        data.skills.map((item, index) => (
                                            <div className="skill-pill" style={{ display: 'flex', alignItems: 'center', gap: 6 }} key={index}>
                                                {item}
                                                <button
                                                    type="button"
                                                    className="delete-icon-btn"
                                                    onClick={() => requestDelete('skills', index)}
                                                    style={{ color: '#94a3b8', padding: 2 }}
                                                    title={`Delete ${item}`}
                                                    aria-label={`Delete ${item}`}
                                                >
                                                    <Trash2 size={14} aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-card">
                            <div className="card-body">
                                <h3 className="section-title">
                                    Languages{' '}
                                    <button className="edit-btn edit-btn--label" onClick={openLanguages}>
                                        <Plus size={15} aria-hidden="true" /> Add
                                    </button>
                                </h3>
                                <div className="skills-wrapper" style={{ gap: 16 }}>
                                    {!data.languages || data.languages.length === 0 ? (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>None added.</p>
                                    ) : (
                                        data.languages.map((lang, index) => (
                                            <div
                                                className="lang-pill"
                                                style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minWidth: 140, padding: '12px 16px' }}
                                                key={index}
                                            >
                                                <div>
                                                    <span className="lang-name" style={{ display: 'block' }}>
                                                        {lang.name}
                                                    </span>
                                                    <span className="lang-level" style={{ display: 'block' }}>
                                                        {lang.level}
                                                    </span>
                                                </div>
                                                <button type="button" title={`Delete ${lang.name}`} aria-label={`Delete ${lang.name}`} onClick={() => requestDelete('languages', index)} className="delete-icon-btn" style={{ marginLeft: 8 }}>
                                                    <Trash2 size={15} aria-hidden="true" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <TimelineCard
                            title="Certifications"
                            list={data.certifications}
                            iconCls="bx-certification"
                            bg="#e6f0ff"
                            color="#2563eb"
                            short
                            onAdd={() => openRecord('certifications')}
                            onDelete={(idx) => requestDelete('certifications', idx)}
                        />

                        <TimelineCard
                            title="Extracurricular"
                            list={data.extracurricular}
                            iconCls="bx-group"
                            bg="#e6ffed"
                            color="#16a34a"
                            onAdd={() => openRecord('extracurricular')}
                            onDelete={(idx) => requestDelete('extracurricular', idx)}
                        />
                    </div>
                </div>
            </div>

            {/* Intro Modal */}
            <dialog ref={dialogRefs.intro} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Edit Intro</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <form onSubmit={saveIntro}>
                    <div className="modal-form-group">
                        <label>Full Name</label>
                        <input type="text" required value={introForm.name} onChange={(e) => setIntroForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Email</label>
                        <input type="email" required value={introForm.email} onChange={(e) => setIntroForm((f) => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Headline</label>
                        <input type="text" required value={introForm.headline} onChange={(e) => setIntroForm((f) => ({ ...f, headline: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>University</label>
                        <input type="text" value={introForm.university} onChange={(e) => setIntroForm((f) => ({ ...f, university: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Placement Batch</label>
                        <input type="text" value={introForm.batch} onChange={(e) => setIntroForm((f) => ({ ...f, batch: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Location</label>
                        <input type="text" minLength={3} value={introForm.location} onChange={(e) => setIntroForm((f) => ({ ...f, location: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            pattern="[0-9\+\-\s]{10,15}"
                            title="Please enter a valid 10-15 digit phone number"
                            value={introForm.phone}
                            onChange={(e) => setIntroForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                    </div>

                    <h4 style={{ margin: '16px 0 8px', fontSize: 15 }}>Social Links</h4>
                    <div className="modal-form-group">
                        <label>GitHub URL</label>
                        <input type="url" value={introForm.github} onChange={(e) => setIntroForm((f) => ({ ...f, github: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>LinkedIn URL</label>
                        <input type="url" value={introForm.linkedin} onChange={(e) => setIntroForm((f) => ({ ...f, linkedin: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Portfolio URL</label>
                        <input type="url" value={introForm.portfolio} onChange={(e) => setIntroForm((f) => ({ ...f, portfolio: e.target.value }))} />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            Save
                        </button>
                    </div>
                </form>
            </dialog>

            {/* About Modal */}
            <dialog ref={dialogRefs.about} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Edit About</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <form onSubmit={saveAbout}>
                    <div className="modal-form-group">
                        <label>Summary</label>
                        <textarea rows={6} required value={aboutText} onChange={(e) => setAboutText(e.target.value)} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            Save
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Skills Modal */}
            <dialog ref={dialogRefs.skills} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Add Skill</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <form onSubmit={saveSkill}>
                    <div className="modal-form-group">
                        <label>Skill Name</label>
                        <input type="text" placeholder="e.g. React.js, Python, Figma" required value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            Add Skill
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Languages Modal */}
            <dialog ref={dialogRefs.languages} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Add Language</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <form onSubmit={saveLanguage}>
                    <div className="modal-form-group">
                        <label>Language</label>
                        <input type="text" placeholder="e.g. French" required value={langForm.name} onChange={(e) => setLangForm((f) => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Proficiency</label>
                        <select
                            required
                            value={langForm.level}
                            onChange={(e) => setLangForm((f) => ({ ...f, level: e.target.value }))}
                            style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-sans)' }}
                        >
                            <option value="Native">Native</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Professional">Professional</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Beginner">Beginner</option>
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            Save
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Coding Profiles Modal */}
            <dialog ref={dialogRefs.codingProfiles} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Add Coding Profile</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <form onSubmit={saveCoding}>
                    <div className="modal-form-group">
                        <label>Platform (e.g. LeetCode, Codeforces)</label>
                        <input type="text" required value={codingForm.platform} onChange={(e) => setCodingForm((f) => ({ ...f, platform: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Profile URL</label>
                        <input type="url" required value={codingForm.url} onChange={(e) => setCodingForm((f) => ({ ...f, url: e.target.value }))} />
                    </div>
                    <div className="modal-form-group">
                        <label>Handle / Username (Optional)</label>
                        <input type="text" value={codingForm.handle} onChange={(e) => setCodingForm((f) => ({ ...f, handle: e.target.value }))} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={closeModal}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                            Save
                        </button>
                    </div>
                </form>
            </dialog>

            {/* Generic Record Modal */}
            <dialog ref={dialogRefs.record} className="profile-modal" onClose={closeModal}>
                <div className="modal-header">
                    <h3>Add Record</h3>
                    <button className="modal-close" onClick={closeModal}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                {recLabel && (
                    <form onSubmit={saveRecord}>
                        <div className="modal-form-group">
                            <label>{recLabel.title}</label>
                            <input type="text" required value={recordForm.title} onChange={(e) => setRecordForm((f) => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="modal-form-group">
                            <label>{recLabel.subtitle}</label>
                            <input type="text" required value={recordForm.subtitle} onChange={(e) => setRecordForm((f) => ({ ...f, subtitle: e.target.value }))} />
                        </div>

                        {recLabel.showDuration && (
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <div className="modal-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label>Start Date</label>
                                    <input type="month" required value={recordForm.start} onChange={(e) => setRecordForm((f) => ({ ...f, start: e.target.value }))} />
                                </div>
                                <div className="modal-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                    <label>End Date</label>
                                    <input type="month" value={recordForm.end} onChange={(e) => setRecordForm((f) => ({ ...f, end: e.target.value }))} />
                                </div>
                            </div>
                        )}

                        {recLabel.showLink && (
                            <div className="modal-form-group">
                                <label>External Link (e.g. GitHub)</label>
                                <input type="url" placeholder="https://..." value={recordForm.link} onChange={(e) => setRecordForm((f) => ({ ...f, link: e.target.value }))} />
                            </div>
                        )}

                        {recLabel.showDesc && (
                            <div className="modal-form-group">
                                <label>Description</label>
                                <textarea rows={4} value={recordForm.desc} onChange={(e) => setRecordForm((f) => ({ ...f, desc: e.target.value }))} />
                            </div>
                        )}

                        {recLabel.showImg && (
                            <div className="modal-form-group">
                                <label>Attach Image Evidence (Optional)</label>
                                <input type="file" ref={recordImgInputRef} accept="image/*" onChange={handleRecordImageChange} />
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
                                Save Record
                            </button>
                        </div>
                    </form>
                )}
            </dialog>

            {/* Image Options Modal */}
            <dialog ref={dialogRefs.imageOptions} className="profile-modal" style={{ width: 380 }} onClose={() => setImageOptionsTarget(null)}>
                <div className="modal-header">
                    <h3>{imageOptionsTarget === 'bannerImage' ? 'Update Background' : 'Update Profile Picture'}</h3>
                    <button className="modal-close" onClick={() => setImageOptionsTarget(null)}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <button
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: 16, border: '1px solid #e2e8f0', fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}
                        onClick={() => triggerImageUpload('storage')}
                    >
                        <i className="bx bx-upload" style={{ fontSize: 20, color: 'var(--brand-primary)', marginRight: 12 }} /> Upload from Storage
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: 16, border: '1px solid #e2e8f0', fontSize: 15, color: 'var(--text-primary)', fontWeight: 500 }}
                        onClick={() => triggerImageUpload('camera')}
                    >
                        <i className="bx bx-camera" style={{ fontSize: 20, color: '#10b981', marginRight: 12 }} /> Use Camera
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ width: '100%', justifyContent: 'flex-start', padding: 16, border: '1px solid #fee2e2', background: '#fef2f2', fontSize: 15, color: '#ef4444', fontWeight: 500 }}
                        onClick={triggerImageDelete}
                    >
                        <i className="bx bx-trash" style={{ fontSize: 20, marginRight: 12 }} /> Delete Image
                    </button>
                </div>
            </dialog>

            {/* Confirm Delete Modal */}
            <dialog ref={dialogRefs.confirmDelete} className="profile-modal" style={{ width: 400, textAlign: 'center' }} onClose={() => setConfirmDelete(null)}>
                <div style={{ padding: '32px 24px' }}>
                    <div
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 36,
                            margin: '0 auto 20px auto',
                        }}
                    >
                        <Trash2 size={24} aria-hidden="true"/>
                        <i className="bx bx-trash" />
                    </div>
                    <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 12 }}>Delete Record?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14, lineHeight: 1.5 }}>
                        Are you sure you want to permanently remove this item from your profile? This action cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>
                            Cancel
                        </button>
                        <button className="btn-primary" style={{ flex: 1, background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }} onClick={executeDelete}>
                            Yes, Delete
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

function TimelineCard({ title, list, iconCls, bg, color, short, onAdd, onDelete }) {
    return (
        <div className="profile-card">
            <div className="card-body">
                <h3 className="section-title">
                    {title}{' '}
                    <button type="button" className="edit-btn edit-btn--label" onClick={onAdd}>
                        <Plus size={15} aria-hidden="true" /> Add
                    </button>
                </h3>
                {!list || list.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No items added yet.</p>
                ) : (
                    list.map((item, index) => {
                        const issuerOrCompany = item.company || item.institution || item.issuer || item.tags || '';
                        const dateStr = item.duration || item.date || '';
                        return (
                            <div className="timeline-item" key={index}>
                                <div className="timeline-icon" style={{ backgroundColor: bg, color }}>
                                    <i className={`bx ${iconCls}`} />
                                </div>
                                <div className="timeline-content">
                                    <div className="timeline-header">
                                        <h4>{item.title || item.degree}</h4>
                                        <button type="button" title={`Delete ${item.title || item.degree}`} aria-label={`Delete ${item.title || item.degree}`} onClick={() => onDelete(index)} className="delete-icon-btn">
                                            <Trash2 size={15} aria-hidden="true" />
                                        </button>
                                    </div>
                                    <p className="company">{issuerOrCompany}</p>
                                    <p className="duration">{dateStr}</p>
                                    {!short && item.desc && <p className="desc">{item.desc}</p>}
                                    {item.image && <img src={item.image} className="timeline-image" alt="Evidence" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

function ProjectsCard({ list, onAdd, onDelete }) {
    return (
        <div className="profile-card">
            <div className="card-body">
                <h3 className="section-title">
                    Projects{' '}
                    <button type="button" className="edit-btn edit-btn--label" onClick={onAdd}>
                        <Plus size={15} aria-hidden="true" /> Add
                    </button>
                </h3>
                {!list || list.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No projects added yet.</p>
                ) : (
                    list.map((item, index) => (
                        <div className="timeline-item" key={index}>
                            <div className="timeline-icon" style={{ backgroundColor: 'var(--purple-light)', color: 'var(--purple-dark)' }}>
                                <i className="bx bx-code-alt" />
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h4 style={{ display: 'flex', alignItems: 'center' }}>
                                        {item.title}{' '}
                                        {item.github && (
                                            <a href={item.github} target="_blank" rel="noreferrer" style={{ color: '#64748b', marginLeft: 12, fontSize: 20 }} title="View Source">
                                                <i className="bx bxl-github" />
                                            </a>
                                        )}
                                    </h4>
                                    <button type="button" title={`Delete ${item.title}`} aria-label={`Delete ${item.title}`} onClick={() => onDelete(index)} className="delete-icon-btn">
                                        <Trash2 size={15} aria-hidden="true" />
                                    </button>
                                </div>
                                <p className="duration" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: 13, marginTop: 2 }}>
                                    {item.tags || ''}
                                </p>
                                <p className="desc" style={{ marginTop: 8 }}>
                                    {item.description || item.desc}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
