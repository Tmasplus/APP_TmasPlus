// En tu archivo PrivateRoute.tsx
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: { auth: { isAuthenticated: boolean } }) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
export default PrivateRoute;  // Asegúrate de usar export default aquí
