import React from 'react';
import { BarChart3, TrendingUp, Users, Award, CheckCircle } from 'lucide-react';

export default function HiringReport({ applications, opportunities }) {
  // Compute analytics
  const totalApps = applications.length;
  const shortlisted = applications.filter(a => ['Shortlisted', 'Interview', 'Offered'].includes(a.status)).length;
  const interviewRounds = applications.filter(a => ['Interview', 'Offered'].includes(a.status)).length;
  const interviews = applications.filter(a => ['Interview', 'Offered'].includes(a.status)).length;
  const offers = applications.filter(a => a.status === 'Offered').length;

  const funnelStages = [
    { label: 'Applications Received', count: totalApps, percentage: 100 },
    { label: 'Resume Shortlisted', count: shortlisted, percentage: totalApps ? Math.round((shortlisted / totalApps) * 100) : 0 },
    { label: 'Interview Stage', count: interviewRounds, percentage: totalApps ? Math.round((interviewRounds / totalApps) * 100) : 0 },
    { label: 'Technical Interviews', count: interviews, percentage: totalApps ? Math.round((interviews / totalApps) * 100) : 0 },
    { label: 'Job Offers Released', count: offers, percentage: totalApps ? Math.round((offers / totalApps) * 100) : 0 },
  ];

  // Department distribution
  const deptCounts = {};
  applications.forEach(a => {
    const dept = a.branch || 'Other';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Hiring Analytics & Funnel Report</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
          Overview of campus recruitment performance, candidate throughput, and departmental distribution.
        </p>
      </div>

      {/* TOP METRIC CARDS */}
      <div className="analytics-summary-grid">
        <div className="analytics-card">
          <h4>Total Candidates</h4>
          <div className="metric-val">{totalApps}</div>
          <p style={{ fontSize: '12px', color: '#059669', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Active recruitment drive
          </p>
        </div>

        <div className="analytics-card">
          <h4>Interview Conversion</h4>
          <div className="metric-val">
            {totalApps ? `${Math.round((interviews / totalApps) * 100)}%` : '0%'}
          </div>
          <p style={{ fontSize: '12px', color: '#4F46E5', marginTop: '6px' }}>
            {interviews} reached interview stage
          </p>
        </div>

        <div className="analytics-card">
          <h4>Offers Extended</h4>
          <div className="metric-val">{offers}</div>
          <p style={{ fontSize: '12px', color: '#D97706', marginTop: '6px' }}>
            Selected top candidates
          </p>
        </div>
      </div>

      {/* HIRING FUNNEL */}
      <div className="funnel-container">
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '18px', color: '#1F2937' }}>
          Candidate Recruitment Funnel
        </h3>

        {funnelStages.map((stage) => (
          <div key={stage.label} className="funnel-stage-row">
            <div className="funnel-stage-name">{stage.label}</div>
            <div className="funnel-bar-bg">
              <div 
                className="funnel-bar-fill" 
                style={{ width: `${Math.max(stage.percentage, 5)}%` }}
              />
            </div>
            <div className="funnel-count">
              {stage.count} <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({stage.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>

      {/* DEPARTMENT & ROLE DISTRIBUTION */}
      <div className="dashboard-grid">
        <div className="dashboard-box">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
            Applications by Department
          </h3>
          <div className="box-list">
            {Object.entries(deptCounts).map(([dept, count]) => {
              const pct = totalApps ? Math.round((count / totalApps) * 100) : 0;
              return (
                <div key={dept} style={{ padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{dept}</span>
                    <span style={{ color: '#6B7280' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '8px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#0F8F63', width: `${pct}%`, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-box">
          <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>
            Open Roles Status
          </h3>
          <div className="box-list">
            {opportunities.map((opp) => (
              <div key={opp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{opp.title}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{opp.location} - {opp.openings} Openings</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F8F63' }}>{opp.applications} Applicants</div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Due: {opp.deadline}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
