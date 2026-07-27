import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, Role } from '../types';

interface AuthContextType {
    currentUser: User | null;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
    sub: string;
    role: string;
    org: string;
    fullName?: string;
    email?: string;
    exp?: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const initUserFromToken = (token: string): boolean => {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            
            // Check if token is expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                console.warn("Access token is expired on initial load");
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    logout();
                    return false;
                }
            }

            const rawRole = decoded.role?.replace('ROLE_', '');
            
            setCurrentUser({
                id: decoded.sub,
                email: decoded.email || decoded.sub,
                fullName: decoded.fullName || decoded.email || decoded.sub,
                role: rawRole as Role,
                orgId: decoded.org || 'default-org',
            });
            return true;
        } catch (error) {
            console.error("Failed to decode token", error);
            logout();
            return false;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            initUserFromToken(token);
        }
        setIsLoading(false);
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
        <AuthContext.Provider value={{ 
            currentUser, 
            login, 
            logout, 
            isAuthenticated: !!currentUser,
            isLoading 
        }}>
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
