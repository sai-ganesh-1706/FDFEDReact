import { Navigate, Route, Routes } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext.jsx';
import { UIProvider } from './context/UIContext.jsx';
import GlobalModals from './components/GlobalModals.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Opportunities from './pages/Opportunities.jsx';
import Applications from './pages/Applications.jsx';
import Profile from './pages/Profile.jsx';
import Referrals from './pages/Referrals.jsx';
import SavedDrives from './pages/SavedDrives.jsx';
import ApplicationTracker from './pages/ApplicationTracker.jsx';
import './styles/style.css';

// Mounted at /candidate/* by the top-level router (src/app/AppRouter.jsx),
// so every path below is relative to "/candidate".
function CandidateRoutes() {
    return (
        <UIProvider>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="opportunities" element={<Opportunities />} />
                    <Route path="saved-drives" element={<SavedDrives />} />
                    <Route path="applications" element={<Applications />} />
                    <Route path="application-tracking" element={<ApplicationTracker />} />
                    <Route path="referrals" element={<Referrals />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="*" element={<Navigate to="/candidate" replace />} />
                </Route>
            </Routes>
            <GlobalModals />
        </UIProvider>
    );
}

export default function CandidateApp() {
    return (
        <div className="cn-candidate" style={{ display: 'contents' }}>
            <StoreProvider>
                <CandidateRoutes />
            </StoreProvider>
        </div>
    );
}
