import React from 'react';
import { BarChart2, Award, TrendingUp, GraduationCap, Users, CheckCircle, Clock } from 'lucide-react';

// Build department-wise stats from the real students array
function buildDeptStats(students, placedStudentIds) {
  const map = {};
  students.forEach(s => {
    const dept = s.department || s.branch || 'General';
    if (!map[dept]) map[dept] = { total: 0, placed: 0 };
    map[dept].total += 1;
    if (placedStudentIds?.has(s.id) || s.status === 'placed') map[dept].placed += 1;
  });
  return Object.entries(map)
    .map(([dept, d]) => ({
      dept,
      total:  d.total,
      placed: d.placed,
      rate:   d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0,
    }))
    .sort((a, b) => b.rate - a.rate);
}

// Build year-wise stats from the real students array
function buildYearStats(students, placedStudentIds) {
  const map = {};
  students.forEach(s => {
    const year = s.year ? `Year ${s.year}` : 'Unknown';
    if (!map[year]) map[year] = { total: 0, placed: 0 };
    map[year].total += 1;
    if (placedStudentIds?.has(s.id) || s.status === 'placed') map[year].placed += 1;
  });
  return Object.entries(map)
    .map(([year, d]) => ({
      year,
      total:  d.total,
      placed: d.placed,
      rate:   d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0,
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

// Build CGPA distribution buckets from real data
function buildCgpaBuckets(students) {
  const buckets = { '9+': 0, '8–9': 0, '7–8': 0, '6–7': 0, 'Below 6': 0, 'N/A': 0 };
  students.forEach(s => {
    const c = parseFloat(s.cgpa);
    if (isNaN(c))   buckets['N/A']++;
    else if (c >= 9) buckets['9+']++;
    else if (c >= 8) buckets['8–9']++;
    else if (c >= 7) buckets['7–8']++;
    else if (c >= 6) buckets['6–7']++;
    else             buckets['Below 6']++;
  });
  return Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([label, count]) => ({ label, count }));
}

function RateBar({ rate }) {
  return (
    <div className="report-rate-bar-track">
      <div
        className="report-rate-bar-fill"
        style={{
          width: `${rate}%`,
          background: rate >= 80 ? '#22c55e' : rate >= 60 ? '#f59e0b' : '#ef4444',
        }}
      />
    </div>
  );
}

function StatusDonut({ placed, total }) {
  const seeking = total - placed;
  const placedPct  = total > 0 ? Math.round((placed  / total) * 100) : 0;
  const seekingPct = 100 - placedPct;
  return (
    <div className="status-donut-wrap">
      <div className="status-donut-legend">
        <div className="status-legend-row">
          <span className="legend-dot" style={{ background: '#22c55e' }} />
          <span>Placed</span>
          <strong style={{ marginLeft: 'auto', color: '#22c55e' }}>{placed} ({placedPct}%)</strong>
        </div>
        <div className="status-legend-row">
          <span className="legend-dot" style={{ background: '#f59e0b' }} />
          <span>Seeking</span>
          <strong style={{ marginLeft: 'auto', color: '#f59e0b' }}>{seeking} ({seekingPct}%)</strong>
        </div>
        <div className="status-legend-row" style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 4 }}>
          <span className="legend-dot" style={{ background: '#94a3b8' }} />
          <span>Total</span>
          <strong style={{ marginLeft: 'auto' }}>{total}</strong>
        </div>
      </div>
      <div className="status-stacked-bar">
        <div
          style={{ height: `${placedPct}%`, background: '#22c55e', borderRadius: '6px 6px 0 0', transition: 'height 0.5s' }}
          title={`Placed: ${placed}`}
        />
        <div
          style={{ height: `${seekingPct}%`, background: '#fde68a', borderRadius: seekingPct === 100 ? 6 : '0 0 6px 6px' }}
          title={`Seeking: ${seeking}`}
        />
      </div>
    </div>
  );
}

export default function Reports({ students, collegeName, placedStudentIds }) {
  if (!students || students.length === 0) {
    return (
      <>
        <div className="section-header">
          <h2>Placement Reports — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span></h2>
        </div>
        <div className="empty-state">
          <GraduationCap />
          <p>No student data available. Students will appear here once they are registered.</p>
        </div>
      </>
    );
  }

  const deptStats   = buildDeptStats(students, placedStudentIds);
  const yearStats   = buildYearStats(students, placedStudentIds);
  const cgpaBuckets = buildCgpaBuckets(students);
  const placed      = placedStudentIds
    ? students.filter(s => placedStudentIds.has(s.id) || s.status === 'placed').length
    : students.filter(s => s.status === 'placed').length;
  const total       = students.length;
  const rate        = total > 0 ? Math.round((placed / total) * 100) : 0;
  const bestDept    = deptStats[0];
  const avgRate     = deptStats.length > 0
    ? Math.round(deptStats.reduce((s, d) => s + d.rate, 0) / deptStats.length)
    : 0;
  const withBacklogs = students.filter(s => (s.backlogs ?? 0) > 0).length;
  const maxCgpa = Math.max(...students.map(s => parseFloat(s.cgpa) || 0));

  return (
    <>
      <div className="section-header">
        <h2>Placement Reports — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span></h2>
      </div>

      {/* Summary KPIs */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderTop: '3px solid #0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Overall Rate</span>
            <TrendingUp size={14} color="#0ea5e9" style={{ opacity: 0.7 }} />
          </div>
          <span className="stat-value accent">{rate}%</span>
          <span className="stat-sub">{placed} of {total} placed</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Best Department</span>
            <Award size={14} color="#22c55e" style={{ opacity: 0.7 }} />
          </div>
          <span className="stat-value" style={{ fontSize: 18, color: '#15803d' }}>{bestDept?.dept || '—'}</span>
          <span className="stat-sub">{bestDept?.rate ?? 0}% placement rate</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #7c3aed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Avg. Dept Rate</span>
            <BarChart2 size={14} color="#7c3aed" style={{ opacity: 0.7 }} />
          </div>
          <span className="stat-value accent">{avgRate}%</span>
          <span className="stat-sub">Across {deptStats.length} departments</span>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="stat-label">Students w/ Backlogs</span>
            <Clock size={14} color="#ef4444" style={{ opacity: 0.7 }} />
          </div>
          <span className="stat-value" style={{ color: withBacklogs > 0 ? '#ef4444' : '#16a34a' }}>{withBacklogs}</span>
          <span className="stat-sub">of {total} students</span>
        </div>
      </div>

      {/* Two-column: Dept table + Status breakdown */}
      <div className="dashboard-two-col">
        {/* Department Table */}
        <div>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BarChart2 size={15} color="#7c3aed" /> Department-wise Placement
            </h2>
          </div>
          <div className="table-wrap" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Students</th>
                  <th>Placed</th>
                  <th>Rate</th>
                  <th style={{ width: 100 }}>Visual</th>
                </tr>
              </thead>
              <tbody>
                {deptStats.map((d, i) => (
                  <tr key={d.dept}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i === 0 && <Award size={14} color="#f59e0b" title="Best department" />}
                        <span style={{ fontWeight: i === 0 ? 700 : 400 }}>{d.dept}</span>
                      </div>
                    </td>
                    <td>{d.total}</td>
                    <td><strong style={{ color: '#16a34a' }}>{d.placed}</strong></td>
                    <td>
                      <span className={`badge ${d.rate >= 80 ? 'badge-green' : d.rate >= 60 ? 'badge-yellow' : 'badge-red'}`}>
                        {d.rate}%
                      </span>
                    </td>
                    <td><RateBar rate={d.rate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status breakdown + Year stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Placement status visual */}
          <div>
            <div className="section-header" style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={15} color="#22c55e" /> Student Status Breakdown
              </h2>
            </div>
            <div className="monthly-trend-card" style={{ padding: '18px 20px' }}>
              <StatusDonut placed={placed} total={total} />
            </div>
          </div>

          {/* Year-wise table */}
          {yearStats.length > 0 && (
            <div>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={15} color="#0ea5e9" /> Year-wise Placement
                </h2>
              </div>
              <div className="table-wrap" style={{ marginBottom: 0 }}>
                <table>
                  <thead>
                    <tr><th>Year</th><th>Students</th><th>Placed</th><th>Rate</th></tr>
                  </thead>
                  <tbody>
                    {yearStats.map(y => (
                      <tr key={y.year}>
                        <td style={{ fontWeight: 600 }}>{y.year}</td>
                        <td>{y.total}</td>
                        <td><strong style={{ color: '#16a34a' }}>{y.placed}</strong></td>
                        <td>
                          <span className={`badge ${y.rate >= 80 ? 'badge-green' : y.rate >= 60 ? 'badge-yellow' : 'badge-red'}`}>
                            {y.rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CGPA Distribution */}
      {cgpaBuckets.length > 0 && (
        <>
          <div className="section-header" style={{ marginTop: 20, marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={15} color="#f59e0b" /> CGPA Distribution
            </h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>Highest: {maxCgpa > 0 ? maxCgpa.toFixed(2) : '—'}</span>
          </div>
          <div className="table-wrap" style={{ marginBottom: 0 }}>
            <table>
              <thead>
                <tr><th>CGPA Range</th><th>Count</th><th style={{ width: 200 }}>Distribution</th></tr>
              </thead>
              <tbody>
                {cgpaBuckets.map(b => (
                  <tr key={b.label}>
                    <td style={{ fontWeight: 600 }}>{b.label}</td>
                    <td>{b.count}</td>
                    <td>
                      <div className="report-rate-bar-track">
                        <div
                          className="report-rate-bar-fill"
                          style={{
                            width: `${Math.round((b.count / total) * 100)}%`,
                            background: '#0ea5e9',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
