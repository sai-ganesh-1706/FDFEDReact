import React from 'react';
import {
  LayoutDashboard, Building2, UserCog, Activity, Crown, LogOut, MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'colleges',       label: 'Colleges',          icon: Building2 },
  { id: 'college-admins', label: 'College Admins',    icon: UserCog },
  { id: 'messages',       label: 'Messages',          icon: MessageSquare },
  { id: 'activity',       label: 'Activity Log',      icon: Activity },
];

export default function SuperAdminSidebar({ activeTab, setActiveTab, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2><Crown size={18} color="#a78bfa" /> CareerNest</h2>
        <p>Super Admin Portal</p>
      </div>

      <div className="sidebar-role-badge">
        <span>Super Administrator</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-help-text">
          As Super Admin, you manage all colleges and their administrators.
        </div>
        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
