import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { errorMessage } from '../../../services/api.js';
import { Avatar, Modal, ReferralPill, ScheduleItem, StatusPill, normReferralStatus } from '../components/shared.jsx';
import '../styles/applications.css';
import { BriefcaseBusiness } from 'lucide-react';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Offered'];
const FILTERS = ['All', 'Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected', 'Withdrawn'];
const TERMINAL = ['Rejected', 'Withdrawn', 'Offered', 'Offer'];

const ROUND_LABELS = {
    resume:    'Resume screening',
    technical: 'Technical interview',
    hr:        'Interview',
};

// ── Ask an alumnus of the company for a referral ────────────────────────────────
function GetReferralModal({ app, requestedAlumniIds, onClose, onSent }) {
    const { fetchAlumniForCompany, requestReferral } = useStore();
    const [alumni, setAlumni] = useState(null);
    const [selected, setSelected] = useState(null);
    const [message, setMessage] = useState(
        `Hi, I recently applied for ${app.title} at ${app.company}. I would really appreciate it if you could refer me. Thank you!`
    );
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;
        fetchAlumniForCompany(app.company)
            .then((list) => { if (alive) setAlumni(list.filter((a) => !requestedAlumniIds.has(a.id))); })
            .catch((e) => { if (alive) { setAlumni([]); setError(errorMessage(e, 'Could not load alumni.')); } });
        return () => { alive = false; };
    }, [app.company]);   // eslint-disable-line react-hooks/exhaustive-deps

    async function send() {
        if (!selected) return;
        setSending(true);
        setError('');
        try {
            await requestReferral({ applicationId: app.id, opportunityId: app.opportunityId, alumniId: selected.id, message: message.trim() });
            onSent(selected);
        } catch (e) {
            setError(errorMessage(e, 'Could not send the request.'));
            setSending(false);
        }
    }

    return (
        <Modal
            title="Ask for a referral"
            subtitle={`${app.title} - ${app.company}`}
            onClose={onClose}
            footer={(
                <>
                    <button className="cx-btn cx-btn--outline" onClick={onClose}>Cancel</button>
                    <button className="cx-btn cx-btn--primary" disabled={!selected || !message.trim() || sending} onClick={send}>
                        <i className="bx bx-send" /> {sending ? 'Sending…' : 'Send request'}
                    </button>
                </>
            )}
        >
            {error && <div className="inline-alert inline-alert--error">{error}</div>}
            {alumni === null && <p className="cx-muted">Finding alumni at {app.company}…</p>}
            {alumni && alumni.length === 0 && !error && (
                <p className="cx-muted">
                    No more alumni from your college work at {app.company} right now. You will see them here as soon as one joins the platform.
                </p>
            )}
            {alumni && alumni.length > 0 && (
                <>
                    <p className="cx-muted" style={{ marginBottom: 12 }}>Choose an alumnus who works at {app.company}:</p>
                    {alumni.map((a) => (
                        <button key={a.id} className={`cx-choice ${selected?.id === a.id ? 'selected' : ''}`} onClick={() => setSelected(a)}>
                            <Avatar name={a.name} color={a.avatarColor || '#3934A0'} />
                            <div>
                                <strong>{a.name}</strong>
                                <span>{a.headline || 'Alumnus'}{a.batch ? ` - Batch of ${a.batch}` : ''}</span>
                            </div>
                        </button>
                    ))}
                    <label className="cx-muted" style={{ display: 'block', margin: '14px 0 6px', fontWeight: 600 }}>Your message</label>
                    <textarea className="cx-field" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
                </>
            )}
        </Modal>
    );
}

