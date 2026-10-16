import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext.jsx';
import { PlatformDataProvider } from '../shared/context/PlatformDataContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import LandingPage from '../public-pages/landing/LandingPage.jsx';
import LoginPage from '../public-pages/login/LoginPage.jsx';
const CandidateApp = lazy(() => import('../roles/candidate/CandidateApp.jsx'));
const AlumniApp = lazy(() => import('../roles/alumni/AlumniApp.jsx'));
const RecruiterApp = lazy(() => import('../roles/recruiter/RecruiterApp.jsx'));
const PlacementApp = lazy(() => import('../roles/placement-officer/PlacementApp.jsx'));
const CollegeAdminApp = lazy(() => import('../roles/college-admin/CollegeAdminApp.jsx'));
const SuperAdminApp = lazy(() => import('../roles/super-admin/SuperAdminApp.jsx'));

const secured = (role, App) => (
  <ProtectedRoute allowedRole={role}>
    <Suspense fallback={<main className="route-loading">Loading workspace…</main>}><App /></Suspense>
  </ProtectedRoute>
);

export default function AppRouter() {
  return (
    <AuthProvider>
      <PlatformDataProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/candidate/*" element={secured('candidate', CandidateApp)} />
          <Route path="/alumni/*" element={secured('alumni', AlumniApp)} />
          <Route path="/recruiter/*" element={secured('recruiter', RecruiterApp)} />
          <Route path="/placement/*" element={secured('placement_officer', PlacementApp)} />
          <Route path="/college-admin/*" element={secured('college_admin', CollegeAdminApp)} />
          <Route path="/super-admin/*" element={secured('super_admin', SuperAdminApp)} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </PlatformDataProvider>
    </AuthProvider>
  );
}
