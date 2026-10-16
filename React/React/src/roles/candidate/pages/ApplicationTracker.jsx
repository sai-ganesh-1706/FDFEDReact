import { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import '../styles/features.css';

const STAGES_DEF = ['Applied', 'Shortlisted', 'Assessment', 'Interview', 'Offered'];
const FILTERS = ['All', 'Active', 'Offer', 'Rejected', 'Withdrawn'];

function statusChipFor(status) {
    if (status === 'Offer') return { cls: 'status-offer', label: 'Offer' };
    if (status === 'Rejected') return { cls: 'status-rejected', label: 'Rejected' };
    if (status === 'Withdrawn') return { cls: 'status-pending', label: 'Withdrawn' };
    return { cls: 'status-active', label: status };
}

export default function ApplicationTracker() {
    const { store } = useStore();
    const [filter, setFilter] = useState('All');

    const stats = useMemo(() => {
        const apps = store.myApplications;
        const total = apps.length;
        const active = apps.filter((a) => ['Applied', 'Shortlisted', 'Interview'].includes(a.status)).length;
        const offers = apps.filter((a) => a.status === 'Offer').length;
        const rejected = apps.filter((a) => a.status === 'Rejected').length;
        return { total, active, offers, rejected };
    }, [store.myApplications]);

    const appsToRender = useMemo(() => {
        const apps = store.myApplications;
        if (filter === 'All') return apps;
        if (filter === 'Active') return apps.filter((a) => ['Applied', 'Shortlisted', 'Interview'].includes(a.status));
        return apps.filter((a) => a.status === filter);
    }, [store.myApplications, filter]);

    return (
        <>
            <div className="dashboard-scroll-area">
                <p className="page-subtitle">Visual pipeline view of every application you&apos;ve submitted.</p>

                <div className="tracker-stats-row">
                    <div className="tracker-stat-card">
                        <div className="tracker-stat-label">Total Applied</div>
                        <div className="tracker-stat-val">{stats.total}</div>
                    </div>
                    <div className="tracker-stat-card">
                        <div className="tracker-stat-label">Active Processes</div>
                        <div className="tracker-stat-val blue">{stats.active}</div>
                    </div>
                    <div className="tracker-stat-card">
                        <div className="tracker-stat-label">Offers Received</div>
                        <div className="tracker-stat-val green">{stats.offers}</div>
                    </div>
                    <div className="tracker-stat-card">
                        <div className="tracker-stat-label">Rejected</div>
                        <div className="tracker-stat-val red">{stats.rejected}</div>
                    </div>
                </div>

                <div className="filter-pills-row" style={{ marginBottom: 24 }}>
                    {FILTERS.map((f) => (
                        <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                            {f}
                        </button>
                    ))}
                </div>

                {appsToRender.length === 0 ? (
                    <div className="empty-state">
                        <i className="bx bx-list-check" />
                        <h3>No applications in this category</h3>
                        <p>Try a different filter, or head to Opportunities to apply for a drive.</p>
                    </div>
                ) : (
                    <div className="app-list">
                        {appsToRender.map((app) => {
                            const failed = app.status === 'Rejected' || app.status === 'Withdrawn';
                            const chip = statusChipFor(app.status);
                            return (
                                <div className="app-track-card" key={app.id}>
                                    <div className="app-head">
                                        <div>
                                            <div className="app-track-title">{app.title}</div>
                                            <div className="app-track-company">{app.company}</div>
                                        </div>
                                        <span className={`status-chip ${chip.cls}`}>{chip.label}</span>
                                    </div>
                                    <div className="pipeline">
                                        {STAGES_DEF.map((stageName, index) => {
                                            const timelineEntry = app.timeline?.[index];
                                            let stageCls = '';
                                            if (index < app.currentStageIndex) stageCls = 'passed';
                                            else if (index === app.currentStageIndex) stageCls = failed ? 'failed' : 'current';

                                            return (
                                                <div className={`stage ${stageCls}`} key={stageName}>
                                                    <div className="stage-dot">
                                                        {stageCls === 'passed' ? <i className="bx bx-check" /> : index + 1}
                                                    </div>
                                                    <span className="stage-label">{stageName}</span>
                                                    {timelineEntry && timelineEntry.date !== '-' && (
                                                        <span className="stage-date">{timelineEntry.date}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}

