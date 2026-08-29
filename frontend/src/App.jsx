import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CitizenReportPage from './pages/CitizenReportPage';
import ReportStatusPage from './pages/ReportStatusPage';
import MunicipalDashboardPage from './pages/MunicipalDashboardPage';
import LoginPage from './pages/LoginPage';
import { AuthService } from './services/authService';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = AuthService.getUser();
    if (user && AuthService.isAuthenticated()) {
      setCurrentUser(user);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={currentUser} onLogout={() => setCurrentUser(null)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<CitizenReportPage />} />
            <Route path="/report" element={<CitizenReportPage />} />
            <Route path="/status" element={<ReportStatusPage />} />
            <Route path="/status/:id" element={<ReportStatusPage />} />
            <Route path="/dashboard" element={<MunicipalDashboardPage />} />
            <Route
              path="/login"
              element={<LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}