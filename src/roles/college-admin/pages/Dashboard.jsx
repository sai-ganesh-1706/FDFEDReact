import React, { useState } from 'react';
import {
  ShieldCheck, GraduationCap, Users, TrendingUp, Building2,
  ArrowRight, Megaphone, BarChart2, AlertTriangle, CheckCircle,
  Activity, UserPlus, Clock
} from 'lucide-react';

function FunnelCard({ students, placed }) {
  const rate = students > 0 ? Math.round((placed / students) * 100) : 0;
  const inProgress = students - placed;
  return (
    <div className="funnel-card">
      <div className="funnel-card-header">
        <TrendingUp size={16} color="#0ea5e9" />
        <strong>Placement Funnel</strong>
      </div>
      <div className="funnel-rate-display">
        <span className="funnel-rate-number">{rate}%</span>
        <span className="funnel-rate-label">placement rate</span>
      </div>
      <div className="funnel-bar-track">
        <div className="funnel-bar-fill" style={{ width: `${rate}%` }} />
      </div>
      <div className="funnel-stats-row">
        <div className="funnel-stat">
          <span className="funnel-stat-val" style={{ color: '#22c55e' }}>{placed}</span>
          <span className="funnel-stat-label">Placed</span>
        </div>
        <div className="funnel-stat-divider" />
        <div className="funnel-stat">
          <span className="funnel-stat-val" style={{ color: '#f59e0b' }}>{inProgress}</span>
          <span className="funnel-stat-label">Seeking</span>
        </div>
        <div className="funnel-stat-divider" />
        <div className="funnel-stat">
          <span className="funnel-stat-val">{students}</span>
          <span className="funnel-stat-label">Total</span>
        </div>
      </div>
    </div>
  );
}

function OfficerSummaryCard({ officers }) {
  const active   = officers.filter(o => o.status === 'active').length;
  const inactive = officers.length - active;
  return (
    <div className="officer-summary-card">
      <div className="funnel-card-header">
        <ShieldCheck size={16} color="#0ea5e9" />
        <strong>Officer Status</strong>
      </div>
      {officers.length === 0 ? (
        <div className="officer-empty-warn">
          <AlertTriangle size={16} color="#f59e0b" />
          <span>No placement officers assigned yet</span>
        </div>
      ) : (
        <>
          <div className="officer-status-row">
            <div className="officer-status-pill active">
              <CheckCircle size={14} /> {active} Active
            </div>
            <div className="officer-status-pill inactive">
              <Clock size={14} /> {inactive} Inactive
            </div>
          </div>
          <div className="officer-mini-list">
            {officers.slice(0, 4).map(o => (
              <div key={o.id} className="officer-mini-row">
                <div className="chip-avatar" style={{ width: 28, height: 28, fontSize: 11, background: '#0ea5e9', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {o.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="officer-mini-name">{o.name}</span>
                <span className={`badge ${o.status === 'active' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CADashboard({ collegeName, userName, officers, students, alumniCount, recruiterCount, setActiveTab }) {
  const placed = students.filter(s => s.status === 'placed').length;

  const kpis = [
    { label: 'Students',           value: students.length,  icon: GraduationCap, color: '#0ea5e9', accent: true },
    { label: 'Placement Officers', value: officers.length,   icon: ShieldCheck,   color: '#7c3aed' },
    { label: 'Alumni',             value: alumniCount,       icon: Users,         color: '#22c55e' },
    { label: 'Recruiters',         value: recruiterCount,    icon: Building2,     color: '#f59e0b' },
    { label: 'Total Placed',       value: placed,            icon: TrendingUp,    color: '#16a34a', accent: true },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h2>Welcome, <span>{userName?.split(' ')[0] || 'Admin'}</span> 👋</h2>
          <p>Managing <strong style={{ color: '#fff' }}>{collegeName || 'your college portal'}</strong></p>
        </div>
        <div className="welcome-banner-meta">
          <span><GraduationCap size={14} /> {students.length} Students</span>
          <span><ShieldCheck size={14} /> {officers.length} Officers</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="stats-grid">
        {kpis.map(k => (
          <div className="stat-card" key={k.label} style={{ borderTop: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="stat-label">{k.label}</span>
              <k.icon size={15} color={k.color} style={{ opacity: 0.7 }} />
            </div>
            <span className={`stat-value ${k.accent ? 'accent' : ''}`}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Two-column: Funnel + Officer Summary */}
      <div className="dashboard-two-col" style={{ marginBottom: 24 }}>
        <FunnelCard students={students.length} placed={placed} />
        <OfficerSummaryCard officers={officers} />
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions-list-grid">
        <button className="quick-action-row" onClick={() => setActiveTab('officers')}>
          <div className="qa-icon" style={{ background: '#f0f9ff' }}>
            <UserPlus size={18} color="#0ea5e9" />
          </div>
          <div className="qa-text">
            <strong>Add Placement Officer</strong>
            <span>Assign a new officer to your college</span>
          </div>
          <ArrowRight size={14} color="#94a3b8" />
        </button>

        <button className="quick-action-row" onClick={() => setActiveTab('students')}>
          <div className="qa-icon" style={{ background: '#f0fdf4' }}>
            <GraduationCap size={18} color="#22c55e" />
          </div>
          <div className="qa-text">
            <strong>View Students</strong>
            <span>Browse and filter student profiles</span>
          </div>
          <ArrowRight size={14} color="#94a3b8" />
        </button>

        <button className="quick-action-row" onClick={() => setActiveTab('announcements')}>
          <div className="qa-icon" style={{ background: '#fffbeb' }}>
            <Megaphone size={18} color="#f59e0b" />
          </div>
          <div className="qa-text">
            <strong>Post Announcement</strong>
            <span>Notify placement officers of updates</span>
          </div>
          <ArrowRight size={14} color="#94a3b8" />
        </button>

        <button className="quick-action-row" onClick={() => setActiveTab('reports')}>
          <div className="qa-icon" style={{ background: '#f5f3ff' }}>
            <BarChart2 size={18} color="#7c3aed" />
          </div>
          <div className="qa-text">
            <strong>Placement Reports</strong>
            <span>Department-wise analytics</span>
          </div>
          <ArrowRight size={14} color="#94a3b8" />
        </button>
      </div>

      {/* Officers Preview Table */}
      <div className="section-header" style={{ marginTop: 20 }}>
        <h2>Placement Officers</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('officers')}>
          <ArrowRight size={14} /> View All
        </button>
      </div>
      <div className="table-wrap" style={{ marginBottom: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Students Handled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {officers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  No placement officers yet — <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('officers')}>Add one</button>
                </td>
              </tr>
            ) : officers.slice(0, 5).map(u => (
              <tr key={u.id}>
                <td>
                  <div className="chip">
                    <div className="chip-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                    <div className="chip-info">
                      <div className="chip-name">{u.name}</div>
                      <div className="chip-sub">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12 }}>{u.department || '—'}</td>
                <td style={{ fontSize: 13 }}>{u.studentsHandled ?? '—'}</td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
