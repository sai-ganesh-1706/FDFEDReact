import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { errorMessage } from '../../../services/api.js';
import { useUI } from '../context/UIContext.jsx';
import '../styles/opportunities.css';
import { Trash2, Check } from 'lucide-react';


function mapDept(dept) {
    if (dept === 'Computer Science') return 'CSE';
    if (dept === 'Information Technology') return 'IT';
    if (dept === 'Electronics') return 'ECE';
    return dept;
}

export default function Opportunities() {
    const { store, updateStore, applyToJob, toggleSaved } = useStore();
    const { openAskQuery } = useUI();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [activeJobId, setActiveJobId] = useState(() => {
        const passed = searchParams.get('jobId');
        if (passed) return parseInt(passed, 10);
        return store.recruiterJobs.length > 0 ? store.recruiterJobs[0].id : null;
    });
    const [typeFilter, setTypeFilter] = useState('All');
    const [query, setQuery] = useState('');
    // Advanced filters live here now (there is only one search box in the portal)
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advanced, setAdvanced] = useState({ location: '', branch: 'Any', minLpa: '', sort: 'latest' });
    const [applyError, setApplyError] = useState('');

    const [eligibilityInfo, setEligibilityInfo] = useState(null); // { job, isEligible, cgpaPass, branchPass, mappedDept }
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [pendingApplyJobId, setPendingApplyJobId] = useState(null);

    // Multi-step apply modal
    const [applyStep, setApplyStep] = useState(1); // 1=Info, 2=Resume, 3=Questions, 4=Review
    const [selectedResume, setSelectedResume] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const resumeInputRef = useRef(null);

    const resumeHistory = store.profileResumeData?.resumeHistory || [];

    const eligibilityRef = useRef(null);
    const termsRef = useRef(null);
    const successRef = useRef(null);

    useEffect(() => {
        const el = eligibilityRef.current;
        if (!el) return;
        if (eligibilityInfo && !el.open) el.showModal();
        if (!eligibilityInfo && el.open) el.close();
    }, [eligibilityInfo]);

    useEffect(() => {
        const el = termsRef.current;
        if (!el) return;
        if (termsOpen && !el.open) el.showModal();
        if (!termsOpen && el.open) el.close();
    }, [termsOpen]);

    useEffect(() => {
        const el = successRef.current;
        if (!el) return;
        if (successOpen && !el.open) el.showModal();
        if (!successOpen && el.open) el.close();
    }, [successOpen]);

    const filteredJobs = useMemo(() => {
        let jobs = store.recruiterJobs;
        const q = query.toLowerCase().trim();

        if (!q) {
            jobs = jobs.filter((j) => !j.appliedStatus);
        }

        if (typeFilter === 'Full-time') jobs = jobs.filter((j) => j.type.includes('Full-Time') || j.type.includes('Full-time'));
        else if (typeFilter === 'Internship') jobs = jobs.filter((j) => j.type.includes('Internship'));

        if (q) {
            jobs = jobs.filter(
                (j) =>
                    j.title.toLowerCase().includes(q) ||
                    j.company.toLowerCase().includes(q) ||
                    (j.tags && j.tags.some((t) => t.toLowerCase().includes(q)))
            );
        }
        if (advanced.location.trim()) {
            const loc = advanced.location.trim().toLowerCase();
            jobs = jobs.filter((j) => (j.location || '').toLowerCase().includes(loc));
        }
        if (advanced.branch !== 'Any') {
            jobs = jobs.filter((j) => (j.branches || []).includes(advanced.branch) || (j.branches || []).includes('Any'));
        }
        if (advanced.minLpa !== '') {
            const min = parseFloat(advanced.minLpa);
            jobs = jobs.filter((j) => {
                const m = String(j.salary || '').match(/(\d+(?:\.\d+)?)\s*LPA/i);
                return m ? parseFloat(m[1]) >= min : false;
            });
        }
        if (advanced.sort === 'deadline') jobs = [...jobs].sort((a, b) => String(a.deadline).localeCompare(String(b.deadline)));
        else if (advanced.sort === 'cgpa') jobs = [...jobs].sort((a, b) => Number(a.cgpa) - Number(b.cgpa));
        else jobs = [...jobs].sort((a, b) => b.id - a.id);
        return jobs;
    }, [store.recruiterJobs, typeFilter, query, advanced]);

    useEffect(() => {
        if (filteredJobs.length > 0 && !filteredJobs.find((j) => j.id === activeJobId)) {
            setActiveJobId(filteredJobs[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredJobs]);

    const activeJob = store.recruiterJobs.find((j) => j.id === activeJobId);

    async function applyJob(jobId, resumeFile) {
        const job = store.recruiterJobs.find((j) => j.id === jobId);
        if (!job) return false;
        setApplyError('');
        try {
            await applyToJob(job, resumeFile);
            return true;
        } catch (error) {
            setApplyError(errorMessage(error, 'Could not submit your application.'));
            return false;
        }
    }

    function checkEligibility(jobId) {
        const job = store.recruiterJobs.find((j) => j.id === jobId);
        if (!job) return;

        const userCgpa = parseFloat(store.currentUser.cgpa);
        const reqCgpa = parseFloat(job.cgpa);
        const cgpaPass = userCgpa >= reqCgpa;

        const mappedDept = mapDept(store.currentUser.department || '');
        const branchPass = job.branches.includes(mappedDept) || job.branches.includes('Any');
        const isEligible = cgpaPass && branchPass;

        setEligibilityInfo({ job, isEligible, cgpaPass, branchPass, mappedDept, userCgpa, reqCgpa });

        updateStore((s) => {
            const innerJob = s.recruiterJobs.find((j) => j.id === jobId);
            if (innerJob) innerJob.eligibilityChecked = true;
        });
    }

    function confirmEligibilityApply(jobId) {
        setEligibilityInfo(null);
        setTermsChecked(false);
        setApplyStep(1);
        // Pre-select the most recent resume if available
        const history = store.profileResumeData?.resumeHistory || [];
        setSelectedResume(history.length > 0 ? history[0].name : null);
        setUploadedFile(null);
        setPendingApplyJobId(jobId);
        setTermsOpen(true);
    }

    async function finalizeApplication() {
        setTermsOpen(false);
        const applied = pendingApplyJobId != null ? await applyJob(pendingApplyJobId, selectedResume) : false;
        if (applied) setTimeout(() => setSuccessOpen(true), 300);
    }

    function handleResumeUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const newEntry = { name: file.name, date: new Date().toISOString().split('T')[0], size: `${Math.round(file.size / 1024)} KB` };
        updateStore((s) => {
            if (!s.profileResumeData) s.profileResumeData = {};
            const rd = s.profileResumeData;
            rd.uploadedResume = newEntry;
            rd.resumeHistory = [newEntry, ...(rd.resumeHistory || [])];
        });
        setUploadedFile(newEntry);
        setSelectedResume(file.name);
        e.target.value = '';
    }

    const isJob = (job) => job.type.includes('Full-Time') || job.type.includes('Full-time');

    return (
        <>
            <div className="opportunities-toolbar">
                <div className="search-container">
                    <i className="bx bx-search" />
                    <input
                        type="text"
                        placeholder="Search jobs, companies, skills..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="filter-actions">
                    {['All', 'Full-time', 'Internship'].map((f) => (
                        <button key={f} className={`filter-btn ${typeFilter === f ? 'active' : ''}`} onClick={() => setTypeFilter(f)}>
                            {f}
                        </button>
                    ))}
                    <button className={`filter-btn ${showAdvanced ? 'active' : ''}`} onClick={() => setShowAdvanced((v) => !v)}>
                        <i className="bx bx-slider-alt" /> Filters
                    </button>
                    <span className="opp-count-text">
                        <span>{filteredJobs.length}</span> opportunities
                    </span>
                </div>
            </div>

            {showAdvanced && (
                <div className="advanced-filter-bar">
                    <label>
                        <span>Location</span>
                        <input type="text" placeholder="e.g. Bangalore" value={advanced.location} onChange={(e) => setAdvanced((a) => ({ ...a, location: e.target.value }))} />
                    </label>
                    <label>
                        <span>Branch</span>
                        <select value={advanced.branch} onChange={(e) => setAdvanced((a) => ({ ...a, branch: e.target.value }))}>
                            {['Any', 'CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'].map((b) => <option key={b}>{b}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>Min package (LPA)</span>
                        <input type="number" min="0" placeholder="e.g. 10" value={advanced.minLpa} onChange={(e) => setAdvanced((a) => ({ ...a, minLpa: e.target.value }))} />
                    </label>
                    <label>
                        <span>Sort by</span>
                        <select value={advanced.sort} onChange={(e) => setAdvanced((a) => ({ ...a, sort: e.target.value }))}>
                            <option value="latest">Newest first</option>
                            <option value="deadline">Closing soon</option>
                            <option value="cgpa">Lowest CGPA cut-off</option>
                        </select>
                    </label>
                    <button className="btn-secondary" onClick={() => setAdvanced({ location: '', branch: 'Any', minLpa: '', sort: 'latest' })}>Reset</button>
                </div>
            )}
            {applyError && <div className="inline-alert inline-alert--error">{applyError}</div>}

            <div className="split-layout">
                <div className="jobs-list-col">
                    {filteredJobs.map((job) => {
                        const jobIsJob = isJob(job);
                        const typeBadgeClass = jobIsJob ? 'type-job' : 'type-intern';
                        const typeBadgeText = jobIsJob ? 'Job' : 'Intern';
                        const previewTags = job.tags ? job.tags.slice(0, 2) : [];
                        return (
                            <div
                                key={job.id}
                                className={`job-item-card ${job.id === activeJobId ? 'active-card' : ''}`}
                                onClick={() => setActiveJobId(job.id)}
                            >
                                <div className="job-item-header">
                                    <h4>{job.title}</h4>
                                    <span className={`type-badge ${typeBadgeClass}`}>{typeBadgeText}</span>
                                </div>
                                <div className="job-item-company">{job.company}</div>
                                <div className="job-item-meta">
                                    <span>
                                        <i className="bx bx-map" /> {job.location.split(',')[0]}
                                    </span>
                                    <span>
                                        <strong>{job.salary}</strong>
                                    </span>
                                </div>
                                <div className="job-item-footer">
                                    <div className="tag-list">
                                        {previewTags.map((tag) => (
                                            <span className="tag-small" key={tag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {job.appliedStatus === 'Applied' && (
                                        <span className="status-indicator text-applied">
                                            <i className="bx bx-check" /> Applied
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="job-details-col">
                    <div className="details-content">
                        {!activeJob ? (
                            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No opportunities match your search.</div>
                        ) : (
                            <ActiveJobDetails
                                job={activeJob}
                                store={store}
                                onApply={confirmEligibilityApply}
                                onCheckEligibility={checkEligibility}
                                onAskQuery={openAskQuery}
                                isSaved={store.savedDriveIds.includes(activeJob.id)}
                                onToggleSave={async () => {
                                    try { await toggleSaved(activeJob.id, store.savedDriveIds.includes(activeJob.id)); }
                                    catch (error) { setApplyError(errorMessage(error, 'Could not update saved drives.')); }
                                }}
                                onGoToApplications={() => navigate('/candidate/applications')}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Eligibility Check Modal */}
            <dialog ref={eligibilityRef} className="profile-modal" onClose={() => setEligibilityInfo(null)}>
                <div className="modal-header">
                    <h3>Eligibility Check</h3>
                    <button className="modal-close" onClick={() => setEligibilityInfo(null)}>
                        <i className="bx bx-x" />
                    </button>
                </div>
                <div style={{ padding: 24, color: 'var(--text-primary)' }}>
                    {eligibilityInfo && (
                        <>
                            <div style={{ marginBottom: 24, textAlign: 'center' }}>
                                <div
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        background: eligibilityInfo.isEligible ? '#dcfce7' : '#fee2e2',
                                        color: eligibilityInfo.isEligible ? '#16a34a' : '#dc2626',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 32,
                                        margin: '0 auto 16px auto',
                                    }}
                                >
                                    <Check size={36}/>
                                    <i className={`bx ${eligibilityInfo.isEligible ? 'bx-check' : 'bx-x'}`} />
                                </div>
                                <h3 style={{ fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>
                                    {eligibilityInfo.isEligible ? 'You are Eligible!' : 'Not Eligible'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                                    {eligibilityInfo.job.title} at {eligibilityInfo.job.company}
                                </p>
                            </div>

                            <div style={{ border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                                <div
                                    style={{
                                        display: 'flex',
                                        background: '#f8fafc',
                                        padding: '12px 16px',
                                        fontWeight: 600,
                                        fontSize: 13,
                                        color: '#64748b',
                                        borderBottom: '1px solid #e2e8f0',
                                    }}
                                >
                                    <div style={{ flex: 2 }}>Criteria</div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>Required</div>
                                    <div style={{ flex: 1, textAlign: 'center' }}>Your Profile</div>
                                    <div style={{ width: 40 }} />
                                </div>

                                <div style={{ display: 'flex', padding: 16, alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
                                    <div style={{ flex: 2, fontWeight: 500, fontSize: 14 }}>Minimum CGPA</div>
                                    <div style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>{eligibilityInfo.reqCgpa.toFixed(1)}</div>
                                    <div style={{ flex: 1, textAlign: 'center', fontSize: 14, color: eligibilityInfo.cgpaPass ? 'inherit' : '#ef4444' }}>
                                        {eligibilityInfo.userCgpa.toFixed(1)}
                                    </div>
                                    <div style={{ width: 40, textAlign: 'center' }}>
                                        {eligibilityInfo.cgpaPass ? (
                                            <i className="bx bx-check-circle" style={{ color: '#10b981', fontSize: 20 }} />
                                        ) : (
                                            <i className="bx bx-x-circle" style={{ color: '#ef4444', fontSize: 20 }} />
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', padding: 16, alignItems: 'center' }}>
                                    <div style={{ flex: 2, fontWeight: 500, fontSize: 14 }}>Branch</div>
                                    <div style={{ flex: 1, textAlign: 'center', fontSize: 14 }}>{eligibilityInfo.job.branches.join(', ')}</div>
                                    <div style={{ flex: 1, textAlign: 'center', fontSize: 14, color: eligibilityInfo.branchPass ? 'inherit' : '#ef4444' }}>
                                        {eligibilityInfo.mappedDept}
                                    </div>
                                    <div style={{ width: 40, textAlign: 'center' }}>
                                        {eligibilityInfo.branchPass ? (
                                            <i className="bx bx-check-circle" style={{ color: '#10b981', fontSize: 20 }} />
                                        ) : (
                                            <i className="bx bx-x-circle" style={{ color: '#ef4444', fontSize: 20 }} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button className="btn-secondary" onClick={() => setEligibilityInfo(null)}>
                                    Close
                                </button>
                                {eligibilityInfo.isEligible ? (
                                    <button className="btn-primary" onClick={() => confirmEligibilityApply(eligibilityInfo.job.id)}>
                                        Apply Now
                                    </button>
                                ) : (
                                    <button className="btn-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                        Apply Now
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </dialog>

            {/* ── Multi-Step Apply Modal ── */}
            <dialog ref={termsRef} className="profile-modal" style={{ width: 560, maxWidth: '95vw', padding: 0 }} onClose={() => setTermsOpen(false)}>
                {/* Progress bar */}
                <div style={{ padding: '20px 28px 0 28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            Apply to {store.recruiterJobs.find(j => j.id === pendingApplyJobId)?.company || 'Company'}
                        </h3>
                        <button className="modal-close" onClick={() => setTermsOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#64748b' }}>
                            <i className="bx bx-x" />
                        </button>
                    </div>
                    {/* Blue progress bar */}
                    <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ height: '100%', width: `${(applyStep / 4) * 100}%`, background: '#2563eb', borderRadius: 2, transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', textAlign: 'right', marginBottom: 16 }}>{applyStep}/4 pages</div>
                </div>

                <div style={{ padding: '0 28px 28px 28px', maxHeight: '72vh', overflowY: 'auto' }}>

                    {/* ── Step 1: Contact Info ── */}
                    {applyStep === 1 && (
                        <div>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                Confirm your contact information before applying.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name *</label>
                                    <input type="text" defaultValue={store.currentUser?.name} readOnly style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#f9fafb', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email *</label>
                                    <input type="email" defaultValue={store.currentUser?.email} readOnly style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#f9fafb', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Phone *</label>
                                    <input type="tel" defaultValue={store.currentUser?.phone} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>LinkedIn Profile (optional)</label>
                                    <input type="url" defaultValue={store.currentUser?.socialLinks?.linkedin} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28 }}>
                                <button className="btn-secondary" onClick={() => setTermsOpen(false)}>Cancel</button>
                                <button className="btn-primary" onClick={() => setApplyStep(2)}>Next  > </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Resume Selection (matches screenshot) ── */}
                    {applyStep === 2 && (
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Resume *</p>
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                                Select or upload a resume in DOC, DOCX, or PDF format that is less than 2MB
                            </p>

                            {/* Resume list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(store.profileResumeData?.resumeHistory || []).map((resume, idx) => {
                                    const isSelected = selectedResume === resume.name;
                                    const displayDate = resume.date
                                        ? new Date(resume.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                                        : '';
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedResume(resume.name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                border: isSelected ? '1.5px solid #374151' : '1px solid #e5e7eb',
                                                borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                                                background: isSelected ? '#f8fafc' : 'white', transition: 'border 0.15s'
                                            }}
                                        >
                                            {/* PDF badge */}
                                            <div style={{ width: 44, height: 48, background: '#dc2626', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span style={{ color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>PDF</span>
                                            </div>
                                            {/* File name and date */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 300 }}>
                                                    {resume.name.length > 35 ? resume.name.slice(0, 32) + '...' : resume.name}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{displayDate}</div>
                                            </div>
                                            {/* Download icon */}
                                            <i className="bx bx-download" style={{ fontSize: 18, color: '#9ca3af', flexShrink: 0 }} />
                                            {/* Radio button */}
                                            <div
                                                style={{
                                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                                    border: isSelected ? '6px solid #16a34a' : '2px solid #d1d5db',
                                                    background: 'white', transition: 'border 0.15s'
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Upload resume button */}
                            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
                            <button
                                onClick={(e) => { e.stopPropagation(); resumeInputRef.current?.click(); }}
                                style={{
                                    marginTop: 16, display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 18px', borderRadius: 20, border: '1.5px solid #2563eb',
                                    background: 'white', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                Upload resume
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 28 }}>
                                <button className="btn-secondary" onClick={() => setApplyStep(1)}>← Back</button>
                                <button className="btn-primary" disabled={!selectedResume} style={{ opacity: selectedResume ? 1 : 0.5 }} onClick={() => setApplyStep(3)}>Next  > </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 3: Application Questions ── */}
                    {applyStep === 3 && (
                        <div>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                                Additional questions from the recruiter.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                                        Are you currently eligible to work in India? *
                                    </label>
                                    <select defaultValue="yes" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                                        How many years of relevant experience do you have? *
                                    </label>
                                    <select defaultValue="0" style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}>
                                        <option value="0">Fresher / 0 years</option>
                                        <option value="1">1 year</option>
                                        <option value="2">2 years</option>
                                        <option value="3+">3+ years</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                                        Cover letter / additional message (optional)
                                    </label>
                                    <textarea rows={4} placeholder="Tell the recruiter why you are a great fit..." style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 28 }}>
                                <button className="btn-secondary" onClick={() => setApplyStep(2)}>← Back</button>
                                <button className="btn-primary" onClick={() => setApplyStep(4)}>Next  > </button>
                            </div>
                        </div>
                    )}

                    {/* ── Step 4: Review & Terms ── */}
                    {applyStep === 4 && (
                        <div>
                            {/* Summary */}
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 12 }}>Application Summary</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span style={{ color: '#6b7280' }}>Position</span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{store.recruiterJobs.find(j => j.id === pendingApplyJobId)?.title}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                                    <span style={{ color: '#6b7280' }}>Company</span>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{store.recruiterJobs.find(j => j.id === pendingApplyJobId)?.company}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#6b7280' }}>Resume</span>
                                    <span style={{ fontWeight: 600, color: '#111827', maxWidth: 220, textAlign: 'right', wordBreak: 'break-all' }}>{selectedResume || '—'}</span>
                                </div>
                            </div>
                            {/* Terms checkbox */}
                            <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16, color: '#374151' }}>
                                By applying, you acknowledge that you have read the job description and meet the requirements. All information in your profile is accurate.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28, background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                                <input type="checkbox" id="chk-terms" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} style={{ marginTop: 3, transform: 'scale(1.2)', cursor: 'pointer', flexShrink: 0 }} />
                                <label htmlFor="chk-terms" style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151' }}>
                                    I have read all the rules and regulations of the company, and I abide by them.
                                </label>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button className="btn-secondary" onClick={() => setApplyStep(3)}>← Back</button>
                                <button className="btn-primary" disabled={!termsChecked} style={{ opacity: termsChecked ? 1 : 0.5 }} onClick={finalizeApplication}>
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </dialog>

            {/* Success Modal */}
            <dialog ref={successRef} className="profile-modal" style={{ width: 400, textAlign: 'center' }} onClose={() => setSuccessOpen(false)}>
                <div style={{ padding: '40px 24px' }}>
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 48,
                            margin: '0 auto 24px auto',
                        }}
                    >
                        <Check size={36}/>
                        <i className="bx bx-check" />
                    </div>
                    <h2 style={{ fontSize: 24, color: 'var(--text-primary)', marginBottom: 12 }}>Applied Successfully!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
                        Your application is now with the recruiter. Track its progress in My Applications.
                    </p>
                    <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        onClick={() => {
                            setSuccessOpen(false);
                            navigate('/candidate/applications');
                        }}
                    >
                        Go to My Applications
                    </button>
                </div>
            </dialog>
        </>
    );
}

function ActiveJobDetails({ job, store, onApply, onCheckEligibility, onAskQuery, onGoToApplications, isSaved, onToggleSave }) {
    const jobIsJob = job.type.includes('Full-Time') || job.type.includes('Full-time');
    const badgeClass = jobIsJob ? 'type-job' : 'type-intern';
    const badgeText = jobIsJob ? 'Full-time Job' : 'Intern';
    const compensationLabel = jobIsJob ? 'CTC' : 'Stipend';

    const mappedDept = mapDept(store.currentUser.department || '');
    const branchPass = job.branches.includes(mappedDept) || job.branches.includes('Any');
    const cgpaPass = store.currentUser.cgpa >= job.cgpa;

    let actionButton;
    let warning = null;

    if (job.appliedStatus) {
        actionButton = (
            <button
                className="btn-applied-state"
                onClick={onGoToApplications}
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: 16, fontWeight: 600, background: '#e2e8f0', color: '#475569', border: 'none', marginBottom: 20 }}
            >
                <i className="bx bx-check" /> Tracking in My Applications
            </button>
        );
        warning = <div className="cgpa-warning" style={{ color: '#64748b', fontSize: 13 }}>You have already submitted an application for this role.</div>;
    } else if (job.eligibilityChecked) {
        if (cgpaPass && branchPass) {
            actionButton = (
                <button
                    className="btn-primary"
                    onClick={() => onApply(job.id)}
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: 16, fontWeight: 600, backgroundColor: '#16a34a', border: 'none', marginBottom: 20, transition: 'background 0.2s' }}
                >
                    Apply Now
                </button>
            );
            warning = (
                <div className="cgpa-warning" style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
                    <i className="bx bx-check" /> You are eligible to apply!
                </div>
            );
        } else {
            actionButton = (
                <button
                    className="btn-ineligible-state"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: 16, fontWeight: 600, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', marginBottom: 20, cursor: 'not-allowed' }}
                >
                    Ineligible ({!cgpaPass ? 'CGPA' : 'Branch'})
                </button>
            );
            warning = (
                <div className="cgpa-warning" style={{ color: '#ef4444', fontSize: 13 }}>
                    <i className="bx bx-error" /> You do not meet the minimum eligibility criteria.
                </div>
            );
        }
    } else {
        actionButton = (
            <button
                className="btn-primary"
                onClick={() => onCheckEligibility(job.id)}
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: 16, fontWeight: 600, border: 'none', marginBottom: 20, boxShadow: '0 4px 12px rgba(57, 52, 160, 0.2)' }}
            >
                Check Eligibility
            </button>
        );
    }

    return (
        <>
            <div className="details-card">
                <div className="details-header-row">
                    <h2>{job.title}</h2>
                    <span className={`type-badge ${badgeClass}`} style={{ padding: '6px 14px', fontSize: 13 }}>
                        {badgeText}
                    </span>
                </div>
                <div className="details-company">{job.company}</div>

                <div className="details-grid-meta">
                    <div className="meta-block">
                        <label>Location</label>
                        <span>{job.location}</span>
                    </div>
                    <div className="meta-block">
                        <label>{compensationLabel}</label>
                        <span>{job.salary}</span>
                    </div>
                    <div className="meta-block">
                        <label>Openings</label>
                        <span>{job.openings}</span>
                    </div>
                    <div className="meta-block">
                        <label>Deadline</label>
                        <span>{job.deadline}</span>
                    </div>
                    <div className="meta-block" style={{ gridColumn: 'span 3' }}>
                        <label>Applications</label>
                        <span>{job.applications || 0}</span>
                    </div>
                </div>

                {actionButton}
                {!job.appliedStatus && (
                    <button className="btn-save-drive" onClick={onToggleSave}>
                        <i className={`bx ${isSaved ? 'bxs-bookmark' : 'bx-bookmark'}`} /> {isSaved ? 'Saved' : 'Save for later'}
                    </button>
                )}
                {warning}
            </div>

            <div className="details-card">
                <h3 className="section-title">Eligibility Criteria</h3>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div
                        className="eligibility-row"
                        style={{ padding: 16, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <span className="eligibility-label" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                            Minimum CGPA
                        </span>
                        <span className="badge-check" style={{ background: '#dcfce7', color: '#16a34a', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                            ✓ {job.cgpa}
                        </span>
                    </div>
                    <div className="eligibility-row" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="eligibility-label" style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                            Eligible Branches
                        </span>
                        <div style={{ textAlign: 'right' }}>
                            {job.branches &&
                                job.branches.map((b) => (
                                    <span className="tag-small" style={{ background: '#f1f5f9', color: '#64748b' }} key={b}>
                                        {b}
                                    </span>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="details-card">
                <h3 className="section-title">Job Description</h3>
                <p className="description-text">{job.description}</p>
            </div>

            <div className="details-card">
                <h3 className="section-title">Required Skills</h3>
                <div className="details-skills">
                    {job.tags &&
                        job.tags.map((t) => (
                            <span className="tag" key={t}>
                                {t}
                            </span>
                        ))}
                </div>
            </div>
        </>
    );
}
