import React from 'react';
import { 
  LayoutDashboard, 
  Send, 
  Briefcase, 
  Users, 
  CalendarCheck, 
  Filter, 
  BarChart2, 
  User, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, recruiter, onSignOut }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'post', label: 'Post Opportunity', icon: Send },
    { id: 'opportunities', label: 'My Opportunities', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'assessments', label: 'Assessments', icon: CalendarCheck },
    { id: 'candidates', label: 'Candidate Filter', icon: Filter },
    { id: 'reports', label: 'Hiring Report', icon: BarChart2 },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-section">
          <h1 className="brand-title">CareerNest</h1>
          <p className="brand-role">Recruiter Portal</p>
        </div>

        <div className="profile-badge" onClick={() => setActiveTab('profile')}>
          <div className="avatar">{recruiter.avatar || 'RC'}</div>
          <div className="profile-info">
            <p className="profile-name">{recruiter.name}</p>
            <p className="profile-email">{recruiter.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id}>
                  <button 
                    className={`nav-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button className="btn-signout" onClick={onSignOut}>
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
