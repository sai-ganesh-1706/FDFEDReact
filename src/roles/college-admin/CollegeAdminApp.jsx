import React, { useState } from 'react';
import CollegeAdminSidebar from './components/Sidebar';
import CATopbar from './components/Topbar';
import CADashboard from './pages/Dashboard';
import Officers from './pages/Officers';
import Students from './pages/Students';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import { clearSession } from '../../services/api.js';
import { usePlatformData } from '../../shared/context/PlatformDataContext.jsx';
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
    case 'reports':       return 'Placement Reports';
    default:              return 'College Admin';
  }
}

export default function CollegeAdminApp() {
  const platform = usePlatformData();
  const { data }  = platform;
  const raw  = localStorage.getItem('loggedInUser');
  const user = raw ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : {};
  const userName = user.name || localStorage.getItem('userName') || 'College Admin';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast]         = useState(null);

  const collegeId   = Number(user.collegeId) || 1;
  const collegeInfo = data.colleges.find(c => c.id === collegeId) || data.colleges[0] || { name: '' };
  const officers    = data.officersByCollege[collegeId]   || [];
  const students    = data.studentsByCollege[collegeId]   || [];
  const alumniCount = (data.alumniByCollege[collegeId]    || []).length;
  const recruiterCount = (data.recruitersByCollege[collegeId] || []).length;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const handleSignOut = () => {
    if (window.confirm('Sign out from College Admin Portal?')) {
      clearSession();
      window.location.href = '/login';
    }
  };

  const sharedProps = {
    officers, students, platform, alumniCount, recruiterCount,
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
        />

        {/* Main */}
        <div className="main-content">
          <CATopbar
            title={getTitle(activeTab)}
            userName={userName}
            avatarInitials={getInitials(userName)}
          />

          <div className="page-content">
            {activeTab === 'dashboard'     && <CADashboard     {...sharedProps} />}
            {activeTab === 'officers'      && <Officers        {...sharedProps} />}
            {activeTab === 'students'      && <Students        {...sharedProps} />}
            {activeTab === 'announcements' && <Announcements   collegeName={collegeInfo.name} />}
            {activeTab === 'reports'       && <Reports         students={students} collegeName={collegeInfo.name} />}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
