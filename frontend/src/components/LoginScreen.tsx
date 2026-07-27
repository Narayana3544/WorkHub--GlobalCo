import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { apiClient } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserPlus, LogIn } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const { login, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)]">
                <div className="w-8 h-8 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        const from = location.state?.from?.pathname || '/home';
        return <Navigate to={from} replace />;
    }

    const switchMode = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setErrorMsg(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsSubmitting(true);

        try {
            if (mode === 'login') {
                const response = await apiClient.post('/auth/login', {
                    email,
                    password
                });
                login(response.data.accessToken, response.data.refreshToken);
                navigate('/home');
            } else {
                const response = await apiClient.post('/auth/register', {
                    fullName,
                    email,
                    password,
                    organizationName
                });
                login(response.data.accessToken, response.data.refreshToken);
                navigate('/home');
            }
        } catch (error: any) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || '';

                if (status === 400) {
                    setErrorMsg(message || "Please check your input values.");
                } else if (status === 401) {
                    if (message.toLowerCase().includes('bad credentials') || message.toLowerCase().includes('password')) {
                        setErrorMsg("The password you entered is incorrect.");
                    } else if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('user')) {
                         setErrorMsg("We couldn't find an account with that email address.");
                    } else if (message.toLowerCase().includes('inactive') || message.toLowerCase().includes('disabled')) {
                        setErrorMsg("Your account is currently inactive. Please contact HR or your Administrator.");
                    } else {
                        setErrorMsg("Invalid email or password.");
                    }
                } else if (status === 403) {
                    setErrorMsg("Your account does not have permission to proceed right now.");
                } else if (status === 409) {
                    setErrorMsg(message || "An account with this email address already exists.");
                } else {
                    setErrorMsg("Our servers are having a hiccup. Please try again in a moment.");
                }
            } else if (error.request) {
                setErrorMsg("We couldn't reach the server. Please check your internet connection.");
            } else {
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] px-4 py-8">
            <div className="max-w-md w-full bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-sm">
                        W
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to WorkHub</h1>
                    <p className="text-[var(--text-secondary)] mt-1 text-sm">
                        {mode === 'login' ? 'Sign in to access your dashboard' : 'Create an account & start your workspace'}
                    </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
                    <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                            mode === 'login'
                                ? 'bg-[var(--card-color)] text-[var(--color-primary)] shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <LogIn size={16} />
                        Sign In
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode('register')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                            mode === 'register'
                                ? 'bg-[var(--card-color)] text-[var(--color-primary)] shadow-sm'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                    >
                        <UserPlus size={16} />
                        Create Account
                    </button>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="Jane Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Organization Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="you@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Password</label>
                        <input 
                            type="password" 
                            required
                            minLength={mode === 'register' ? 8 : undefined}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full mt-2 bg-[var(--color-primary)] hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : mode === 'login' ? (
                            'Sign In'
                        ) : (
                            'Create Account & Workspace'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
