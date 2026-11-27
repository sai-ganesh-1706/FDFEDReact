// Data Flow (roles/college-admin/components/Sidebar.jsx):
// Backend API -> Redux Thunks/Slices (collegeAdminSlice) -> useSelector(store state) -> UI render
// User Actions -> dispatch(slice actions) -> Slice reducers/thunks -> Redux state update
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard, ShieldCheck, GraduationCap, UsersRound,
  Megaphone, BarChart2, Building2, LogOut, Mail
} from 'lucide-react';
import {
  
  COLLEGE_ADMIN_TABS,
  setCollegeAdminTab,
} from '../store/collegeAdminSlice.js';

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',           icon: LayoutDashboard },
  { id: 'officers',       label: 'Placement Officers',  icon: ShieldCheck },
  { id: 'alumni', label: 'Alumni', icon: GraduationCap },
  { id: 'activity', label: 'Officer Activity', icon: BarChart2 },
  { id: 'students',       label: 'Students',            icon: GraduationCap },
  { id: 'recruiters',     label: 'Recruiters',          icon: UsersRound },
  { id: 'announcements',  label: 'Announcements',       icon: Megaphone },
  { id: 'messages',       label: 'Messages',            icon: Mail },
  { id: 'reports',        label: 'Reports',             icon: BarChart2 },
];

export default function CollegeAdminSidebar({ activeTab, collegeName, onSignOut, unreadMessages = 0 }) {
  const dispatch = useDispatch();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2><Building2 size={18} color="#7dd3fc" /> CareerNest</h2>
        <p title={collegeName}>{collegeName || 'College Admin'}</p>
      </div>

      <div className="sidebar-role-badge">
        <span>College Administrator</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => {
              const nextTab = COLLEGE_ADMIN_TABS.includes(id) ? id : 'dashboard';
              dispatch(setCollegeAdminTab(nextTab));
            }}
          >
            <Icon size={17} />
            {label}
            {id === 'messages' && unreadMessages > 0 && (
              <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '1px 7px' }}>{unreadMessages}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
