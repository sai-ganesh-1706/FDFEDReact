// Data Flow (roles/alumni/pages/AlumniDirectory.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice, usersSlice) -> useSelector(selectAlumni, selectAlumniDirectoryUi, selectAlumniSignOutOpen, selectAlumniDirectory) -> UI render
// User Actions -> dispatch(fetchAlumniDirectory) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import SignOutModal from '../components/SignOutModal';
import {
  
  clearDirectoryFilters,
  closeAlumniSignOut,
  openAlumniSignOut,
  selectAlumni,
  selectAlumniDirectoryUi,
  selectAlumniSignOutOpen,
  setAlumniPage,
  setDirectoryBatch,
  setDirectoryDept,
  setDirectoryError,
  setDirectoryLoading,
  setDirectorySearchQuery,
} from '../store/alumniSlice.js';
import { fetchAlumniDirectory, selectAlumniDirectory } from '../../../store/slices/usersSlice.js';
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

const DEPT_CODES = {
  'computer science': 'CSE', electronics: 'ECE', electrical: 'EEE',
  mechanical: 'MECH', civil: 'CIV', it: 'IT', 'data science': 'DS',
};

export default function AlumniDirectory() {
  const dispatch = useDispatch();
  const users = useSelector(selectAlumniDirectory);
  const { alumniData } = useSelector(selectAlumni);
  const { searchQuery, batch, dept, loading, errorMessage } = useSelector(selectAlumniDirectoryUi);
  const isSignOutOpen = useSelector(selectAlumniSignOutOpen);

  useEffect(() => {
    dispatch(setDirectoryLoading(true));
    dispatch(setDirectoryError(''));
    dispatch(fetchAlumniDirectory())
      .unwrap()
      .catch((error) => {
        const message = error.response?.data?.message || error.message || 'Failed to fetch directory';
        dispatch(setDirectoryError(error.response?.status === 403 || String(message).includes('PREMIUM') ? 'PREMIUM_REQUIRED' : String(message)));
      })
      .finally(() => dispatch(setDirectoryLoading(false)));
  }, [dispatch]);

  const query = searchQuery.toLowerCase();
  const alumniList = users.map((user) => ({
    ...user,
    role: user.headline || 'Alumni',
    linkedin: user.socialLinks?.linkedin ?? user.directoryLinkedIn,
    dept: DEPT_CODES[(user.department || '').toLowerCase()] || user.department,
  })).filter((user) =>
    (!batch || String(user.batch) === batch) &&
    (!dept || (user.dept || '').toLowerCase() === dept.toLowerCase()) &&
    (!query || [user.name, user.company, user.location].some((value) => value?.toLowerCase().includes(query)))
  );

  const handleClear = () => {
    dispatch(clearDirectoryFilters());
  };

  return (
    <div className="layout alumni-app-container">
      <Sidebar
        activePage="directory"
        onOpenSignOut={() => dispatch(openAlumniSignOut())}
      />

      <main className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="page-title">Alumni Directory</h1>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="avatar avatar--topbar"
              title="My Profile"
              onClick={() => {
                dispatch(setAlumniPage({ page: 'profile', props: {} }));
              }}
              style={{ cursor: 'pointer', border: 'none', background: undefined }}
            >
              {alumniData?.initials || 'SR'}
            </button>
          </div>
        </header>

        <div className="directory-container">
          <p className="portal-sub">
            Search and connect with alumni by name, company, location, batch, or department.
          </p>

          {/* All-in-one Search Bar */}
          <div className="directory-search-wrapper">
            <svg
              className="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="directory-search-input"
              placeholder="Search by name, company, or location..."
              value={searchQuery}
              onChange={(e) => dispatch(setDirectorySearchQuery(e.target.value))}
            />
            {searchQuery && (
              <button
                type="button"
                className="directory-search-clear"
                onClick={() => dispatch(setDirectorySearchQuery(''))}
                aria-label="Clear search"
              >
                Ã—
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <label htmlFor="batch-filter">Batch Year</label>
              <select
                id="batch-filter"
                className="directory-filter-select"
                value={batch}
                onChange={(e) => dispatch(setDirectoryBatch(e.target.value))}
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
                className="directory-filter-select"
                value={dept}
                onChange={(e) => dispatch(setDirectoryDept(e.target.value))}
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

            {(searchQuery || batch || dept) && (
              <button type="button" className="btn-clear" onClick={handleClear}>
                âœ• Clear All
              </button>
            )}
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
              <div className="empty-state-icon">ðŸ”’</div>
              <div className="empty-state-title">Access Restricted</div>
              <div className="empty-state-desc">
                Alumni Directory is currently restricted. Contact your college admin for access.
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
                      {a.dept && <span className="tag tag-dept">{a.dept}</span>}
                      {a.location && <span className="tag tag-loc">ðŸ“ {a.location}</span>}
                    </div>

                    {a.linkedin && (
                      <a
                        className="connect-btn"
                        href={a.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ðŸ”— View on LinkedIn
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
        onClose={() => dispatch(closeAlumniSignOut())}
      />
    </div>
  );
}
