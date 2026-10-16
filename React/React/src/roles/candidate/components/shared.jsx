// Small presentational pieces shared by the candidate pages so they all look the same.

const STATUS_TONE = {
    Applied: 'info', Shortlisted: 'warn', Assessment: 'warn', Interview: 'info',
    Offered: 'ok', Offer: 'ok', Rejected: 'bad', Withdrawn: 'mute',
};

export function StatusPill({ status }) {
    return <span className={`cx-pill cx-pill--${STATUS_TONE[status] || 'mute'}`}>{status === 'Offer' ? 'Offered' : status}</span>;
}

const REFERRAL_META = {
    pending:  { tone: 'warn', icon: 'bx-time-five', label: 'Referral requested' },
    approved: { tone: 'ok',   icon: 'bx-check-circle', label: 'Referred' },
    declined: { tone: 'bad',  icon: 'bx-x-circle', label: 'Referral declined' },
};

export const normReferralStatus = (s) => {
    const v = String(s || '').toLowerCase();
    return v === 'rejected' ? 'declined' : v;
};

export function ReferralPill({ status }) {
    const meta = REFERRAL_META[normReferralStatus(status)];
    if (!meta) return null;
    return <span className={`cx-pill cx-pill--${meta.tone}`}><i className={`bx ${meta.icon}`} />{meta.label}</span>;
}

export function Avatar({ name = '', color = '#3934A0', initials }) {
    const text = initials || name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return <span className="cx-avatar" style={{ background: color }}>{text}</span>;
}

export function Stars({ value = 0 }) {
    return (
        <span className="cx-stars">
            {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= value ? '' : 'off'}>★</span>)}
        </span>
    );
}

export function Modal({ title, subtitle, onClose, children, footer }) {
    return (
        <div className="cx-overlay" onClick={onClose}>
            <div className="cx-modal" onClick={(e) => e.stopPropagation()}>
                <div className="cx-modal__head">
                    <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
                    <button className="cx-modal__close" onClick={onClose} aria-label="Close">×</button>
                </div>
                <div className="cx-modal__body">{children}</div>
                {footer && <div className="cx-modal__foot">{footer}</div>}
            </div>
        </div>
    );
}

export function formatDay(dateStr) {
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return { day: '--', month: '' };
    return { day: d.getDate(), month: d.toLocaleDateString('en-IN', { month: 'short' }) };
}

export function ScheduleItem({ item }) {
    const { day, month } = formatDay(item.date);
    const isInterview = /interview|discussion/i.test(item.type);
    return (
        <div className="cx-event">
            <div className="cx-event__date"><small>{month}</small>{day}</div>
            <div className="cx-event__body">
                <h6>{item.title}</h6>
                <p>{item.type} · {item.time} · {item.duration} · {item.platform}</p>
            </div>
            <span className={`cx-pill cx-pill--${isInterview ? 'info' : 'warn'}`}>{isInterview ? 'Interview' : 'Assessment'}</span>
            {item.link && (
                <a className="cx-btn cx-btn--primary cx-btn--sm" href={item.link} target="_blank" rel="noreferrer">
                    <i className="bx bx-link-external" /> {isInterview ? 'Join interview' : 'Open test'}
                </a>
            )}
        </div>
    );
}
