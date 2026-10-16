import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { Avatar, ReferralPill, normReferralStatus } from '../components/shared.jsx';
import '../styles/applications.css';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'declined', label: 'Declined' },
];

export default function Referrals() {
    const { store } = useStore();
    const navigate = useNavigate();
    const [tab, setTab] = useState('all');

    const requests = useMemo(
        () => [...store.referralRequests].sort((a, b) => b.id - a.id),
        [store.referralRequests]
    );
    const countOf = (key) => (key === 'all' ? requests.length : requests.filter((r) => normReferralStatus(r.status) === key).length);
    const visible = requests.filter((r) => tab === 'all' || normReferralStatus(r.status) === tab);

    function openApplication(req) {
        const app = store.myApplications.find((a) => a.opportunityId === req.opportunityId);
        navigate(app ? `/candidate/applications?appId=${app.id}` : '/candidate/applications');
    }

    return (
        <div className="dashboard-scroll-area">
            <p className="applications-header-text">
                Referral requests you sent to alumni. To ask for a new one, open an application and choose <strong>Get referral</strong>.
            </p>

            <section className="stats-grid-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card-clean"><h3>{countOf('approved')}</h3><p>Approved</p></div>
                <div className="stat-card-clean"><h3>{countOf('pending')}</h3><p>Pending</p></div>
                <div className="stat-card-clean"><h3>{countOf('declined')}</h3><p>Declined</p></div>
            </section>

            <div className="filter-pills-row" style={{ marginBottom: 20 }}>
                {TABS.map((t) => (
                    <button key={t.key} className={`filter-pill ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                        {t.label} ({countOf(t.key)})
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <div className="empty-state">
                    <i className="bx bx-user-voice" />
                    <h3>{requests.length === 0 ? 'No referral requests yet' : 'Nothing in this view'}</h3>
                    <p>{requests.length === 0
                        ? 'After you apply to a company, you can ask its alumni from your college for a referral.'
                        : 'Try another filter.'}</p>
                    {requests.length === 0 && (
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/candidate/applications'); }}>Go to My Applications →</a>
                    )}
                </div>
            ) : (
                <div className="applications-rows">
                    {visible.map((r) => (
                        <div className="app-row-card expanded" key={r.id}>
                            <div className="app-row-header" style={{ cursor: 'default' }}>
                                <div className="app-row-left">
                                    <Avatar name={r.alumniName} color={r.alumniAvatarColor || '#3934A0'} initials={r.alumniInitials} />
                                    <div className="app-info">
                                        <h4>{r.alumniName}</h4>
                                        <p>{r.alumniCompany}{r.alumniBatch ? ` · ${r.alumniBatch}` : ''}</p>
                                    </div>
                                </div>
                                <div className="app-row-right"><ReferralPill status={r.status} /></div>
                            </div>
                            <div className="app-row-body" style={{ paddingTop: 4 }}>
                                <div className="cx-row">
                                    <span className="cx-muted">For</span>
                                    <strong>{r.appliedRole} · {r.appliedCompany}</strong>
                                </div>
                                <div className="cx-row">
                                    <span className="cx-muted">Requested on</span>
                                    <span>{r.requestedDate}</span>
                                </div>
                                {r.userMessage && (
                                    <div className="cx-panel">
                                        <div className="cx-panel__title">Your message</div>
                                        <p className="cx-muted" style={{ color: 'var(--text-primary)' }}>{r.userMessage}</p>
                                    </div>
                                )}
                                {r.alumniResponse && (
                                    <div className={`cx-panel cx-panel--${normReferralStatus(r.status) === 'approved' ? 'ok' : 'bad'}`}>
                                        <div className="cx-panel__title">Reply from {r.alumniName}</div>
                                        <p className="cx-muted" style={{ color: 'var(--text-primary)' }}>{r.alumniResponse}</p>
                                    </div>
                                )}
                                <div style={{ marginTop: 14, textAlign: 'right' }}>
                                    <button className="cx-btn cx-btn--outline cx-btn--sm" onClick={() => openApplication(r)}>View application →</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
