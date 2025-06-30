import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'learner' | 'creator';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 animate-pulse">
            <img 
              src="/photo_2024-12-26_12-17-47.jpg" 
              alt="Loading..." 
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && userProfile.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userProfile.role === 'creator' ? '/creator-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;