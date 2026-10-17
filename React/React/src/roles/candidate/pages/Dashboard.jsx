import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, CalendarCheck2, Clock3, FileText, GraduationCap, TrendingUp, UsersRound } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import '../styles/index.css';

export default function Dashboard() {
    const { store } = useStore();
    const navigate = useNavigate();
    const { currentUser, dashboardStats, recruiterJobs, myApplications, upcomingEvents, announcementsData } = store;

    const firstName = currentUser.name.split(' ')[0];

    const statusMeta = (status) => {
        if (status === 'Interview') return { statusClass: 'status-interview', Icon: UsersRound };
        if (status === 'Shortlisted') return { statusClass: 'status-shortlisted', Icon: TrendingUp };
        return { statusClass: 'status-applied', Icon: Clock3 };
    };

    const unappliedJobs = recruiterJobs
        .filter((j) => j.appliedStatus !== 'Applied' && j.appliedStatus !== 'Shortlisted' && j.appliedStatus !== 'Interview')
        .slice(0, 3);

    return (
        <>
            <div className="dashboard-scroll-area">
                <section className="welcome-banner">
                    <div className="banner-content">
                        <h2>Welcome back, {firstName}! 👋</h2>
                        <p>
                            {currentUser.department} · CGPA: {currentUser.cgpa} · {currentUser.batch}
                        </p>
                    </div>
                </section>

                <section className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon icon-blue">
                            <FileText size={23} aria-hidden="true" />
                        </div>
                        <div className="stat-value">{dashboardStats.applications}</div>
                        <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-green">
                            <BriefcaseBusiness size={23} aria-hidden="true" />
                        </div>
                        <div className="stat-value">{dashboardStats.availableJobs}</div>
                        <div className="stat-label">Available Jobs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-purple">
                            <GraduationCap size={23} aria-hidden="true" />
                        </div>
                        <div className="stat-value">{dashboardStats.internships}</div>
                        <div className="stat-label">Internships</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon icon-pink">
                            <CalendarCheck2 size={23} aria-hidden="true" />
                        </div>
                        <div className="stat-value">{dashboardStats.interviews}</div>
                        <div className="stat-label">Interviews</div>
                    </div>
                </section>

                <section className="two-columns">
                    <div className="card applications-card">
                        <div className="card-header">
                            <h3>My Applications</h3>
                            <a
                                href="#"
                                className="view-all"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate('/candidate/applications');
                                }}
                            >
                                View all &rarr;
                            </a>
                        </div>
                        <div className="list-group">
                            {myApplications.slice(0, 6).map((app) => {
                                const { statusClass, Icon } = statusMeta(app.status);
                                return (
                                    <div
                                        key={app.id}
                                        className="list-item"
                                        style={{ cursor: 'pointer', transition: '0.2s' }}
                                        onClick={() => navigate(`/candidate/applications?appId=${app.id}`)}
                                        onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div className="item-details">
                                            <h4>{app.title}</h4>
                                            <p>
                                                {app.company} · {app.type}
                                            </p>
                                        </div>
                                        <div className={`item-status ${statusClass}`}>
                                            <Icon size={15} aria-hidden="true" /> {app.status}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="card notifications-card">
                            <div className="card-header">
                                <h3>Announcements</h3>
                            </div>
                            <div className="list-group">
                                {announcementsData.length === 0 && <div className="cx-muted" style={{ padding: 16 }}>No announcements from your placement cell yet.</div>}
                                {announcementsData.map((ann) => {
                                        let badgeColor = '#3b82f6';
                                        if (ann.priority === 'high') badgeColor = '#ef4444';
                                        if (ann.priority === 'medium') badgeColor = '#f59e0b';
                                        return (
                                            <div className="list-item" style={{ alignItems: 'flex-start' }} key={ann.id}>
                                                <div className="item-details" style={{ flex: 1 }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        <h4 style={{ margin: 0, fontSize: 14 }}>{ann.title}</h4>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                padding: '2px 8px',
                                                                borderRadius: 10,
                                                                background: `${badgeColor}20`,
                                                                color: badgeColor,
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            {ann.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                                                        {ann.message}
                                                    </p>
                                                    <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, display: 'inline-block' }}>
                                                        {ann.date}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="card events-card" style={{ height: '100%' }}>
                            <div className="card-header">
                                <h3>Upcoming Assessments &amp; Interviews</h3>
                            </div>
                            <div className="list-group">
                                {upcomingEvents.length === 0 && <div className="cx-muted" style={{ padding: 16 }}>Nothing scheduled yet. When a recruiter schedules a test or interview it appears here with the joining link.</div>}
                                {upcomingEvents.map((event) => {
                                    const isInterview = event.type === 'Interview';
                                    return (
                                        <div
                                            key={event.id}
                                            className="list-item"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                if (event.appId) {
                                                    navigate(`/candidate/applications?appId=${event.appId}`);
                                                } else {
                                                    navigate('/candidate/applications');
                                                }
                                            }}
                                        >
                                            <div className="item-details">
                                                <h4>{event.title}</h4>
                                                <p>
                                                    {event.company} · {event.role} · {event.time}
                                                </p>
                                                {event.link && <a className="schedule-link" href={event.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Open link ↗</a>}
                                            </div>
                                            <div className={`item-date ${isInterview ? 'status-interview' : 'status-applied'}`}>
                                                {isInterview && <CalendarCheck2 size={15} aria-hidden="true" />} {event.date}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="recommended-section">
                    <div className="section-header">
                        <h3>Recommended Opportunities</h3>
                        <a
                            href="#"
                            className="view-all"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/candidate/opportunities');
                            }}
                        >
                            Browse all &rarr;
                        </a>
                    </div>

                    <div className="jobs-grid">
                        {unappliedJobs.length === 0 && (
                            <div style={{ padding: 20, color: '#94a3b8', width: '100%', textAlign: 'center' }}>
                                You have applied to all recommended opportunities! Browse to find more.
                            </div>
                        )}
                        {unappliedJobs.map((job) => {
                            const badgeClass = job.type.includes('Full-Time') || job.type.includes('Full-time') ? 'type-fulltime' : 'type-internship';
                            const tags = job.tags ? job.tags.slice(0, 3) : [];
                            return (
                                <div className="job-card" key={job.id}>
                                    <div className="job-header">
                                        <div className="job-title-wrapper">
                                            <h4>{job.title}</h4>
                                            <span className={`badge ${badgeClass}`}>{job.type}</span>
                                        </div>
                                        <p className="company">{job.company}</p>
                                        <p className="location">{job.location}</p>
                                        <p className="package">{job.salary}</p>
                                    </div>
                                    <div className="job-tags">
                                        {tags.map((tag) => (
                                            <span className="tag" key={tag}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button className="btn-primary" onClick={() => navigate(`/candidate/opportunities?jobId=${job.id}`)}>
                                        View details
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>
        </>
    );
}
