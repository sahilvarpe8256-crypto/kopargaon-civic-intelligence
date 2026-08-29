import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CivicNavbar from './components/layout/CivicNavbar';
import CivicFooter from './components/layout/CivicFooter';
import HomePage from './pages/Home/HomePage';
import WasteReportPage from './pages/WasteReport/WasteReportPage';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <CivicNavbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/waste" element={<WasteReportPage />} />
          <Route path="/report/:category" element={<ComingSoonPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <CivicFooter />
    </div>
  );
}