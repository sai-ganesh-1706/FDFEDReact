import { useEffect, useState } from 'react';
import api, { clearSession, errorMessage, readSession } from '../../services/api.js';
import Sidebar from './components/Sidebar';
import AlumniNotifications from './components/AlumniNotifications';
import SignOutModal from './components/SignOutModal';
import AlumniDashboard from './pages/AlumniDashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import AlumniProfile from './pages/AlumniProfile';
import ReferralRequests from './pages/ReferralRequests';
import { readSavedPage, savePage } from '../../shared/utils/navigationState.js';
import './styles/Alumni.css';

const PAGES = {
  dashboard: AlumniDashboard,
  directory: AlumniDirectory,
  profile: AlumniProfile,
  referrals: ReferralRequests,
};
const ALUMNI_PAGE_KEY = 'cn_active_alumni_page';

const initialsOf = (name = '') => name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const toReferral = (r) => {
  const raw = String(r.status || 'pending').toLowerCase();
  const status = raw === 'rejected' ? 'declined' : raw;
  return {
    id: r.id,
    initials: r.candidateInitials || r.initials || initialsOf(r.candidateName || r.name),
    name: r.candidateName || r.name,
    status,
    department: r.department || '',
    cgpa: r.cgpa ?? '',
    batch: r.batch || '',
    role: r.appliedRole || r.role,
    company: r.appliedCompany || r.company,
    salary: r.salary || '',
    location: r.location || '',
    skills: r.skills || [],
    message: r.userMessage || r.message,
    alumniNote: r.alumniResponse || r.alumniNote,
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
  const [activePage, setActivePage] = useState(() => readSavedPage(ALUMNI_PAGE_KEY, 'dashboard', Object.keys(PAGES)));
  const [pageProps, setPageProps] = useState({});
  const [alumniData, setAlumniData] = useState(() => emptyProfile(session));
  const [referrals, setReferrals] = useState([]);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // ---- Lifted profile state (persists across page navigation) ----
  const [personalInfo, setPersonalInfo] = useState({
    name: '', email: '', company: '', batch: '', role: '', location: '', linkedin: '', github: '', portfolio: '',
  });
  const [skillsList, setSkillsList] = useState([]);

  // Referral requests come straight from the server (the candidate's request, our reply) — no local copies.
  const loadReferrals = async () => {
    const { data } = await api.get('/referrals');
    const final = data.map(toReferral);
    setReferrals(final);
    return final;
  };

  useEffect(() => {
    Promise.all([api.get(`/users/${session.id}`).catch(() => ({ data: session || {} })), loadReferrals().catch(() => [])])
      .then(([{ data: user }, refs]) => {
        setAlumniData({
          initials: user?.avatar || initialsOf(user?.name),
          name: user?.name || '',
          email: user?.email || '',
          company: user?.company || '',
          batch: user?.batch || '',
          role: 'Alumni',
          totalReferrals: refs.length,
          approved: refs.filter((r) => String(r.status).toLowerCase() === 'approved').length,
        });
        setPersonalInfo({
          name: user?.name || '',
          email: user?.email || '',
          company: user?.company || '',
          batch: String(user?.batch || ''),
          role: user?.headline || '',
          location: user?.location || '',
          linkedin: user?.socialLinks?.linkedin || '',
          github: user?.socialLinks?.github || '',
          portfolio: user?.socialLinks?.portfolio || '',
        });
        setSkillsList(user?.skills || []);
      })
      .catch(() => {});
    // Pick up new requests while the alumnus has the portal open.
    const timer = setInterval(() => { if (!document.hidden) loadReferrals().catch(() => {}); }, 20000);
    return () => clearInterval(timer);
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
      setAlumniData((prev) => ({
        ...prev,
        name: info.name || prev.name,
        initials: initialsOf(info.name || prev.name),
        company: info.company || prev.company,
      }));
      // Keep the session copy in sync so other open tabs immediately reflect
      // profile changes as well.
      localStorage.setItem('loggedInUser', JSON.stringify({
        ...session,
        name: info.name || session?.name,
        company: info.company || session?.company,
      }));
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

  // Approve or decline a referral request. The candidate sees the decision and the note straight away.
  const handleUpdateReferralStatus = async (id, status, note) => {
    try {
      await api.patch(`/referrals/${id}`, {
        status: status === 'declined' ? 'Rejected' : 'Approved',
        alumniResponse: note || undefined,
      });
      const fresh = await loadReferrals();
      setAlumniData((prev) => ({ ...prev, totalReferrals: fresh.length, approved: fresh.filter((r) => r.status === 'approved').length }));
    } catch (error) {
      window.alert(errorMessage(error, 'Could not save your response. Please try again.'));
    }
  };

  // Support both string navigation and object navigation
  const handleNavigate = (page, props = {}) => {
    if (typeof page === 'string') {
      const nextPage = Object.hasOwn(PAGES, page) ? page : 'dashboard';
      savePage(ALUMNI_PAGE_KEY, nextPage);
      setActivePage(nextPage);
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
          window.location.replace('/login');
        }}
      />
    </div>
    </div>
  );
}
