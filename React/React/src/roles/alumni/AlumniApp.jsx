// Data Flow (roles/alumni/AlumniApp.jsx):
// Backend API -> Redux Thunks/Slices (alumniSlice, authSlice, referralsSlice, usersSlice) -> useSelector(selectAlumni, selectAlumniSignOutOpen, selectSession) -> UI render
// User Actions -> dispatch(logoutUser, fetchReferrals, fetchUserById, loadError) -> Slice reducers/thunks -> Redux state update
import { useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { errorMessage } from '../../services/api.js';
import {
  closeAlumniSignOut,
  openAlumniSignOut,
  selectAlumni,
  selectAlumniSignOutOpen,
  setAlumniLoadError,
} from './store/alumniSlice.js';
import { logoutUser, selectSession } from '../../store/slices/authSlice.js';
import { fetchReferrals } from '../../store/slices/referralsSlice.js';
import { fetchUserById } from '../../store/slices/usersSlice.js';
import AlumniNotifications from './components/AlumniNotifications';
import Sidebar from './components/Sidebar';
import SignOutModal from './components/SignOutModal';
import AlumniDashboard from './pages/AlumniDashboard';
import AlumniDirectory from './pages/AlumniDirectory';
import AlumniProfile from './pages/AlumniProfile';
import ReferralRequests from './pages/ReferralRequests';
import './styles/Alumni.css';

const PAGES = {
  dashboard: AlumniDashboard,
  directory: AlumniDirectory,
  profile: AlumniProfile,
  referrals: ReferralRequests,
};

export default function AlumniApp() {
  // Redux data source: authSlice (session) and alumniSlice (activePage, pageProps, loadError, signOut modal state).
  // Workspace data is fetched on mount via fetchUserById() (usersSlice) and fetchReferrals() (referralsSlice).
  const session = useSelector(selectSession);
  const dispatch = useDispatch();
  const confirmSignOut = () => dispatch(logoutUser());
  const { activePage, pageProps, loadError } = useSelector(selectAlumni, shallowEqual);
  const isSignOutOpen = useSelector(selectAlumniSignOutOpen);

  useEffect(() => {
    Promise.all([dispatch(fetchUserById(session.id)).unwrap(), dispatch(fetchReferrals()).unwrap()])
      .then(() => dispatch(setAlumniLoadError('')))
      .catch((error) => dispatch(setAlumniLoadError(errorMessage(error, 'Could not load your alumni workspace from the server.'))));
    // Pick up new requests while the alumnus has the portal open.
    const timer = setInterval(() => {
      if (!document.hidden) {
        dispatch(fetchReferrals())
          .unwrap()
          .then(() => dispatch(setAlumniLoadError('')))
          .catch((error) => dispatch(setAlumniLoadError(errorMessage(error, 'Could not refresh referral requests.'))));
      }
    }, 20000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ActivePageComponent = PAGES[activePage] || AlumniDashboard;

  return (
    <div className="cn-alumni" style={{ display: 'contents' }}>
    <div className="alumni-app">
      <Sidebar onOpenSignOut={() => dispatch(openAlumniSignOut())} />
      {loadError && <div role="alert" style={{ margin: '12px 20px', padding: 12, borderRadius: 8, background: '#fef2f2', color: '#b91c1c' }}>{loadError}</div>}
      <ActivePageComponent {...pageProps} />
      <AlumniNotifications />
      <SignOutModal
        isOpen={isSignOutOpen}
        onClose={() => dispatch(closeAlumniSignOut())}
        onConfirm={confirmSignOut}
      />
    </div>
    </div>
  );
}
