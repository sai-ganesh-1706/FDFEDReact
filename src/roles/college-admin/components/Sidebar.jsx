import React from 'react';
import {
  LayoutDashboard, ShieldCheck, GraduationCap,
  Megaphone, BarChart2, Building2, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',           icon: LayoutDashboard },
  { id: 'officers',       label: 'Placement Officers',  icon: ShieldCheck },
  { id: 'students',       label: 'Students',            icon: GraduationCap },
  { id: 'announcements',  label: 'Announcements',       icon: Megaphone },
  { id: 'reports',        label: 'Reports',             icon: BarChart2 },
];

export default function CollegeAdminSidebar({ activeTab, setActiveTab, collegeName, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2><Building2 size={18} color="#7dd3fc" /> CareerNest</h2>
        <p title={collegeName}>{collegeName || 'College Admin'}</p>
      </div>

      <div className="sidebar-role-badge">
        <span>🏫 College Administrator</span>
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
          You manage placement officers and student outcomes for your college.
        </div>
        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
