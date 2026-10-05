import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import { mockDirectoryAlumni } from '../data/alumniData';
import '../styles/Alumni.css';

const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#ec4899',
];

export default function AlumniDirectory({ alumniData, onNavigate }) {
  const [company, setCompany] = useState('');
  const [batch, setBatch] = useState('');
  const [dept, setDept] = useState('');
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const fetchDirectory = useCallback(async (compParam, batchParam, deptParam) => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Check if FeaturesAPI exists in global or imported context
      if (typeof window !== 'undefined' && window.FeaturesAPI?.alumni?.getDirectory) {
        const data = await window.FeaturesAPI.alumni.getDirectory(
          compParam || undefined,
          batchParam || undefined,
          deptParam || undefined
        );
        setAlumniList(data || []);
      } else {
        // Fallback filter over mockDirectoryAlumni
        let filtered = [...mockDirectoryAlumni];
        if (compParam) {
          filtered = filtered.filter((a) =>
            a.company.toLowerCase().includes(compParam.toLowerCase())
          );
        }
        if (batchParam) {
          filtered = filtered.filter((a) => String(a.batch) === String(batchParam));
        }
        if (deptParam) {
          filtered = filtered.filter((a) => a.dept.toLowerCase() === deptParam.toLowerCase());
        }
        setAlumniList(filtered);
      }
    } catch (err) {
      const msg = err?.message || 'Failed to fetch directory';
      if (msg.includes('PREMIUM') || msg.includes('403')) {
        setErrorMessage('PREMIUM_REQUIRED');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const handleSearch = () => {
    fetchDirectory(company.trim(), batch, dept);
  };

  const handleClear = () => {
    setCompany('');
    setBatch('');
    setDept('');
    fetchDirectory('', '', '');
  };

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="directory"
        onNavigate={onNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumniData}
      />

      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">Alumni Directory</h1>
            <span
              style={{
                background: '#faf5ff',
                color: '#7c3aed',
                border: '1px solid #ddd6fe',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              👑 Premium
            </span>
          </div>
          <div className="topbar-right">
            <div className="avatar avatar--topbar" title="My Profile">
              {alumniData?.initials || 'SR'}
            </div>
          </div>
        </header>

        <div className="directory-container">
          <p className="portal-sub">
            Search and connect with alumni by company, batch, or department.
          </p>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <label htmlFor="company-filter">Company</label>
              <input
                id="company-filter"
                type="text"
                placeholder="e.g. Google, Microsoft"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="batch-filter">Batch Year</label>
              <select
                id="batch-filter"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
              >
                <option value="">All Batches</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="dept-filter">Department</label>
              <select
                id="dept-filter"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                <option value="">All Depts</option>
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <button type="button" className="btn-search" onClick={handleSearch}>
              🔍 Search
            </button>
            <button type="button" className="btn-clear" onClick={handleClear}>
              ✕ Clear
            </button>
          </div>

          {/* Results Meta */}
          {!loading && !errorMessage && (
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {alumniList.length} alumni found
            </div>
          )}

          {/* Directory Content */}
          {loading && (
            <div className="empty-state">
              <div className="empty-state-title">Loading alumni directory...</div>
            </div>
          )}

          {!loading && errorMessage === 'PREMIUM_REQUIRED' && (
            <div className="empty-state">
              <div className="empty-state-icon">👑</div>
              <div className="empty-state-title">Premium Plan Required</div>
              <div className="empty-state-desc">
                Alumni Directory requires the Premium plan. Contact your college admin to upgrade.
              </div>
            </div>
          )}

          {!loading && errorMessage && errorMessage !== 'PREMIUM_REQUIRED' && (
            <div className="empty-state">
              <div className="empty-state-title">Error</div>
              <div className="empty-state-desc">{errorMessage}</div>
            </div>
          )}

          {!loading && !errorMessage && alumniList.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-title">No alumni match the filters</div>
              <div className="empty-state-desc">Try adjusting your search criteria or clear filters.</div>
            </div>
          )}

          {!loading && !errorMessage && alumniList.length > 0 && (
            <div className="directory-grid">
              {alumniList.map((a, idx) => {
                const initials = a.name
                  ? a.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : 'AL';
                const avatarBg = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                return (
                  <div key={a.id || idx} className="alumni-dir-card">
                    <div className="alumni-head">
                      <div
                        className="avatar"
                        style={{ background: avatarBg, color: '#fff', fontWeight: 700 }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>
                          {a.name}
                        </div>
                        <div className="alumni-role">{a.role}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>@ {a.company}</div>
                      </div>
                    </div>

                    <div className="alumni-tags-dir">
                      <span className="tag tag-batch">Batch {a.batch}</span>
                      <span className="tag tag-dept">{a.dept}</span>
                      <span className="tag tag-loc">📍 {a.location}</span>
                    </div>

                    {a.linkedin && (
                      <a
                        className="connect-btn"
                        href={a.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 View on LinkedIn
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
      />
    </div>
  );
}

