import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'participant' | 'giver' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // For role-based access, we'd need to fetch user profile from our users table
  // For now, we'll allow access to all authenticated users
  // In a real app, you'd check the user's role from your database

  return <>{children}</>;
};

export default ProtectedRoute;