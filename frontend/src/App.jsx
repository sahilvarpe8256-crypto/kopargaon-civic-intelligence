import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import CivicNavbar from './components/layout/CivicNavbar';
import CivicFooter from './components/layout/CivicFooter';

import HomePage from './pages/Home/HomePage';
import WasteReportPage from './pages/WasteReport/WasteReportPage';
import TrackReportPage from './pages/Track/TrackReportPage';
import MyReportsPage from './pages/MyReports/MyReportsPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';

import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminReportsPage from './pages/Admin/AdminReportsPage';
import AdminReportDetailPage from './pages/Admin/AdminReportDetailPage';
import AdminMapPage from './pages/Admin/AdminMapPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';

import './App.css';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`app-layout ${isAdminRoute ? 'admin-layout-mode' : ''}`}>
      {!isAdminRoute && <CivicNavbar />}
      <main className={`main-content ${isAdminRoute ? 'admin-main-content' : ''}`}>
        <Routes>
          {/* Citizen Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/report/waste" element={<WasteReportPage />} />
          <Route path="/track" element={<TrackReportPage />} />
          <Route path="/track/:reportId" element={<TrackReportPage />} />
          <Route path="/my-reports" element={<MyReportsPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/report/:category" element={<ComingSoonPage />} />

          {/* Municipal Officer Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/reports/:reportId" element={<AdminReportDetailPage />} />
          <Route path="/admin/map" element={<AdminMapPage />} />

          {/* Dedicated 404 Catch-All Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminRoute && <CivicFooter />}
    </div>
  );
}