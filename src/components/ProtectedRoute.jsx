import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, role, requiredRole, children }) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
