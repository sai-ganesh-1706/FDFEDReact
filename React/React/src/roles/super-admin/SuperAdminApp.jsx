import React, { useCallback, useState } from 'react';
import SuperAdminSidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import SADashboard from './pages/Dashboard';
import Colleges from './pages/Colleges';
import CollegeAdmins from './pages/CollegeAdmins';
import ActivityLog from './pages/ActivityLog';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import SignOutModal from './components/SignOutModal';
import { clearSession } from '../../services/api.js';
import { usePlatformData } from '../../shared/context/PlatformDataContext.jsx';
import { readSavedPage, savePage } from '../../shared/utils/navigationState.js';
import { CheckCircle, XCircle } from 'lucide-react';
import './styles/SuperAdmin.css';

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'SA';
}

function getTitle(tab) {
  switch (tab) {
    case 'dashboard':      return 'Platform Dashboard';
    case 'colleges':       return 'Colleges';
    case 'college-admins': return 'College Admin Management';
    case 'activity':       return 'Activity Log';
    case 'messages':       return 'Messages';
    case 'profile':        return 'My Profile';
    default:               return 'Super Admin';
  }
}

const SUPER_ADMIN_TABS = ['dashboard', 'colleges', 'college-admins', 'activity', 'messages', 'profile'];
const SUPER_ADMIN_TAB_KEY = 'cn_active_super_admin_tab';

export default function SuperAdminApp() {
  const platform = usePlatformData();
  const { data, stats } = platform;
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('loggedInUser');
    try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
  });
  const userName = user.name || localStorage.getItem('userName') || 'Super Admin';

  const [activeTab, setActiveTab] = useState(() => readSavedPage(SUPER_ADMIN_TAB_KEY, 'dashboard', SUPER_ADMIN_TABS));
  const [adminCollegeId, setAdminCollegeId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const handleSignOut = () => setIsSignOutOpen(true);
  const confirmSignOut = () => {
    clearSession();
    window.location.replace('/login');
  };

  const handleTabChange = (tab) => {
    const nextTab = SUPER_ADMIN_TABS.includes(tab) ? tab : 'dashboard';
    savePage(SUPER_ADMIN_TAB_KEY, nextTab);
    setActiveTab(nextTab);
    if (nextTab !== 'college-admins') setAdminCollegeId(null);
  };

  const pageProps = {
    colleges: data.colleges,
    stats,
    platform,
    showToast, setActiveTab: handleTabChange,
    adminCollegeId, setAdminCollegeId,
  };

  return (
    <div className="cn-super-admin" style={{ display: 'contents' }}>
      <div className="app-container">
        {/* Sidebar */}
        <SuperAdminSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSignOut={handleSignOut}
        />

        {/* Main */}
        <div className="main-content">
          <Topbar
            title={getTitle(activeTab)}
            userName={userName}
            avatarInitials={getInitials(userName)}
            onProfileClick={() => handleTabChange('profile')}
            onSignOutClick={handleSignOut}
          />

          <div className="page-content">
            {activeTab === 'dashboard'      && <SADashboard {...pageProps} data={data} userName={userName} avatarInitials={getInitials(userName)} />}
            {activeTab === 'colleges'       && <Colleges     {...pageProps} />}
            {activeTab === 'college-admins' && <CollegeAdmins {...pageProps} />}
            {activeTab === 'activity'       && <ActivityLog />}
            {activeTab === 'messages'       && <Messages colleges={data.colleges} />}
            {activeTab === 'profile'        && <Profile showToast={showToast} onProfileUpdated={setUser} />}
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
