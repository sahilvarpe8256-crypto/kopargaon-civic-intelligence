import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../../services/api';

/**
 * Protected Route for Municipal Officer / Admin portal
 */
export function AdminProtectedRoute({ children }) {
  const user = getCurrentUser();
  const location = useLocation();

  // If no user or not an officer/admin role, redirect to admin login
  if (!user || user.role !== 'officer') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Protected Route for authenticated Citizen features
 */
export function CitizenProtectedRoute({ children }) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}
