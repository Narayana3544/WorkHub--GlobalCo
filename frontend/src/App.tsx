import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { UserProfile } from './components/UserProfile';
import { LeaveScreen } from './components/LeaveScreen';
import { PerformanceReviews } from './components/PerformanceReviews';
import { SystemPermissions } from './components/SystemPermissions';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LogOut, Sun, Moon } from 'lucide-react';

const queryClient = new QueryClient();

// A layout wrapper for authenticated screens
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, logout } = useAuth();
    const [isDark, setIsDark] = React.useState(() => {
        return localStorage.getItem('workhub-theme') === 'dark';
    });

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('workhub-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    if (!currentUser) return null;

    return (
        <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-primary)] font-sans">
            {/* Global Top Nav */}
            <header className="h-16 bg-[var(--card-color)] border-b border-[var(--border-color)] flex items-center px-6 justify-between shrink-0 shadow-sm z-50">
                <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded bg-[var(--color-primary)] text-white flex items-center justify-center font-bold">W</div>
                    <span className="font-bold text-xl text-[var(--color-primary)] hidden sm:block">WorkHub</span>
                </Link>

                <div className="flex items-center gap-4">
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setIsDark(prev => !prev)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium leading-tight">{currentUser.fullName}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{currentUser.role}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-bold shadow-sm">
                            {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="w-px h-6 bg-[var(--border-color)] mx-2"></div>
                    <button 
                        onClick={logout}
                        className="text-[var(--text-secondary)] hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-medium"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:block">Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginScreen />} />

            {/* Protected Routes */}
            <Route path="/home" element={
                <ProtectedRoute>
                    <AuthenticatedLayout>
                        <HomeScreen />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            <Route path="/kanban" element={
                <ProtectedRoute>
                    <AuthenticatedLayout>
                        {/* We inject mock project ID here since we aren't building a project selector yet */}
                        <KanbanBoard projectId="mock-project-id" />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <AuthenticatedLayout>
                        <UserProfile />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            <Route path="/leave" element={
                <ProtectedRoute>
                    <AuthenticatedLayout>
                        <LeaveScreen />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            <Route path="/performance" element={
                <ProtectedRoute>
                    <AuthenticatedLayout>
                        <PerformanceReviews />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            <Route path="/permissions" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AuthenticatedLayout>
                        <SystemPermissions />
                    </AuthenticatedLayout>
                </ProtectedRoute>
            } />

            {/* Default redirect to home (which will bounce to login if unauthenticated) */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
