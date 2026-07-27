import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password
            });
            
            login(response.data.accessToken, response.data.refreshToken);
            navigate('/home');
        } catch (error: any) {
            // Human-readable error parsing as per PRD
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || '';

                if (status === 401) {
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
                    setErrorMsg("Your account does not have permission to log in right now.");
                } else {
                    setErrorMsg("Our servers are having a hiccup. Please try again in a moment.");
                }
            } else if (error.request) {
                setErrorMsg("We couldn't reach the server. Please check your internet connection.");
            } else {
                setErrorMsg("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-color)] px-4">
            <div className="max-w-md w-full bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                        W
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome to WorkHub</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Sign in to manage your tasks and team</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            placeholder="••••••••"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[var(--color-primary)] hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
