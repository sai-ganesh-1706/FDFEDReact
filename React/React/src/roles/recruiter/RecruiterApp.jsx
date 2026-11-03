import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PostOpportunity from './components/PostOpportunity';
import MyOpportunities from './components/MyOpportunities';
import Applications from './components/Applications';
import Assessments from './components/Assessments';
import CandidatesFilter from './components/CandidatesFilter';
import HiringReport from './components/HiringReport';
import Profile from './components/Profile';
import SignOutModal from './components/SignOutModal';
import api, { clearSession, errorMessage, readSession } from '../../services/api.js';
import { fetchRecruiterData, fromOpportunity } from './data/api.js';
import { infoDialog } from '../../shared/components/AppDialog.jsx';
import { readSavedPage, savePage } from '../../shared/utils/navigationState.js';
import './styles/Recruiter.css';

const initialsOf = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'RC';
const RECRUITER_TABS = ['dashboard', 'post', 'opportunities', 'applications', 'assessments', 'candidates', 'reports', 'profile'];
const RECRUITER_TAB_KEY = 'cn_active_recruiter_tab';

export default function RecruiterApp() {
  // Navigation State
  const [activeTab, setActiveTabState] = useState(() => readSavedPage(RECRUITER_TAB_KEY, 'dashboard', RECRUITER_TABS));
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [scheduleFor, setScheduleFor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const setActiveTab = useCallback((tab) => {
    const nextTab = RECRUITER_TABS.includes(tab) ? tab : 'dashboard';
    savePage(RECRUITER_TAB_KEY, nextTab);
    setActiveTabState(nextTab);
  }, []);

  // 1. Recruiter profile (the logged-in user, kept in sync with the API)
  const [recruiter, setRecruiter] = useState(() => {
    const parsed = readSession() || {};
    return {
      name: parsed.name || '',
      role: parsed.headline || 'Recruiter',
      email: parsed.email || '',
      avatar: parsed.avatar || initialsOf(parsed.name),
      company: parsed.company || '',
      department: parsed.department || '',
      phone: parsed.phone || '',
      location: parsed.location || '',
      joinedDate: parsed.joinedDate || '',
    };
  });

  // 2-5. Opportunities, applications, assessments and the candidate pool come from the API.
  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assessments, setAssessments] = useState([]);

  const reloadVersion = useRef(0);
  const reload = async () => {
    const version = ++reloadVersion.current;
    const data = await fetchRecruiterData();
    if (version !== reloadVersion.current) return;
    setOpportunities(data.opportunities);
    setApplications(data.applications);
    setAssessments(data.assessments);
    setNotifications(data.notifications);
  };

  useEffect(() => {
    const session = readSession();
    reload().catch((error) => showToast(errorMessage(error, 'Could not load your data.')));
    if (session) {
      api.get(`/users/${session.id}`).then(({ data: user }) => {
        setRecruiter((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
          role: user.headline || 'Recruiter',
          avatar: user.avatar || initialsOf(user.name),
          company: user.company || '',
          department: user.department || '',
          phone: user.phone || '',
          location: user.location || '',
          joinedDate: user.joinedDate || prev.joinedDate,
        }));
      }).catch(() => {});
    }
    // New applications and updates arrive while the recruiter is on the page.
    const timer = setInterval(() => { if (!document.hidden) reload().catch(() => {}); }, 20000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Applicant counts per opportunity, from the live applications
  const opportunitiesWithCount = useMemo(() => {
    return opportunities.map(opp => ({
      ...opp,
      applications: applications.filter(a => a.opportunityId === opp.id).length
    }));
  }, [opportunities, applications]);

  // Toast Helper
  const showToast = (msg) => {
    infoDialog(msg);
  };

  // Action Handlers ΓÇö each one writes to the API and then refreshes from it.
  const run = async (action, successMessage, failureMessage) => {
    try {
      const result = await action();
      await reload();
      if (successMessage) showToast(successMessage);
      return result ?? true;
    } catch (error) {
      showToast(errorMessage(error, failureMessage));
      return false;
    }
  };

  const handleAddOpportunity = async (newOpportunity) => {
    const created = await run(
      () => api.post('/opportunities', fromOpportunity(newOpportunity, {
        company: recruiter.company || newOpportunity.company || 'Company',
        submittedBy: recruiter.name,
      })),
      `Opportunity "${newOpportunity.title}" submitted for placement cell approval.`,
      'Could not post the opportunity.'
    );
    if (created) setActiveTab('opportunities');
  };

  const handleUpdateOpportunity = (updatedOpp) => run(
    () => api.put(`/opportunities/${updatedOpp.id}`, ['published', 'closed'].includes(updatedOpp.status.toLowerCase()) ? { cgpa: Number(updatedOpp.cgpa) } : fromOpportunity(updatedOpp)),
    `Opportunity "${updatedOpp.title}" updated successfully!`,
    'Could not update the opportunity.'
  );

  const handleDeleteOpportunity = (id) => run(
    () => api.delete(`/opportunities/${id}`),
    'Opportunity removed successfully.',
    'Could not remove the opportunity.'
  );

  const handleUpdateApplicationStatus = (id, update) => run(
    () => api.patch(`/applications/${id}/status`, typeof update === 'string' ? { status: update } : update),
    typeof update === 'string' ? `Application updated to "${update}"` : 'Feedback sent to candidate.',
    'Could not update the application.'
  );

  const handleAddAssessment = (payload) => run(
    () => api.post('/assessments', payload),
    `Assessment "${payload.title}" scheduled. The candidate can access the link now.`,
    'Could not schedule the assessment.'
  );

  const handleDeleteAssessment = (id) => run(
    () => api.delete(`/assessments/${id}`),
    'Assessment round removed.',
    'Could not remove the assessment.'
  );

  const bulkMove = (status, label) => async (applicationIds) => {
    const done = await run(
      () => api.post('/applications/bulk-status', { applicationIds, status }),
      `${applicationIds.length} application(s) ${label}.`,
      `Could not update the selected applications.`
    );
    return !!done;
  };
  const handleBulkShortlist = bulkMove('Shortlisted', 'shortlisted');

  const openScheduleFor = (applicationId) => {
    setScheduleFor(applicationId);
    setActiveTab('assessments');
  };

  const handleUpdateProfile = async (updatedData) => {
    const session = readSession();
    try {
      const { data: user } = await api.put(`/users/${session.id}`, {
        name: updatedData.name,
        phone: updatedData.phone,
        location: updatedData.location,
        department: updatedData.department,
        company: updatedData.company,
        headline: updatedData.role,
      });
      setRecruiter((prev) => ({ ...prev, ...updatedData, avatar: user.avatar || initialsOf(user.name) }));
      localStorage.setItem('loggedInUser', JSON.stringify({ ...session, name: user.name, company: user.company }));
      showToast('Profile information saved successfully!');
      return true;
    } catch (error) {
      showToast(errorMessage(error, 'Could not save your profile.'));
      return false;
    }
  };

  const handleSignOut = () => setIsSignOutOpen(true);
  const confirmSignOut = () => {
    clearSession();
    window.location.replace('/login');
  };

  // Determine current page title
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'post': return 'Post New Opportunity';
      case 'opportunities': return 'My Opportunities';
      case 'applications': return 'Applications & Pipeline';
      case 'assessments': return 'Assessments & Interviews';
      case 'candidates': return 'Candidate Filter';
      case 'reports': return 'Recruitment Reports';
      case 'profile': return 'My Recruiter Profile';
      default: return 'Recruiter Portal';
    }
  };

  return (
    <div className="cn-recruiter" style={{ display: 'contents' }}>
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        recruiter={recruiter}
        onSignOut={handleSignOut}
      />

      {/* MAIN VIEW AREA */}
      <main className="main-content">
        <Navbar 
          title={getPageTitle()} 
          recruiter={recruiter}
          setActiveTab={setActiveTab}
          onSignOut={handleSignOut}
          notifications={notifications}
          onMarkAllRead={async () => {
            setNotifications((list) => list.map((n) => ({ ...n, isRead: true })));
            await api.patch('/notifications/read-all').catch(() => {});
          }}
        />

        {activeTab === 'dashboard' && (
          <Dashboard 
            recruiter={recruiter}
            opportunities={opportunitiesWithCount}
            applications={applications}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'post' && (
          <PostOpportunity 
            onAddOpportunity={handleAddOpportunity}
            existingOpportunities={opportunities}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'opportunities' && (
          <MyOpportunities 
            opportunities={opportunitiesWithCount}
            onUpdateOpportunity={handleUpdateOpportunity}
            onDeleteOpportunity={handleDeleteOpportunity}
            setActiveTab={setActiveTab}
            setSelectedRoleFilter={setSelectedRoleFilter}
          />
        )}

        {activeTab === 'applications' && (
          <Applications 
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            selectedRoleFilter={selectedRoleFilter}
            setSelectedRoleFilter={setSelectedRoleFilter}
            onSchedule={openScheduleFor}
          />
        )}

        {activeTab === 'assessments' && (
          <Assessments 
            assessments={assessments}
            opportunities={opportunitiesWithCount}
            applications={applications}
            onAddAssessment={handleAddAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            preselectApplicationId={scheduleFor}
            onModalClosed={() => setScheduleFor(null)}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesFilter 
            applications={applications}
            opportunities={opportunitiesWithCount}
            onBulkShortlist={handleBulkShortlist}
            onUpdateStatus={handleUpdateApplicationStatus}
          />
        )}

        {activeTab === 'reports' && (
          <HiringReport 
            applications={applications}
            opportunities={opportunitiesWithCount}
          />
        )}

        {activeTab === 'profile' && (
          <Profile 
            recruiter={recruiter}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </main>

      {/* TOAST NOTIFICATION */}

      <SignOutModal isOpen={isSignOutOpen} onClose={() => setIsSignOutOpen(false)} onConfirm={confirmSignOut} />
    </div>
    </div>
  );
}
