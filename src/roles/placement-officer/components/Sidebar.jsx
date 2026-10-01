import React from 'react';

const navItems = [
  { label: 'Dashboard', href: 'p1.html', page: 'p1', icon: '📊' },
  { label: 'Review Opportunities', href: 'p2.html', page: 'p2', icon: '📝' },
  { label: 'Statistics', href: 'p3.html', page: 'p3', icon: '📈' },
  { label: 'Recruiters', href: 'p4.html', page: 'p4', icon: '💼' },
  { label: 'User Oversight', href: 'p5.html', page: 'p5', icon: '👥' },
  { label: 'App Tracking', href: 'p6.html', page: 'p6', icon: '📋' },
  { label: 'Placement Drives', href: 'placement-dashboard.html', page: 'placement-dashboard', icon: '🎯' },
  { label: 'Bulk Notifications', href: 'bulk-notify.html', page: 'bulk-notify', icon: '📢' },
  { label: 'Candidates Filter', href: 'candidates-filter.html', page: 'candidates-filter', icon: '🔍' },
  { label: 'Department Report', href: 'dept-report.html', page: 'dept-report', icon: '📑' },
];

export default function Sidebar({ activePage = 'p1', onNavigate }) {
  const handleClick = (item) => {
    if (onNavigate) {
      onNavigate(item.page);
    } else {
      window.location.href = item.href;
    }
  };

  return (
    <nav className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <h2>CareerNest</h2>
        <span>Placement Officer</span>
      </div>

      <ul className="sidebar-nav">
        {navItems.map((item) => (
          <li
            key={item.page}
            className={`nav-item${activePage === item.page ? ' active' : ''}`}
            onClick={() => handleClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <span>{item.icon} {item.label}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-signout">
        <a href="../../login.html" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span>🚪 Sign Out</span>
        </a>
      </div>
    </nav>
  );
}

