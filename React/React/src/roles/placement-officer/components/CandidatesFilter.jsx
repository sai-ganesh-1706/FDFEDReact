import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './styles/p1.css';
import api, { errorMessage } from '../../../services/api.js';

// The API stores full department names; this screen filters on short codes.
const DEPT_CODES = {
  'computer science': 'CSE', electronics: 'ECE', electrical: 'EEE',
  mechanical: 'MECH', civil: 'CIV', it: 'IT',
};
const deptCode = (name = '') => DEPT_CODES[name.trim().toLowerCase()] || name;

export default function CandidatesFilter({ onNavigate, activePage = 'candidates-filter' }) {
  const [candidates, setCandidates] = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api.get('/features/officer/candidates/filter')
      .then(({ data }) => setCandidates(data.map((c) => ({ ...c, dept: deptCode(c.dept) }))))
      .catch((error) => setLoadError(errorMessage(error, 'Could not load candidates.')));
  }, []);
  const [dept, setDept] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [maxBacklogs, setMaxBacklogs] = useState('');

  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (dept && c.dept.toLowerCase() !== dept.toLowerCase()) return false;
      if (minCgpa !== '' && c.cgpa < parseFloat(minCgpa)) return false;
      if (maxBacklogs !== '' && c.backlogs > parseInt(maxBacklogs, 10)) return false;
      return true;
    });
  }, [candidates, dept, minCgpa, maxBacklogs]);

  const handleClear = () => {
    setDept('');
    setMinCgpa('');
    setMaxBacklogs('');
  };

  const handleExportCSV = () => {
    if (filteredCandidates.length === 0) {
      alert('No candidates match the current filters to export.');
      return;
    }
    const header = 'Name,Roll No,Department,CGPA,Backlogs,Batch,Skills';
    const rows = filteredCandidates.map(
      c => `"${c.name}","${c.rollNo}","${c.dept}",${c.cgpa},${c.backlogs},"${c.batch}","${c.skills.join('; ')}"`
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_candidates.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="frame">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />

      <Header title="Candidate Filter ⭐" onNavigate={onNavigate} />

      <main className="main-content" id="mainContent" style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
        {loadError && (
          <p style={{ color: '#991b1b', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', marginBottom: '16px' }}>{loadError}</p>
        )}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Filter & Shortlist Candidates</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Search across all registered students by department, minimum CGPA, and backlog limit. Export filtered lists directly to CSV.</p>
        </div>

        {/* Filter Bar */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'flex-end', boxShadow: '0 1px 4px rgba(0,0,0,.06)', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Department</label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#1e293b', background: '#f8fafc', outline: 'none', minWidth: '140px' }}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIV">CIV</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Min CGPA</label>
            <input
              type="number"
              placeholder="e.g. 7.5"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onKeyDown={(e) => {
                if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/-/g, '');
                if (val === '' || (Number(val) >= 0 && Number(val) <= 10)) {
                  setMinCgpa(val);
                }
              }}
              style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#1e293b', background: '#f8fafc', outline: 'none', width: '110px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.5px' }}>Max Backlogs</label>
            <input
              type="number"
              placeholder="e.g. 0"
              min="0"
              max="20"
              value={maxBacklogs}
              onKeyDown={(e) => {
                if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setMaxBacklogs(val);
              }}
              style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#1e293b', background: '#f8fafc', outline: 'none', width: '110px' }}
            />
          </div>

          <button
            type="button"
            onClick={handleClear}
            style={{ background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 16px', fontSize: '13px', cursor: 'pointer', marginTop: 'auto' }}
          >
            ✕ Reset Filters
          </button>
        </div>

        {/* Table Container */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Matching Candidates</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: 600 }}>
                {filteredCandidates.length} students found
              </span>
              <button
                type="button"
                onClick={handleExportCSV}
                style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                ⬇ Export CSV
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa' }}>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>#</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Name</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Roll No</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Dept</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>CGPA</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Backlogs</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Batch</th>
                  <th style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#94a3b8', fontWeight: 600, padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #f1f5f9' }}>Key Skills</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                      No candidates match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c, i) => {
                    const cgpaClass = c.cgpa >= 8 ? '#dcfce7' : c.cgpa >= 7 ? '#fef3c7' : '#fee2e2';
                    const cgpaColor = c.cgpa >= 8 ? '#166534' : c.cgpa >= 7 ? '#92400e' : '#dc2626';

                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#94a3b8' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{c.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{c.rollNo}</td>
                        <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4338ca' }}>{c.dept}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: cgpaClass, color: cgpaColor }}>
                            {c.cgpa}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {c.backlogs === 0 ? (
                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '12px' }}>0</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>{c.backlogs}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748b' }}>{c.batch}</td>
                        <td style={{ padding: '12px 16px', fontSize: '11px', color: '#475569' }}>
                          {c.skills.slice(0, 3).join(', ')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
