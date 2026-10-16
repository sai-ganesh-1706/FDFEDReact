import React, { useState, useMemo } from 'react';
import { GraduationCap } from 'lucide-react';

function cgpaClass(cgpa) {
  if (!cgpa) return '';
  if (cgpa >= 8) return 'cgpa-high';
  if (cgpa >= 6.5) return 'cgpa-mid';
  return 'cgpa-low';
}

export default function Students({ students, collegeName }) {
  const [query, setQuery]   = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const departments = useMemo(() => {
    const depts = [...new Set(students.map(s => s.department).filter(Boolean))];
    return ['All', ...depts.sort()];
  }, [students]);

  const years = useMemo(() => {
    const yrs = [...new Set(students.map(s => s.year).filter(Boolean))].sort();
    return ['All', ...yrs];
  }, [students]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter(s => {
      const matchQ    = !q || s.name.toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q) || (s.rollNumber || '').toLowerCase().includes(q);
      const matchDept = deptFilter === 'All' || s.department === deptFilter;
      const matchYear = yearFilter === 'All' || String(s.year) === String(yearFilter);
      return matchQ && matchDept && matchYear;
    });
  }, [students, query, deptFilter, yearFilter]);

  return (
    <>
      <div className="section-header">
        <h2>Students — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span></h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
        A read-only view of your college's students. Placement status and student records are managed by the placement cell.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: '1 1 220px', margin: 0 }}>
          <input
            placeholder="Search by name, email or roll number…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }}
        >
          {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
        </select>
        <select
          value={yearFilter}
          onChange={e => setYearFilter(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff' }}
        >
          {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : `Year ${y}`}</option>)}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll No.</th>
              <th>Department</th>
              <th>Year</th>
              <th>CGPA</th>
              <th>Backlogs</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <GraduationCap />
                    <p>{query ? 'No students match your search.' : 'No students found.'}</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(u => (
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
                <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{u.rollNumber || '—'}</td>
                <td style={{ fontSize: 13 }}>{u.department || '—'}</td>
                <td style={{ fontSize: 13 }}>{u.year ? `${u.year}` : '—'}</td>
                <td>
                  <span className={cgpaClass(u.cgpa)} style={{ fontWeight: 700, fontSize: 13 }}>
                    {u.cgpa ?? '—'}
                  </span>
                </td>
                <td>
                  {u.backlogs > 0
                    ? <span className="badge badge-red">{u.backlogs}</span>
                    : <span className="badge badge-green">0</span>
                  }
                </td>
                <td>
                  <span className={`badge ${u.status === 'active' || u.status === 'placed' ? 'badge-green' : 'badge-gray'}`}>
                    {u.status || 'active'}
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