// ── Expanded application ───────────────────────────────────────────────────────
function AppDetails({ app, referrals, schedule, onGetReferral, onCancel }) {
    const timeline = (app.timeline?.length ? app.timeline : [{ stage: 'Applied', date: app.appliedDate, desc: 'Application submitted', status: 'completed' }]).slice().reverse();
    const stageIdx = app.currentStageIndex ?? Math.max(0, STAGES.indexOf(app.status));
    const failed = ['Rejected', 'Withdrawn'].includes(app.status);
    const canCancel = ['Applied', 'Shortlisted', 'Interview'].includes(app.status);

    const rounds = Object.entries(app.rounds || {});
    const upcoming = schedule.filter((s) => s.applicationId === app.id || (s.opportunityId === app.opportunityId));

    const mine = referrals.filter((r) => r.opportunityId === app.opportunityId);
    const approved = mine.find((r) => normReferralStatus(r.status) === 'approved');
    const pending = mine.find((r) => normReferralStatus(r.status) === 'pending');
    const declined = mine.filter((r) => normReferralStatus(r.status) === 'declined');
    const canAsk = !TERMINAL.includes(app.status) && !approved && !pending;

    return (
        <div className="app-row-body">
            <div className="tracker-wrapper">
                {STAGES.map((name, i) => {
                    const done = i < stageIdx || (i === stageIdx && app.status === 'Offered');
                    const active = i === stageIdx && !done;
                    const cls = done ? 'completed' : active ? (failed ? 'future' : 'active') : 'future';
                    return (
                        <div key={name} style={{ display: 'contents' }}>
                            <div className="tracker-step">
                                <div className={`tracker-circle ${cls}`}>{done ? <i className="bx bx-check" /> : i + 1}</div>
                                <span className="tracker-label">{name}</span>
                            </div>
                            {i < STAGES.length - 1 && <div className={`tracker-line ${done ? 'completed' : 'future'}`} />}
                        </div>
                    );
                })}
            </div>
            {failed && (
                <div className={`cx-panel cx-panel--${app.status === 'Rejected' ? 'bad' : ''}`}>
                    <span className="cx-muted">
                        {app.status === 'Rejected'
                            ? 'The recruiter did not move this application forward. Check the feedback below for pointers.'
                            : 'You withdrew this application.'}
                    </span>
                </div>
            )}

            {upcoming.length > 0 && (
                <div className="cx-panel cx-panel--info">
                    <div className="cx-panel__title"><i className="bx bx-calendar-event" /> Scheduled for you</div>
                    {upcoming.map((s) => <ScheduleItem key={s.id} item={s} />)}
                </div>
            )}

            {(approved || pending || declined.length > 0) && (
                <div className={`cx-panel cx-panel--${approved ? 'ok' : pending ? 'warn' : 'bad'}`}>
                    <div className="cx-panel__title"><i className="bx bx-user-voice" /> Alumni referral</div>
                    {[approved, pending, ...declined].filter(Boolean).map((r) => (
                        <div key={r.id} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <Avatar name={r.alumniName} color={r.alumniAvatarColor || '#3934A0'} initials={r.alumniInitials} />
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <strong style={{ fontSize: 14 }}>{r.alumniName}</strong>
                                    <div className="cx-muted">{r.alumniCompany}{r.alumniBatch ? ` - ${r.alumniBatch}` : ''}</div>
                                </div>
                                <ReferralPill status={r.status} />
                            </div>
                            {r.alumniResponse
                                ? <div className="cx-quote">“{r.alumniResponse}”</div>
                                : normReferralStatus(r.status) === 'pending' && <div className="cx-muted" style={{ marginTop: 6 }}>Waiting for {r.alumniName} to respond.</div>}
                        </div>
                    ))}
                </div>
            )}

            {rounds.length > 0 && (
                <div className="cx-panel">
                    <div className="cx-panel__title">Round results</div>
                    {rounds.map(([key, result]) => (
                        <div className="cx-row" key={key}>
                            <span>{ROUND_LABELS[key] || key}</span>
                            <span className={`cx-pill cx-pill--${result === 'Pass' ? 'ok' : result === 'Fail' ? 'bad' : 'mute'}`}>{result}</span>
                        </div>
                    ))}
                </div>
            )}



            <div className="activity-log-container">
                <h5 className="activity-header">ACTIVITY LOG</h5>
                {timeline.map((t, i) => (
                    <div className="activity-item" key={`${t.stage}-${t.date}-${i}`}>
                        <div className="activity-timeline">
                            <div className={`activity-dot ${i === 0 ? 'active' : 'completed'}`} />
                            <div className={`activity-line ${i === timeline.length - 1 ? 'hidden' : ''}`} />
                        </div>
                        <div className="activity-content">
                            <div className="cx-panel" style={{ marginTop: 0, marginBottom: 8, padding: 14 }}>
                                <div className="cx-row" style={{ border: 'none', padding: 0 }}>
                                    <strong>{t.stage}</strong><span className="cx-muted">{t.date}</span>
                                </div>
                                <p className="cx-muted">{t.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                {canAsk && (
                    <button className="cx-btn cx-btn--outline" onClick={onGetReferral}>
                        <i className="bx bx-user-plus" /> {declined.length ? 'Ask another alumnus' : 'Get referral'}
                    </button>
                )}
                {canCancel && <button className="cx-btn cx-btn--danger" onClick={() => onCancel(app.id)}>Withdraw application</button>}
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Applications() {
    const { store, withdrawApplication } = useStore();
    const [searchParams] = useSearchParams();
    const focusAppId = parseInt(searchParams.get('appId'), 10);

    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(Number.isNaN(focusAppId) ? null : focusAppId);
    const [referralApp, setReferralApp] = useState(null);
    const [notice, setNotice] = useState({ type: '', text: '' });
    const focusRef = useRef(null);

    useEffect(() => { focusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, []);

    const apps = store.myApplications;
    const counts = useMemo(() => {
        const c = { All: apps.length };
        FILTERS.slice(1).forEach((f) => { c[f] = apps.filter((a) => a.status === f).length; });
        return c;
    }, [apps]);

    const visible = useMemo(() => {
        const q = search.toLowerCase().trim();
        return apps
            .filter((a) => filter === 'All' || a.status === filter)
            .filter((a) => !q || a.title.toLowerCase().includes(q) || a.company.toLowerCase().includes(q))
            .sort((a, b) => b.id - a.id);
    }, [apps, filter, search]);

    async function cancelApplication(id) {
        if (!window.confirm('Withdraw this application? This cannot be undone.')) return;
        try { await withdrawApplication(id); }
        catch (e) { setNotice({ type: 'error', text: errorMessage(e, 'Could not withdraw this application.') }); }
    }

    const requestedIds = (app) => new Set(
        store.referralRequests.filter((r) => r.opportunityId === app.opportunityId).map((r) => r.alumniId)
    );

    return (
        <>
            <div className="dashboard-scroll-area">
                <p className="applications-header-text">Track every application, referral and interview in one place</p>

                <section className="stats-grid-4">
                    <div className="stat-card-clean"><h3>{store.applicationStats.shortlisted}</h3><p>Shortlisted</p></div>
                    <div className="stat-card-clean"><h3>{store.applicationStats.interviews}</h3><p>Interviews</p></div>
                    <div className="stat-card-clean"><h3>{store.applicationStats.offers}</h3><p>Offers</p></div>
                    <div className="stat-card-clean"><h3>{store.applicationStats.rejected}</h3><p>Rejected</p></div>
                </section>

                {notice.text && <div className={`inline-alert inline-alert--${notice.type === 'error' ? 'error' : 'ok'}`}>{notice.text}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    <div className="search-container" style={{ maxWidth: 400 }}>
                        <i className="bx bx-search" />
                        <input type="text" placeholder="Search by company or role..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="filter-pills-row">
                        {FILTERS.filter((f) => f === 'All' || counts[f] > 0 || filter === f).map((f) => (
                            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                                {f} ({counts[f] ?? 0})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="applications-rows">
                    {visible.length === 0 ? (
                        <div className="empty-state">
                            <i className="bx bx-briefcase-alt-2" />
                            <h3>No applications here yet</h3>
                            <p>Apply to a published opportunity and you can track it here.</p>
                        </div>
                    ) : visible.map((app) => {
                        const open = expandedId === app.id;
                        const refs = store.referralRequests.filter((r) => r.opportunityId === app.opportunityId);
                        const best = refs.find((r) => normReferralStatus(r.status) === 'approved')
                            || refs.find((r) => normReferralStatus(r.status) === 'pending') || refs[0];
                        const canAsk = !TERMINAL.includes(app.status) && !refs.some((r) => ['approved', 'pending'].includes(normReferralStatus(r.status)));
                        return (
                            <div key={app.id} className={`app-row-card ${open ? 'expanded' : ''}`} ref={app.id === focusAppId ? focusRef : null}>
                                <div className="app-row-header" onClick={() => setExpandedId(open ? null : app.id)}>
                                    <div className="app-row-left">
                                        <div className="app-icon-box"><BriefcaseBusiness size={24} strokeWidth={1.7} color="#4338ca" /><i className="bx bx-building-house" /></div>
                                        <div className="app-info">
                                            <h4>{app.title}</h4>
                                            <p>{app.company} - Applied {app.appliedDate}</p>
                                        </div>
                                    </div>
                                    <div className="app-row-right" style={{ gap: 10 }}>
                                        {best && <ReferralPill status={best.status} />}
                                        {canAsk && (
                                            <button className="cx-btn cx-btn--outline cx-btn--sm" onClick={(e) => { e.stopPropagation(); setReferralApp(app); }}>
                                                <i className="bx bx-user-plus" /> Get referral
                                            </button>
                                        )}
                                        <StatusPill status={app.status} />
                                        <i className={`bx ${open ? 'bx-chevron-up' : 'bx-chevron-down'} app-chevron`} />
                                    </div>
                                </div>
                                {open && (
                                    <AppDetails
                                        app={app}
                                        referrals={store.referralRequests}
                                        schedule={store.schedule}
                                        onGetReferral={() => setReferralApp(app)}
                                        onCancel={cancelApplication}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {referralApp && (
                <GetReferralModal
                    app={referralApp}
                    requestedAlumniIds={requestedIds(referralApp)}
                    onClose={() => setReferralApp(null)}
                    onSent={(alum) => {
                        setReferralApp(null);
                        setNotice({ type: 'ok', text: `Referral request sent to ${alum.name}. You will see their reply here and in your notifications.` });
                    }}
                />
            )}
        </>
    );
}
