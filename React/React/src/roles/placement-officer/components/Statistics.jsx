import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/p3.css';
import './styles/statistics.css';
import { useOfficerData } from '../services/officerApi';

export default function Statistics({ onNavigate, activePage = 'p3' }) {
  const { data, ready, refresh, error } = useOfficerData();
  const s = data.stats;
  const branches = data.branches;
  const trend = data.trend;
  const topCompanies = data.topCompanies || [];
  const monthlyTrend = data.monthlyTrend || [];
  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 20000);
    return () => clearInterval(timer);
  }, [refresh]);

  const lineChartRef   = useRef(null);
  const barChartRef    = useRef(null);
  const doughnutChartRef = useRef(null);
  const chartInstances = useRef([]);

  const [showFullTime,    setShowFullTime]    = useState(true);
  const [showInternships, setShowInternships] = useState(true);
  const [lineChart,       setLineChart]       = useState(null);
  const [activeTab,       setActiveTab]       = useState('overview');

  const maxTrend = Math.max(1, ...monthlyTrend.map((m) => m.placements));

  /* ── KPI Cards ─────────────────────────────────────────────── */
  const kpiCards = [
    { value: s.totalCandidates,     label: 'Total Candidates',   color: '#3B82F6', bg: '#EFF6FF' },
    { value: `${s.placementRate}%`, label: 'Placement Rate',     color: '#22C55E', bg: '#F0FDF4' },
    { value: `${s.highestPkg} LPA`, label: 'Highest Package',    color: '#9810fa', bg: '#FAF5FF' },
    { value: s.companiesVisited,    label: 'Companies Visited',  color: '#F97316', bg: '#FFF7ED' },
    { value: s.totalApps,           label: 'Total Applications', color: '#3B82F6', bg: '#EFF6FF' },
    { value: `${s.avgPkg} LPA`,     label: 'Average Package',    color: '#22C55E', bg: '#F0FDF4' },
    { value: s.studentsPlaced,      label: 'Students Placed',    color: '#16a34a', bg: '#F0FDF4' },
    { value: s.offersMade,          label: 'Offers Made',        color: '#9810fa', bg: '#FAF5FF' },
    { value: s.internships,         label: 'Internship Applications', color: '#F97316', bg: '#FFF7ED' },
  ];

  /* ── Charts ─────────────────────────────────────────────────── */
  useEffect(() => {
    initCharts();
    return () => {
      chartInstances.current.forEach((c) => { try { c.destroy(); } catch (e) {} });
      chartInstances.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, activeTab, data]);

  const initCharts = () => {
    chartInstances.current.forEach((c) => { try { c.destroy(); } catch (e) {} });
    chartInstances.current = [];

    // Line Chart — Monthly Trend
    if (lineChartRef.current) {
      const chart = new Chart(lineChartRef.current.getContext('2d'), {
        type: 'line',
        data: {
          labels: trend.labels,
          datasets: [
            { label: 'Full-time applications', data: trend.fullTime, hidden: !showFullTime, borderColor: '#7c3aed', backgroundColor: 'rgba(124,58,237,0.08)', tension: 0.3, fill: true },
            { label: 'Internship applications', data: trend.internships, hidden: !showInternships, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)', tension: 0.3, fill: true },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { display: false } } },
      });
      chartInstances.current.push(chart);
      setLineChart(chart);
    }

    // Bar Chart — Branch-wise Placement
    if (barChartRef.current) {
      const bar = new Chart(barChartRef.current.getContext('2d'), {
        type: 'bar',
        data: {
          labels: branches.map((b) => b.name),
          datasets: [
            { label: 'Total',  data: branches.map((b) => b.total),  backgroundColor: '#e2e8f0' },
            { label: 'Placed', data: branches.map((b) => b.placed), backgroundColor: branches.map((b) => b.color) },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { legend: { position: 'bottom' } } },
      });
      chartInstances.current.push(bar);
    }

    // Doughnut Chart — Placements by Branch
    if (doughnutChartRef.current) {
      const doughnut = new Chart(doughnutChartRef.current.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: branches.map((b) => b.name),
          datasets: [{ data: branches.map((b) => b.placed), backgroundColor: branches.map((b) => b.color) }],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
      chartInstances.current.push(doughnut);
    }
  };

  const toggleLine = (type) => {
    if (!lineChart) return;
    const idx = type === 'fulltime' ? 0 : 1;
    if (type === 'fulltime') {
      setShowFullTime((prev) => { lineChart.data.datasets[idx].hidden = prev; lineChart.update(); return !prev; });
    } else {
      setShowInternships((prev) => { lineChart.data.datasets[idx].hidden = prev; lineChart.update(); return !prev; });
    }
  };

  /* ── Tabs ────────────────────────────────────────────────────── */
  const tabs = [
    { key: 'overview',   label: '📊 Overview' },
    { key: 'recruiters', label: '🏢 Top Recruiters' },
  ];

  return (
    <div className="frame statistics-page">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <Header title="Statistics & Analytics" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent">
        {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: 16 }}>{error}</p>}
        {!ready && !error && <p role="status">Loading statistics from the backend…</p>}
        <button type="button" onClick={() => refresh()} style={{ float: 'right', border: '1px solid #7c3aed', color: '#7c3aed', background: '#fff', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}>Refresh Statistics</button>

        {/* ── Page Intro ─────────────────────────────────────────── */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
            Placement Statistics
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Unified view of KPIs, charts, top recruiters, and monthly trends.
          </p>
        </div>

        {/* ── KPI Grid ───────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}>
          {kpiCards.map((k, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,.04)',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '6px' }}>
                {k.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ───────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: activeTab === t.key ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                background: activeTab === t.key ? '#faf5ff' : '#fff',
                color: activeTab === t.key ? '#7c3aed' : '#64748b',
                fontWeight: activeTab === t.key ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TAB: OVERVIEW ══════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Monthly Trend Chart */}
            <div className="chart-card full">
              <div className="chart-header">
                <h3>Applications by Month</h3>
                <div className="chart-toggles">
                  <button className={`chart-toggle${showFullTime ? ' active' : ''}`} onClick={() => toggleLine('fulltime')}>
                    <span className="toggle-dot purple-dot" /> Full Time
                  </button>
                  <button className={`chart-toggle${showInternships ? ' active' : ''}`} onClick={() => toggleLine('internships')}>
                    <span className="toggle-dot green-dot" /> Internships
                  </button>
                </div>
              </div>
              <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                <canvas ref={lineChartRef} />
              </div>
            </div>

            {/* Bar + Doughnut */}
            <div className="charts-row" style={{ marginTop: '20px' }}>
              <div className="chart-card">
                <h3>Branch-wise Placement</h3>
                <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                  <canvas ref={barChartRef} />
                </div>
              </div>
              <div className="chart-card">
                <h3>Placements by Branch</h3>
                <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                  <canvas ref={doughnutChartRef} />
                </div>
              </div>
            </div>

            {/* Monthly Trajectory (bar) */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden', marginTop: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                📈 Monthly Placement Trajectory
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '160px', padding: '24px 24px 16px' }}>
                {monthlyTrend.map((m, i) => {
                  const heightPct = Math.round((m.placements / maxTrend) * 100);
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: 700 }}>{m.placements}</div>
                      <div style={{ width: '100%', maxWidth: '40px', borderRadius: '6px 6px 0 0', background: 'linear-gradient(180deg,#6366f1 0%,#4338ca 100%)', height: `${heightPct}%`, minHeight: '6px', transition: 'height .5s' }} />
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ══ TAB: TOP RECRUITERS ════════════════════════════════════ */}
        {activeTab === 'recruiters' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              🏢 Top Recruiter Partners
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    {['#', 'Company', 'Full-time Offers', 'Avg Offered Package'].map((h) => (
                      <th key={h} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 18px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topCompanies.map((c, i) => (
                    <tr key={i} style={{ borderBottom: i < topCompanies.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{c.company}</td>
                      <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 600, fontSize: '13px' }}>{c.offers} students</td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#7c3aed', fontSize: '13px' }}>{c.avgPackage} LPA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
