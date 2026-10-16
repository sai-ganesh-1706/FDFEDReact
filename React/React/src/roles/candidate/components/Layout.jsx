import '../styles/ui.css';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import SignOutModal from './SignOutModal.jsx';
import { useStore } from '../context/StoreContext.jsx';
import { useUI } from '../context/UIContext.jsx';

const NAV_ITEMS = [
    { to: '/candidate', label: 'Dashboard', icon: 'bx-grid-alt', end: true, title: 'Dashboard' },
    { to: '/candidate/opportunities', label: 'Browse Opportunities', icon: 'bx-briefcase-alt-2', title: 'Opportunities' },
    { to: '/candidate/saved-drives', label: 'Saved Drives', icon: 'bx-bookmark', title: 'Saved Drives' },
    { to: '/candidate/applications', label: 'My Applications', icon: 'bx-file-blank', title: 'My Applications' },
    { to: '/candidate/application-tracking', label: 'Application Tracker', icon: 'bx-list-check', title: 'Application Tracker' },
    { to: '/candidate/referrals', label: 'Referrals', icon: 'bx-user-plus', title: 'Referrals' },
];
const PROFILE_TITLE = { to: '/candidate/profile', title: 'Profile' };

function computeInitials(name, avatar) {
    if (avatar) return avatar;
    if (!name) return '';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
}

// Memoized so it only re-renders when name/role/avatar actually change,
// not on every unrelated store update elsewhere in the app.
const SidebarUserCard = memo(function SidebarUserCard({ name, role, avatar, avatarImage, onClick }) {
    const initials = computeInitials(name, avatar);
    const avatarStyle = avatarImage
        ? { backgroundImage: `url(${avatarImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <div className="sidebar-user-card" onClick={onClick} style={{ cursor: 'pointer' }} title="View Profile">
            <div id="sidebar-avatar" className="user-avatar" style={avatarStyle}>
                {!avatarImage ? initials : ''}
            </div>
            <div className="user-info">
                <h4 id="sidebar-name">{name || 'Name'}</h4>
                <p id="sidebar-role">{role || 'Role'}</p>
            </div>
        </div>
    );
});

// Memoized so it only re-renders when name/avatar actually change.
const TopAvatar = memo(function TopAvatar({ name, avatar, avatarImage, onClick }) {
    const initials = computeInitials(name, avatar);
    const style = avatarImage
        ? { backgroundImage: `url(${avatarImage})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }
        : { cursor: 'pointer' };

    return (
        <div className="top-avatar" onClick={onClick} style={style} title="View Profile">
            {!avatarImage ? initials : ''}
        </div>
    );
});

export default function Layout() {
    const { store } = useStore();
    const { notifOpen, toggleNotif, closeNotif, markAllRead, readAndNavigate, unreadCount } = useUI();
    const navigate = useNavigate();
    const location = useLocation();
    const user = store.currentUser;
    const [isSignOutOpen, setIsSignOutOpen] = useState(false);

    const activeItem = [...NAV_ITEMS, PROFILE_TITLE].find((item) =>
        item.to === '/candidate' ? location.pathname === '/candidate' : location.pathname.startsWith(item.to)
    );
    const title = activeItem ? activeItem.title : '';

    // navigate()'s identity can change across renders in some router versions;
    // route it through a ref so the memoized callback we hand to the child
    // components never changes identity (keeps SidebarUserCard/TopAvatar memo-stable).
    const navigateRef = useRef(navigate);
    useLayoutEffect(() => {
        navigateRef.current = navigate;
    }, [navigate]);
    const goToProfile = useCallback(() => navigateRef.current('/candidate/profile'), []);

    return (
        <div className="app-layout">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">
                        <i className="bx bxs-graduation" />
                    </div>
                    <div className="brand-text">
                        <h2>CareerNest</h2>
                        <p>College Placement Cell</p>
                    </div>
                </div>

                <SidebarUserCard name={user.name} role={user.role} avatar={user.avatar} avatarImage={user.avatarImage} onClick={goToProfile} />

                <nav className="sidebar-nav">
                    <ul>
                        {NAV_ITEMS.map((item) => {
                            const isActive = item.end
                                ? location.pathname === item.to
                                : location.pathname.startsWith(item.to);
                            return (
                                <li key={item.to} className={isActive ? 'nav-item active' : 'nav-item'}>
                                    <Link to={item.to}>
                                        <i className={`bx ${item.icon}`} />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button type="button" className="sign-out" onClick={() => setIsSignOutOpen(true)}>
                        <i className="bx bx-log-out" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content page-enter">
                <header className="top-header">
                    <h1 className="page-title">{title}</h1>
                    <div className="header-actions">
                        <div className="notification-container" style={{ position: 'relative' }}>
                            <button
                                type="button"
                                className="notification-btn"
                                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                                aria-expanded={notifOpen}
                                onClick={toggleNotif}
                            >
                                <Bell size={21} strokeWidth={2} aria-hidden="true" />
                                <span
                                    className="badge red-badge"
                                    style={{ display: unreadCount > 0 ? 'flex' : 'none' }}
                                >
                                    {unreadCount}
                                </span>
                            </button>
                            {notifOpen && (
                                <>
                                    <div
                                        onClick={closeNotif}
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                    />
                                    <div className="notification-dropdown show" style={{ zIndex: 41 }}>
                                        <div className="notif-header">
                                            <h5>Notifications</h5>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    markAllRead();
                                                }}
                                            >
                                                Mark all read
                                            </a>
                                        </div>
                                        <div className="notif-body">
                                            {store.notificationsData.length === 0 && <div className="notif-item"><p>You're all caught up.</p></div>}
                                            {store.notificationsData.map((notif, idx) => {
                                                const t = notif.title.toLowerCase();
                                                let targetRoute = '#';
                                                if (t.includes('referral')) targetRoute = 'referrals';
                                                else if (notif.type === 'general' && t.includes('opportunity')) targetRoute = 'opportunities';
                                                else if (['status', 'offer', 'assessment'].includes(notif.type)) targetRoute = 'applications';
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={notif.isRead ? 'notif-item' : 'notif-item unread'}
                                                        onClick={() => readAndNavigate(idx, targetRoute)}
                                                    >
                                                        <h6>{notif.title}</h6>
                                                        <p>{notif.message}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <TopAvatar name={user.name} avatar={user.avatar} avatarImage={user.avatarImage} onClick={goToProfile} />
                    </div>
                </header>

                <Outlet />
            </main>
            <SignOutModal isOpen={isSignOutOpen} onClose={() => setIsSignOutOpen(false)} />
        </div>
    );
}
