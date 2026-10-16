import { clearSession } from '../../../services/api.js';
import React, { useState } from 'react';
import { BarChart3, Bell, BriefcaseBusiness, ClipboardList, LayoutDashboard, LogOut, UserCog, UsersRound } from 'lucide-react';
import SignOutModal from './SignOutModal';

const navItems = [
  { label: 'Dashboard',            href: 'p1.html',               page: 'p1',               icon: LayoutDashboard },
  { label: 'Review Opportunities', href: 'p2.html',               page: 'p2',               icon: BriefcaseBusiness },
  { label: 'Statistics',           href: 'p3.html',               page: 'p3',               icon: BarChart3 },
  { label: 'Recruiters',           href: 'p4.html',               page: 'p4',               icon: UsersRound },
  { label: 'User Oversight',       href: 'p5.html',               page: 'p5',               icon: UserCog },
  { label: 'App Tracking',         href: 'p6.html',               page: 'p6',               icon: ClipboardList },
  { label: 'Bulk Notifications',   href: 'bulk-notify.html',      page: 'bulk-notify',      icon: Bell },
];

export default function Sidebar({ activePage = 'p1', onNavigate }) {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);
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
        {navItems.map((item) => {
          const Icon = item.icon;
          return <li
            key={item.page}
            className={`nav-item${activePage === item.page ? ' active' : ''}`}
            onClick={() => handleClick(item)}
            style={{ cursor: 'pointer' }}
          >
            <span className="placement-nav-label"><Icon size={18} strokeWidth={2} aria-hidden="true" />{item.label}</span>
          </li>
        })}
      </ul>

      <div className="sidebar-signout">
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
          onClick={() => setIsSignOutOpen(true)}
        >
          <span className="placement-nav-label"><LogOut size={18} strokeWidth={2} aria-hidden="true" />Sign Out</span>
        </button>
      </div>
      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={() => {
          clearSession();
          window.location.href = '/login';
        }}
      />
    </nav>
  );
}

