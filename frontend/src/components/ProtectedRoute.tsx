import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    allowedRoles 
}) => {
    const { currentUser, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !currentUser) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        // user's role is not authorized for this route, bounce them to home
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};
