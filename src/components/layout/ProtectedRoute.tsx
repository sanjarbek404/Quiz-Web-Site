import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null; // Sahifalar orasida o'tganda ortiqcha loadingni yo'qotish uchun null qaytaramiz
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  const isGoogleUser = currentUser?.providerData.some(p => p.providerId === 'google.com');
  const isAdminEmail = currentUser?.email === 'sanjarbekotabekov010@gmail.com';

  if (!currentUser || !isAdminEmail || !isGoogleUser) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
