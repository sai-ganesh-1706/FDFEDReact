import React, { useMemo, useState } from 'react';
import { Search, UserCheck, Sparkles } from 'lucide-react';

/**
 * Screening queue: only candidates who actually applied to this recruiter's
 * opportunities and are still in the "Applied" stage. Pick several and shortlist them in one go.
 */
export default function CandidatesFilter({ applications = [], opportunities = [], onBulkShortlist, onBulkReject }) {
  const [role, setRole] = useState('All Roles');
  const [dept, setDept] = useState('All');
  const [minCgpa, setMinCgpa] = useState('0');
  const [referredOnly, setReferredOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  const queue = useMemo(() => applications.filter((a) => a.status === 'Applied'), [applications]);
  const roles = ['All Roles', ...new Set(queue.map((a) => a.role))];
  const depts = ['All', ...new Set(queue.map((a) => a.branch).filter(Boolean))];

  const filtered = queue.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      (role === 'All Roles' || a.role === role) &&
      (dept === 'All' || a.branch === dept) &&
      Number(a.cgpa) >= parseFloat(minCgpa || 0) &&
      (!referredOnly || a.isReferred) &&
      (!q || a.name.toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || a.role.toLowerCase().includes(q))
    );
  });

  const visibleIds = filtered.map((a) => a.id);
  const chosen = selectedIds.filter((id) => visibleIds.includes(id));
  const allChosen = filtered.length > 0 && chosen.length === filtered.length;

  const toggle = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => setSelectedIds(allChosen ? [] : visibleIds);

  const act = async (fn) => {
    if (chosen.length === 0) return;
    const ok = await fn(chosen);
    if (ok) setSelectedIds([]);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>Candidate Filter</h2>
        <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
          Everyone who applied and is waiting for screening ({queue.length}). Filter them, tick the ones you like and shortlist in bulk.
        </p>
      </div>

      <div className="filter-toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="search-box-wrap" style={{ flex: '1 1 240px' }}>
          <Search size={16} color="#9CA3AF" />
          <input type="text" placeholder="Search by name, email or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Role:</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Dept:</label>
          <select className="form-select" value={dept} onChange={(e) => setDept(e.target.value)}>
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Min CGPA:</label>
          <select className="form-select" value={minCgpa} onChange={(e) => setMinCgpa(e.target.value)}>
            <option value="0">Any</option>
            {['7.0', '7.5', '8.0', '8.5', '9.0'].map((v) => <option key={v} value={v}>{v} +</option>)}
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
          <input type="checkbox" checked={referredOnly} onChange={(e) => setReferredOnly(e.target.checked)} />
          <span>Referred only</span>
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button
            className="btn-secondary-action"
            style={{ whiteSpace: 'nowrap' }}
            disabled={chosen.length === 0}
            onClick={() => act((ids) => onBulkReject(ids))}
          >
            Reject ({chosen.length})
          </button>
          <button
            className="btn-primary-action"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', whiteSpace: 'nowrap' }}
            disabled={chosen.length === 0}
            onClick={() => act((ids) => onBulkShortlist(ids))}
          >
            <UserCheck size={16} />
            <span>Shortlist ({chosen.length})</span>
          </button>
        </div>
      </div>

      <div className="candidates-table-wrap">
        <table className="candidates-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input type="checkbox" checked={allChosen} onChange={toggleAll} style={{ cursor: 'pointer' }} />
              </th>
              <th>Candidate</th>
              <th>Applied for</th>
              <th>Department</th>
              <th>CGPA</th>
              <th>Applied on</th>
              <th>Referral</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const selected = selectedIds.includes(a.id);
              const cgpaClass = a.cgpa >= 8.5 ? 'high' : a.cgpa >= 7.5 ? 'mid' : 'low';
              return (
                <tr key={a.id} style={{ background: selected ? '#F0FDF4' : 'transparent', cursor: 'pointer' }} onClick={() => toggle(a.id)}>
                  <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected} onChange={() => toggle(a.id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td>
                    <strong>{a.name}</strong>
                    <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{a.email}</div>
                  </td>
                  <td>{a.role}</td>
                  <td>{a.branch || '—'}</td>
                  <td><span className={`pill-cgpa ${cgpaClass}`}>{a.cgpa}</span></td>
                  <td>{a.appliedDate}</td>
                  <td>
                    {a.isReferred ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                        <Sparkles size={12} /> {a.referrerName}
                      </span>
                    ) : <span style={{ color: '#9CA3AF' }}>—</span>}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                  {queue.length === 0
                    ? 'No new applications waiting for screening.'
                    : 'No applicants match these filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
