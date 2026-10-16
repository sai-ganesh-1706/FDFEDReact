import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import { MOCK } from '../data/mockdata';

export default function PlacementDashboard({ onNavigate, activePage = 'placement-dashboard' }) {
  const [data] = useState({
    totalStudents: 342,
    totalPlaced: 246,
    placementRate: 72,
    avgPackage: 18,
    highestPackage: 32,
    topCompanies: [
      { company: 'TechCorp Solutions', offers: 48, avgPackage: 12 },
      { company: 'Infosys', offers: 67, avgPackage: 9.5 },
      { company: 'CloudBase Inc', offers: 24, avgPackage: 14 },
      { company: 'AI Dynamics', offers: 18, avgPackage: 18 },
      { company: 'Amazon', offers: 12, avgPackage: 28 },
      { company: 'TCS', offers: 52, avgPackage: 7 }
    ],
    byDept: [
      { dept: 'CSE', total: 120, placed: 98, rate: 82 },
      { dept: 'ECE', total: 90, placed: 67, rate: 74 },
      { dept: 'ME', total: 80, placed: 45, rate: 56 },
      { dept: 'EEE', total: 55, placed: 31, rate: 56 },
      { dept: 'CIV', total: 72, placed: 38, rate: 53 }
    ],
    monthlyTrend: [
      { month: 'Aug', placements: 15 },
      { month: 'Sep', placements: 30 },
      { month: 'Oct', placements: 45 },
      { month: 'Nov', placements: 45 },
      { month: 'Dec', placements: 57 },
      { month: 'Jan', placements: 46 },
      { month: 'Feb', placements: 65 },
      { month: 'Mar', placements: 75 }
    ]
  });

  const maxTrend = Math.max(...data.monthlyTrend.map(m => m.placements));

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Advanced Placement Dashboard 👑" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Executive Placement Insights</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Real-time placement analytics — KPIs, department performance, top hiring partners, and monthly growth trends.</p>
        </div>

        {/* KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Total Students</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>{data.totalStudents}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Registered Candidates</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Placed Students</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{data.totalPlaced}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>This Academic Cycle</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Placement Rate</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{data.placementRate}%</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Overall College Avg</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Avg Package</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>{data.avgPackage}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>LPA (CTC)</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>Highest Package</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{data.highestPackage}</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>LPA (Record)</div>
          </div>
        </div>

        {/* Two-Column: Top Companies & Department Performance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          {/* Top Companies */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏢 Top Recruiter Partners
            </div>
            <div>
              {data.topCompanies.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < data.topCompanies.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{i + 1}. {c.company}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{c.offers} student offers</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#7c3aed' }}>{c.avgPackage} LPA avg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Performance */}
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📊 Department Performance
            </div>
            <div>
              {data.byDept.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: i < data.byDept.length - 1 ? '1px solid #f9fafb' : 'none', gap: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#374151', minWidth: '45px' }}>{d.dept}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: '10px', borderRadius: '5px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '5px', background: '#6366f1', width: `${d.rate}%`, transition: 'width .6s' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#6366f1', minWidth: '42px', textAlign: 'right' }}>{d.rate}%</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', minWidth: '65px', textAlign: 'right' }}>{d.placed}/{d.total}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Placement Trend Chart */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 Monthly Placement Trajectory
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', padding: '24px 24px 16px' }}>
            {data.monthlyTrend.map((m, i) => {
              const heightPct = Math.round((m.placements / maxTrend) * 100);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>{m.placements}</div>
                  <div style={{ width: '100%', maxWidth: '40px', borderRadius: '6px 6px 0 0', background: 'linear-gradient(180deg, #6366f1 0%, #4338ca 100%)', height: `${heightPct}%`, minHeight: '6px', transition: 'height .5s' }} />
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
