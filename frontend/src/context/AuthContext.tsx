import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, Role } from '../types';

interface AuthContextType {
    currentUser: User | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
    sub: string;
    role: string;
    org: string;
    fullName?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const initUserFromToken = (token: string) => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            // The role claim in spring security typically has a 'ROLE_' prefix if using standard methods,
            // but PRD specified roles are strictly EMPLOYEE, MANAGER, ADMIN in the DB.
            const rawRole = decoded.role?.replace('ROLE_', '');
            
            setCurrentUser({
                id: decoded.sub,
                email: decoded.sub, // Typically sub is email or username
                fullName: decoded.fullName || decoded.sub,
                role: rawRole as Role,
                orgId: decoded.org || 'default-org',
            });
        } catch (error) {
            console.error("Failed to decode token", error);
            logout();
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            initUserFromToken(token);
        }
    }, []);

    const login = (accessToken: string, refreshToken: string) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        initUserFromToken(accessToken);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
