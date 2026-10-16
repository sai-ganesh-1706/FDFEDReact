import React, { useCallback, useEffect, useState } from 'react';
import CollegeAdminSidebar from './components/Sidebar';
import CATopbar from './components/Topbar';
import CADashboard from './pages/Dashboard';
import Officers from './pages/Officers';
import Students from './pages/Students';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import SignOutModal from './components/SignOutModal';
import Messages from './pages/Messages';
import api, { clearSession } from '../../services/api.js';
import { usePlatformData } from '../../shared/context/PlatformDataContext.jsx';
import { readSavedPage, savePage } from '../../shared/utils/navigationState.js';
import { CheckCircle, XCircle } from 'lucide-react';
import './styles/CollegeAdmin.css';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'CA';
}

function getTitle(tab) {
  switch (tab) {
    case 'dashboard':     return 'College Dashboard';
    case 'officers':      return 'Placement Officers';
    case 'students':      return 'Students';
    case 'announcements': return 'Announcements';
    case 'messages':      return 'Messages';
    case 'reports':       return 'Placement Reports';
    case 'profile':       return 'My Profile';
    default:              return 'College Admin';
  }
}

const COLLEGE_ADMIN_TABS = ['dashboard', 'officers', 'students', 'announcements', 'messages', 'reports', 'profile'];
const COLLEGE_ADMIN_TAB_KEY = 'cn_active_college_admin_tab';

export default function CollegeAdminApp() {
  const platform = usePlatformData();
  const { data }  = platform;
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('loggedInUser');
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const userName = user.name || localStorage.getItem('userName') || 'College Admin';

  const [activeTab, setActiveTabState] = useState(() => readSavedPage(COLLEGE_ADMIN_TAB_KEY, 'dashboard', COLLEGE_ADMIN_TABS));
  const [toast, setToast]         = useState(null);
  const [unread, setUnread]       = useState(0);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // Messages from the super admin: badge = how many arrived since the admin last opened the inbox.
  const seenKey = `ca_messages_seen_${Number(user.collegeId) || 1}`;
  useEffect(() => {
    const check = () => api.get('/super-admin/inbox').then(({ data }) => {
      const seen = Number(localStorage.getItem(seenKey) || 0);
      setUnread(data.filter((m) => new Date(m.sentAt).getTime() > seen).length);
    }).catch(() => {});
    check();
    const timer = setInterval(check, 20000);
    return () => clearInterval(timer);
  }, [seenKey]);
  const markMessagesSeen = () => { localStorage.setItem(seenKey, String(Date.now())); setUnread(0); };

  const collegeId   = Number(user.collegeId) || 1;
  const collegeInfo = data.colleges.find(c => c.id === collegeId) || data.colleges[0] || { name: '' };
  const officers    = data.officersByCollege[collegeId]   || [];
  const students    = data.studentsByCollege[collegeId]   || [];
  const alumniCount = (data.alumniByCollege[collegeId]    || []).length;
  const recruiterCount = (data.recruitersByCollege[collegeId] || []).length;
  const applications = data.applicationsByCollege?.[collegeId] || [];
  const placedStudentIds = new Set(
    applications
      .filter((application) => ['offered', 'offer'].includes(String(application.status).toLowerCase()))
      .map((application) => application.candidateId)
  );
  // Preserve legacy user-level placement records while the application status
  // remains the source of truth for all current placement activity.
  const placedCount = students.filter(
    (student) => placedStudentIds.has(student.id) || student.status === 'placed'
  ).length;

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const setActiveTab = useCallback((tab) => {
    const nextTab = COLLEGE_ADMIN_TABS.includes(tab) ? tab : 'dashboard';
    savePage(COLLEGE_ADMIN_TAB_KEY, nextTab);
    setActiveTabState(nextTab);
  }, []);

  const handleSignOut = () => setIsSignOutOpen(true);
  const confirmSignOut = () => {
    clearSession();
    window.location.replace('/login');
  };

  const sharedProps = {
    officers, students, platform, alumniCount, recruiterCount, applications,
    placedCount, placedStudentIds,
    collegeName: collegeInfo.name,
    showToast,
    setActiveTab,
    userName,
  };

  return (
    <div className="cn-college-admin" style={{ display: 'contents' }}>
      <div className="app-container">
        {/* Sidebar */}
        <CollegeAdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
            onProfileClick={() => setActiveTab('profile')}
            onSignOutClick={handleSignOut}
          />

          <div className="page-content">
            {activeTab === 'dashboard'     && <CADashboard     {...sharedProps} />}
            {activeTab === 'officers'      && <Officers        {...sharedProps} />}
            {activeTab === 'students'      && <Students        {...sharedProps} />}
            {activeTab === 'announcements' && <Announcements   collegeName={collegeInfo.name} />}
            {activeTab === 'messages'      && <Messages        onSeen={markMessagesSeen} />}
            {activeTab === 'reports'       && <Reports         students={students} collegeName={collegeInfo.name} placedStudentIds={placedStudentIds} />}
            {activeTab === 'profile'       && <Profile collegeName={collegeInfo.name} showToast={showToast} onProfileUpdated={setUser} />}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}
        <SignOutModal
          isOpen={isSignOutOpen}
          onClose={() => setIsSignOutOpen(false)}
          onConfirm={confirmSignOut}
        />
      </div>
    </div>
  );
}
