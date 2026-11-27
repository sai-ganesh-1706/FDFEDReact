// Data Flow (roles/college-admin/CollegeAdminApp.jsx):
// Backend API -> Redux Thunks/Slices (authSlice, collegeAdminSlice, messagesSlice) -> useSelector(selectSession, selectCollegeAdmin, selectCollegeAdminPlatform, selectCollegeAdminSignOutOpen, selectUnreadCollegeMessages) -> UI render
// User Actions -> dispatch(logoutUser, updateSessionUser, loadCollegeInboxSeenTime, markCollegeInboxSeen, refreshCollegeAdminData, fetchInboxMessages, updateSession, markMessagesSeen) -> Slice reducers/thunks -> Redux state update
import { infoDialog } from '../../shared/components/AppDialog.jsx';
import { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import CollegeAdminSidebar from './components/Sidebar';
import CATopbar from './components/Topbar';
import CADashboard from './pages/Dashboard';
import Officers from './pages/Officers';
import Recruiters from './pages/Recruiters.jsx';
import AccountDirectory from '../../shared/components/AccountDirectory.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import SignOutModal from './components/SignOutModal';
import Messages from './pages/Messages';
import { logoutUser, selectSession, updateSessionUser } from '../../store/slices/authSlice.js';
import {
  
  COLLEGE_ADMIN_TABS,
  closeCollegeAdminSignOut,
  loadCollegeInboxSeenTime,
  markCollegeInboxSeen,
  openCollegeAdminSignOut,
  refreshCollegeAdminData,
  selectCollegeAdmin,
  selectCollegeAdminPlatform,
  selectCollegeAdminSignOutOpen,
  selectUnreadCollegeMessages,
  setCollegeAdminTab,
} from './store/collegeAdminSlice.js';
import { fetchInboxMessages } from '../../store/slices/messagesSlice.js';
import './styles/CollegeAdmin.css';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CA';
}

function getTitle(tab) {
  switch (tab) {
    case 'dashboard':     return 'College Dashboard';
    case 'officers':      return 'Placement Officers';
    case 'students':      return 'Students';
    case 'recruiters':    return 'Recruiters';
    case 'alumni': return 'Alumni';
    case 'activity': return 'Placement Officer Activity';
    case 'announcements': return 'Announcements';
    case 'messages':      return 'Messages';
    case 'reports':       return 'Placement Reports';
    case 'profile':       return 'My Profile';
    default:              return 'College Admin';
  }
}

export default function CollegeAdminApp() {
  const dispatch = useDispatch();
  // Redux data source: collegeAdminSlice (colleges, officers, students, alumni, applications) and authSlice (session).
  // Hydrated on mount via refreshCollegeAdminData() and fetchInboxMessages() thunks.
  const platform = useSelector(selectCollegeAdminPlatform);
  const { data } = platform;
  const user = useSelector(selectSession);
  const confirmSignOut = () => dispatch(logoutUser());
  const updateSession = (u) => dispatch(updateSessionUser({ user: u }));
  const workspace = useSelector(selectCollegeAdmin, shallowEqual);
  const userName = user.name || 'College Admin';

  const activeTab = workspace.activeTab;
  const unread = useSelector(selectUnreadCollegeMessages);
  const isSignOutOpen = useSelector(selectCollegeAdminSignOutOpen);
  const setIsSignOutOpen = (v) => dispatch(v ? openCollegeAdminSignOut() : closeCollegeAdminSignOut());

  useEffect(() => {
    if (user.role === 'college_admin' && user.collegeId != null) {
      dispatch(refreshCollegeAdminData()).catch(() => {});
    }
  }, [dispatch, user.role, user.collegeId]);

  // Messages from the super admin: badge = how many arrived since the admin last opened the inbox.
  useEffect(() => {
    dispatch(loadCollegeInboxSeenTime());
    const check = () => dispatch(fetchInboxMessages()).catch(() => {});
    check();
    const timer = setInterval(check, 20000);
    return () => clearInterval(timer);
  }, [dispatch, user.collegeId]);
  const markMessagesSeen = () => dispatch(markCollegeInboxSeen());

  const collegeId   = Number(user.collegeId) || 1;
  const collegeInfo = data.colleges.find(c => c.id === collegeId) || data.colleges[0] || { name: '' };
  const officers    = data.officersByCollege[collegeId]   || [];
  const students    = data.studentsByCollege[collegeId]   || [];
  const alumniCount = (data.alumniByCollege[collegeId]    || []).length;
  const applications = data.applicationsByCollege?.[collegeId] || [];
  const placedStudentIds = new Set(
    applications
      .filter((application) => ['offered', 'offer'].includes(String(application.status).toLowerCase()) && /full/i.test(application.type))
      .map((application) => application.candidateId)
  );
  // Preserve legacy user-level placement records while the application status
  // remains the source of truth for all current placement activity.
  const placedCount = students.filter(
    (student) => placedStudentIds.has(student.id) || student.status === 'placed'
  ).length;

  const showToast = useCallback((msg) => { infoDialog(msg); }, []);

  const handleSignOut = () => setIsSignOutOpen(true);

  const sharedProps = {
    officers, students, platform, alumniCount, applications,
    placedCount, placedStudentIds,
    collegeName: collegeInfo.name,
    collegeInfo,
    showToast,
    userName,
  };

  return (
    <div className="cn-college-admin" style={{ display: 'contents' }}>
      <div className="app-container">
        {/* Sidebar */}
        <CollegeAdminSidebar
          activeTab={activeTab}
          collegeName={collegeInfo.name}
          onSignOut={handleSignOut}
          unreadMessages={unread}
        />

        {/* Main */}
        <div className="main-content">
          <CATopbar
            title={getTitle(activeTab)}
            userName={userName}
            avatarInitials={getInitials(userName)}
            onProfileClick={() => {
              const nextTab = COLLEGE_ADMIN_TABS.includes('profile') ? 'profile' : 'dashboard';
              dispatch(setCollegeAdminTab(nextTab));
            }}
            onSignOutClick={handleSignOut}
          />

          <div className="page-content">
            {platform.error && (
              <div role="status">
                {platform.error}{' '}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch(refreshCollegeAdminData()).catch(() => {})}>
                  Retry refresh
                </button>
              </div>
            )}
            {activeTab === 'dashboard'     && <CADashboard     {...sharedProps} />}
            {activeTab === 'officers'      && <Officers        {...sharedProps} />}
            {activeTab === 'students' && <AccountDirectory key="students" canCreate initialTab="candidates" showTabs={false} onChanged={() => dispatch(refreshCollegeAdminData())} />}
            {activeTab === 'alumni' && <AccountDirectory key="alumni" canCreate initialTab="alumni" showTabs={false} onChanged={() => dispatch(refreshCollegeAdminData())} />}
            {activeTab === 'recruiters' && <Recruiters />}
            {activeTab === 'activity' && <ActivityLog />}
            {activeTab === 'announcements' && <Announcements   collegeName={collegeInfo.name} />}
            {activeTab === 'messages'      && <Messages        onSeen={markMessagesSeen} />}
            {activeTab === 'reports'       && <Reports         students={students} collegeName={collegeInfo.name} placedStudentIds={placedStudentIds} />}
            {activeTab === 'profile'       && <Profile collegeName={collegeInfo.name} showToast={showToast} onProfileUpdated={updateSession} />}
          </div>
        </div>

        {/* Toast */}

        <SignOutModal
          isOpen={isSignOutOpen}
          onClose={() => setIsSignOutOpen(false)}
          onConfirm={confirmSignOut}
        />
      </div>
    </div>
  );
}
