import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { UserProfile } from './components/UserProfile';
import { LeaveScreen } from './components/LeaveScreen';
import { PerformanceReviews } from './components/PerformanceReviews';
import { SystemPermissions } from './components/SystemPermissions';
import { ProtectedRoute } from './components/ProtectedRoute';
import { User } from './types';

const queryClient = new QueryClient();

// Mock current user for demonstration
const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'ADMIN', // Elevated to ADMIN to demonstrate the RBAC screen
  orgId: 'org-1'
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] font-sans">
          {/* Main App Layout */}
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar Placeholder */}
            <aside className="w-64 bg-[var(--card-color)] border-r border-[var(--border-color)] p-4 flex flex-col">
              <div className="font-bold text-xl text-[var(--color-primary)] mb-8 flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[var(--color-primary)] text-white flex items-center justify-center">W</div>
                WorkHub
              </div>
              <nav className="flex-1 space-y-2">
                <NavLink 
                    to="/" 
                    className={({ isActive }) => `block p-2 rounded-lg font-medium cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Sprint Board
                </NavLink>
                <NavLink 
                    to="/leave" 
                    className={({ isActive }) => `block p-2 rounded-lg font-medium cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Leave & Time Off
                </NavLink>
                <NavLink 
                    to="/performance" 
                    className={({ isActive }) => `block p-2 rounded-lg font-medium cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Performance
                </NavLink>
                {mockUser.role === 'ADMIN' && (
                    <NavLink 
                        to="/permissions" 
                        className={({ isActive }) => `block p-2 rounded-lg font-medium cursor-pointer ${isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      System Permissions
                    </NavLink>
                )}
                <div className="p-2 text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium cursor-pointer">
                  Reports
                </div>
              </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-color)]">
              {/* Top Nav Placeholder */}
              <header className="h-16 bg-[var(--card-color)] border-b border-[var(--border-color)] flex items-center px-6 justify-between shrink-0">
                <h1 className="font-semibold text-lg">Project Alpha</h1>
                <div className="flex items-center gap-4">
                  <Link to="/profile" className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer" title="My Profile">
                    {mockUser.fullName.charAt(0)}
                  </Link>
                </div>
              </header>

              {/* Page Content */}
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="/" element={<KanbanBoard projectId="mock-project-id" currentUser={mockUser} />} />
                  <Route path="/profile" element={<UserProfile currentUser={mockUser} />} />
                  <Route path="/leave" element={<LeaveScreen currentUser={mockUser} />} />
                  <Route path="/performance" element={<PerformanceReviews currentUser={mockUser} />} />
                  <Route 
                    path="/permissions" 
                    element={
                        <ProtectedRoute currentUser={mockUser} allowedRoles={['ADMIN']}>
                            <SystemPermissions />
                        </ProtectedRoute>
                    } 
                  />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;

