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
    const { currentUser, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show a loading indicator while token state is initializing on page refresh
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
};
