import React, { useCallback, useState } from 'react';
import './components/styles/p1.css';
import './components/styles/layout-fixes.css';
import Dashboard from './components/Dashboard';
import ReviewOpportunities from './components/ReviewOpportunities';
import Statistics from './components/Statistics';
import Recruiters from './components/Recruiters';
import UserOversight from './components/UserOversight';
import AppTracking from './components/AppTracking';
import BulkNotify from './components/BulkNotify';
import Profile from './components/Profile';
import { readSavedPage, savePage } from '../../shared/utils/navigationState.js';

const PLACEMENT_PAGES = ['p1', 'dashboard', 'p2', 'review', 'p3', 'statistics', 'placement-dashboard', 'dept-report', 'p4', 'recruiters', 'p5', 'oversight', 'p6', 'tracking', 'bulk-notify', 'profile'];
const PLACEMENT_PAGE_KEY = 'cn_active_placement_page';

export default function PlacementApp() {
  const [currentPage, setCurrentPage] = useState(() => readSavedPage(PLACEMENT_PAGE_KEY, 'p1', PLACEMENT_PAGES));
  const navigateTo = useCallback((page) => {
    const nextPage = PLACEMENT_PAGES.includes(page) ? page : 'p1';
    savePage(PLACEMENT_PAGE_KEY, nextPage);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'p1':
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} activePage="p1" />;
      case 'p2':
      case 'review':
        return <ReviewOpportunities onNavigate={navigateTo} activePage="p2" />;
      case 'p3':
      case 'statistics':
      // Formerly separate "Placement Drives" and "Department Report" pages are
      // now consolidated here under the unified Statistics page.
      case 'placement-dashboard':
      case 'dept-report':
        return <Statistics onNavigate={navigateTo} activePage="p3" />;
      case 'p4':
      case 'recruiters':
        return <Recruiters onNavigate={navigateTo} activePage="p4" />;
      case 'p5':
      case 'oversight':
        return <UserOversight onNavigate={navigateTo} activePage="p5" />;
      case 'p6':
      case 'tracking':
        return <AppTracking onNavigate={navigateTo} activePage="p6" />;
      case 'bulk-notify':
        return <BulkNotify onNavigate={navigateTo} activePage="bulk-notify" />;
      case 'profile':
        return <Profile onNavigate={navigateTo} activePage="profile" />;
      default:
        return <Dashboard onNavigate={navigateTo} activePage="p1" />;
    }
  };

  return (
    <div className="cn-placement" style={{ display: 'contents' }}>
      <div className="app-container">
        {renderCurrentPage()}
      </div>
    </div>
  );
}
