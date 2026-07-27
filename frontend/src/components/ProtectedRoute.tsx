import React from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from '../types';

interface ProtectedRouteProps {
    currentUser: User;
    allowedRoles: string[];
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ currentUser, allowedRoles, children }) => {
    if (!allowedRoles.includes(currentUser.role)) {
        // Redirect them to home if they lack permissions
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};
