import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import { MOCK } from '../data/mockdata';

export default function DeptReport({ onNavigate, activePage = 'dept-report' }) {
  const [report] = useState({
    totalStudents: 342,
    totalPlaced: 246,
    overall: 72,
    departments: [
      { dept: 'CSE', total: 120, placed: 98, rate: 82, avgPackage: 14.5 },
      { dept: 'ECE', total: 90, placed: 67, rate: 74, avgPackage: 11.2 },
      { dept: 'MECH', total: 80, placed: 45, rate: 56, avgPackage: 8.4 },
      { dept: 'EEE', total: 55, placed: 31, rate: 56, avgPackage: 9.0 },
      { dept: 'CIV', total: 72, placed: 38, rate: 53, avgPackage: 7.2 }
    ]
  });

  const sortedDepts = [...report.departments].sort((a, b) => b.rate - a.rate);

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Department Placement Report ⭐" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Department-wise Placement Report</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Placement rates, average packages, and student counts broken down by academic department.</p>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', border: '1px solid #e2e8f0', flex: 1, minWidth: '140px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Total Students</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#3b82f6' }}>{report.totalStudents}</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', border: '1px solid #e2e8f0', flex: 1, minWidth: '140px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Total Placed</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669' }}>{report.totalPlaced}</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', border: '1px solid #e2e8f0', flex: 1, minWidth: '140px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Overall Placement Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b' }}>{report.overall}%</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', border: '1px solid #e2e8f0', flex: 1, minWidth: '140px', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>Departments</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed' }}>{report.departments.length}</div>
          </div>
        </div>

        {/* Table Wrap */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📊 Department Breakdown
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>#</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Department</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Students</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Placed</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Placement Rate</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Avg Package</th>
                </tr>
              </thead>
              <tbody>
                {sortedDepts.map((d, i) => {
                  const rateColor = d.rate >= 70 ? '#059669' : d.rate >= 50 ? '#d97706' : '#ef4444';

                  return (
                    <tr key={d.dept} style={{ borderBottom: i < sortedDepts.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>{d.dept}</td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: '#374151' }}>{d.total}</td>
                      <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 600, fontSize: '13px' }}>{d.placed}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ height: '8px', borderRadius: '4px', background: '#f1f5f9', flex: 1, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '4px', background: rateColor, width: `${d.rate}%`, transition: 'width .6s ease' }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, minWidth: '38px', textAlign: 'right', color: rateColor }}>
                            {d.rate}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#7c3aed', fontSize: '13px' }}>{d.avgPackage} LPA</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
