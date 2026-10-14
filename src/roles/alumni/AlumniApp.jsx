import { useEffect, useState } from 'react';
import api, { clearSession, errorMessage, readSession } from '../../services/api.js';
import Sidebar from './components/Sidebar';
import AlumniNotifications from './components/AlumniNotifications';
import SignOutModal from './components/SignOutModal';
import AlumniDashboard from './pages/AlumniDashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import AlumniProfile from './pages/AlumniProfile';
import AlumniEvents from './pages/AlumniEvents';
import ReferralRequests from './pages/ReferralRequests';
import './styles/Alumni.css';

const PAGES = {
  dashboard: AlumniDashboard,
  directory: AlumniDirectory,
  profile: AlumniProfile,
  events: AlumniEvents,
  referrals: ReferralRequests,
};

const initialsOf = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const toReferral = (r) => {
  const status = String(r.status).toLowerCase();
  return {
    id: r.id,
    initials: r.candidateInitials || initialsOf(r.candidateName),
    name: r.candidateName,
    status: status === 'rejected' ? 'declined' : status,
    department: r.department || '',
    cgpa: r.cgpa ?? '',
    batch: '',
    role: r.appliedRole,
    company: r.appliedCompany,
    salary: '',
    location: '',
    skills: r.skills || [],
    message: r.userMessage,
    alumniNote: r.alumniResponse,
    updatedAt: r.requestedDate ? new Date(r.requestedDate).getTime() : Date.now(),
  };
};

const emptyProfile = (session) => ({
  initials: initialsOf(session?.name),
  name: session?.name || '',
  email: session?.email || '',
  company: '',
  batch: '',
  role: 'Alumni',
  totalReferrals: 0,
  approved: 0,
});

export default function AlumniApp() {
  const session = readSession();
  const [activePage, setActivePage] = useState('dashboard');
  const [pageProps, setPageProps] = useState({});
  const [alumniData, setAlumniData] = useState(() => emptyProfile(session));
  const [referrals, setReferrals] = useState([]);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // ---- Lifted profile state (persists across page navigation) ----
  const [personalInfo, setPersonalInfo] = useState({
    name: '', email: '', company: '', batch: '', role: '', location: '', linkedin: '', github: '', portfolio: '',
  });
  const [skillsList, setSkillsList] = useState([]);

  const loadReferrals = async () => {
    const { data } = await api.get('/referrals');
    setReferrals(data.map(toReferral));
    return data;
  };

  useEffect(() => {
    Promise.all([api.get(`/users/${session.id}`), loadReferrals()])
      .then(([{ data: user }, refs]) => {
        setAlumniData({
          initials: user.avatar || initialsOf(user.name),
          name: user.name,
          email: user.email,
          company: user.company || '',
          batch: user.batch || '',
          role: 'Alumni',
          totalReferrals: refs.length,
          approved: refs.filter((r) => String(r.status).toLowerCase() === 'approved').length,
        });
        setPersonalInfo({
          name: user.name, email: user.email, company: user.company || '', batch: String(user.batch || ''),
          role: user.headline || '', location: user.location || '',
          linkedin: user.socialLinks?.linkedin || '', github: user.socialLinks?.github || '',
          portfolio: user.socialLinks?.portfolio || '',
        });
        setSkillsList(user.skills || []);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSavePersonalInfo = async (info) => {
    try {
      await api.put(`/users/${session.id}`, {
        name: info.name || undefined,
        company: info.company || undefined,
        headline: info.role || undefined,
        location: info.location || undefined,
        socialLinks: { linkedin: info.linkedin, github: info.github, portfolio: info.portfolio },
      });
      setPersonalInfo(info);
      if (info.name) {
        setAlumniData((prev) => ({ ...prev, name: info.name, initials: initialsOf(info.name), company: info.company || prev.company }));
        localStorage.setItem('loggedInUser', JSON.stringify({ ...session, name: info.name }));
      }
    } catch (error) {
      window.alert(errorMessage(error, 'Could not save your profile.'));
    }
  };

  const handleSetSkills = async (nextSkills) => {
    const value = typeof nextSkills === 'function' ? nextSkills(skillsList) : nextSkills;
    setSkillsList(value);
    try {
      await api.put(`/users/${session.id}`, { skills: value });
    } catch (error) {
      window.alert(errorMessage(error, 'Could not save your skills.'));
    }
  };

  // Approve or decline a referral request, then refresh from the server
  const handleUpdateReferralStatus = async (id, status, note) => {
    try {
      await api.patch(`/referrals/${id}`, {
        status: status === 'declined' ? 'Rejected' : 'Approved',
        alumniResponse: note || undefined,
      });
      await loadReferrals();
    } catch (error) {
      window.alert(errorMessage(error, 'Could not update the referral request.'));
    }
  };

  // Support both string navigation and object navigation
  const handleNavigate = (page, props = {}) => {
    if (typeof page === 'string') {
      setActivePage(page);
      setPageProps(props || {});
    }
  };

  const ActivePageComponent = PAGES[activePage] || AlumniDashboard;

  return (
    <div className="cn-alumni" style={{ display: 'contents' }}>
    <div className="alumni-app">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSignOut={() => setIsSignOutOpen(true)}
        alumni={alumniData}
      />
      <ActivePageComponent
        alumniData={alumniData}
        referrals={referrals}
        onUpdateReferralStatus={handleUpdateReferralStatus}
        onNavigate={handleNavigate}
        // Lifted profile state passed down to AlumniProfile
        personalInfo={personalInfo}
        onSavePersonalInfo={handleSavePersonalInfo}
        skillsList={skillsList}
        onSetSkillsList={handleSetSkills}
        {...pageProps}
      />
      <AlumniNotifications />
      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => setIsSignOutOpen(false)}
        onConfirm={() => {
          clearSession();
          window.location.href = '/login';
        }}
      />
    </div>
    </div>
  );
}
