import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Login from '@/components/auth/Login';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false, userOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedRoute;