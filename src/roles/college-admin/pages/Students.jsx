import React, { useState, useMemo } from 'react';
import { errorMessage } from '../../../services/api.js';
import { Search, GraduationCap, CheckSquare, UserCheck } from 'lucide-react';

function cgpaClass(cgpa) {
  if (!cgpa) return '';
  if (cgpa >= 8) return 'cgpa-high';
  if (cgpa >= 6.5) return 'cgpa-mid';
  return 'cgpa-low';
}

export default function Students({ students, platform, collegeName, showToast }) {
  const [query, setQuery]   = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);

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

  const allFilteredSelected = filtered.length > 0 && filtered.every((student) => selectedIds.includes(student.id));
  const toggleAll = () => {
    const filteredIds = filtered.map((student) => student.id);
    setSelectedIds((current) => allFilteredSelected
      ? current.filter((id) => !filteredIds.includes(id))
      : [...new Set([...current, ...filteredIds])]);
  };
  const toggleOne = (id) => setSelectedIds((current) => current.includes(id)
    ? current.filter((studentId) => studentId !== id)
    : [...current, id]);
  const updateSelected = async (status) => {
    if (!selectedIds.length) return;
    try {
      await platform.setStudentsStatus(selectedIds, status);
      showToast(`${selectedIds.length} student${selectedIds.length === 1 ? '' : 's'} updated to ${status}.`, 'success');
      setSelectedIds([]);
    } catch (error) {
      showToast(errorMessage(error, 'Could not update the selected students.'), 'error');
    }
  };

  return (
    <>
      <div className="section-header">
        <h2>Students — <span style={{ color: '#0ea5e9' }}>{collegeName || 'Your College'}</span></h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && <>
            <button className="btn btn-outline btn-sm" onClick={() => updateSelected('active')}><UserCheck size={13} /> Activate ({selectedIds.length})</button>
            <button className="btn btn-primary btn-sm" onClick={() => updateSelected('placed')}><CheckSquare size={13} /> Mark placed</button>
          </>}
          <span className="badge badge-blue">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

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
              <th><input type="checkbox" aria-label="Select all filtered students" checked={allFilteredSelected} onChange={toggleAll} /></th>
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
                <td colSpan={8}>
                  <div className="empty-state">
                    <GraduationCap />
                    <p>{query ? 'No students match your search.' : 'No students found.'}</p>
                  </div>
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td><input type="checkbox" aria-label={`Select ${u.name}`} checked={selectedIds.includes(u.id)} onChange={() => toggleOne(u.id)} /></td>
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

