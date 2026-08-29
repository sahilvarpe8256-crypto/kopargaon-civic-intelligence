import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CivicNavbar from './components/layout/CivicNavbar';
import CivicFooter from './components/layout/CivicFooter';
import HomePage from './pages/Home/HomePage';
import WasteReportPage from './pages/WasteReport/WasteReportPage';
import TrackReportPage from './pages/Track/TrackReportPage';
import MyReportsPage from './pages/MyReports/MyReportsPage';
import AdminLoginPage from './pages/Admin/AdminLoginPage';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminReportsPage from './pages/Admin/AdminReportsPage';
import AdminReportDetailPage from './pages/Admin/AdminReportDetailPage';
import AdminMapPage from './pages/Admin/AdminMapPage';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <CivicNavbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report/waste" element={<WasteReportPage />} />
            <Route path="/track" element={<TrackReportPage />} />
            <Route path="/track/:reportId" element={<TrackReportPage />} />
            <Route path="/my-reports" element={<MyReportsPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/reports/:reportId" element={<AdminReportDetailPage />} />
            <Route path="/admin/map" element={<AdminMapPage />} />
            <Route path="/report/:category" element={<ComingSoonPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <CivicFooter />
      </div>
    </BrowserRouter>
  );
}