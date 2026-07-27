import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, CalendarRange, Award, Users, ShieldCheck } from 'lucide-react';
import { useWorkItems } from '../api/queries';
import { useLeaveRequests } from '../api/leaveQueries';
import { usePerformanceReviews } from '../api/performanceQueries';

export const HomeScreen: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Live counts
    const { data: workItems } = useWorkItems('mock-project-id'); 
    const { data: leaveRequests } = useLeaveRequests();
    const { data: performanceReviews } = usePerformanceReviews();

    if (!currentUser) return null;

    const isManager = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';
    const isAdmin = currentUser.role === 'ADMIN';

    const activeTasksCount = workItems?.filter(w => w.statusCode !== 'DONE').length || 0;
    const pendingApprovalsCount = leaveRequests?.filter(l => l.statusCode === 'PENDING').length || 0;
    const reviewCount = performanceReviews?.length || 0;

    return (
        <div className="h-full flex flex-col p-8 overflow-y-auto bg-[var(--bg-color)]">
            <div className="mb-10 text-center max-w-2xl mx-auto mt-8">
                <h2 className="text-3xl font-bold mb-3">Welcome back, {currentUser.fullName}</h2>
                <p className="text-[var(--text-secondary)] text-lg">What would you like to focus on today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
                {/* Standard Tiles (All Roles) */}
                <div 
                    onClick={() => navigate('/kanban')}
                    className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-[var(--color-primary)] hover:shadow-md transition-all group flex flex-col"
                >
                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[var(--color-primary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Task Manager</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1">Track issues, bugs, and tasks on the Kanban board.</p>
                    <div className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 self-start px-2.5 py-1 rounded-full">
                        {activeTasksCount} Active Tasks
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/profile')}
                    className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-purple-500 hover:shadow-md transition-all group flex flex-col"
                >
                    <div className="w-12 h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">My Profile & Docs</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1">Manage your details and uploaded files.</p>
                    <div className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/20 self-start px-2.5 py-1 rounded-full">
                        Manage Settings
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/leave')}
                    className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-green-500 hover:shadow-md transition-all group flex flex-col"
                >
                    <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CalendarRange size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Leave Management</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1">Request time off and view team calendar.</p>
                    <div className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 self-start px-2.5 py-1 rounded-full">
                        View Calendar
                    </div>
                </div>

                <div 
                    onClick={() => navigate('/performance')}
                    className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-orange-500 hover:shadow-md transition-all group flex flex-col"
                >
                    <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Award size={24} />
                    </div>
                    <h3 className="font-bold text-lg mb-1">Performance</h3>
                    <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1">View historical reviews and feedback.</p>
                    <div className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/20 self-start px-2.5 py-1 rounded-full">
                        {reviewCount} Records
                    </div>
                </div>

                {/* Manager / Admin Tiles */}
                {isManager && (
                    <div 
                        onClick={() => navigate('/leave')} // Navigates to leave but focuses on queue
                        className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-red-500 hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 dark:bg-red-900/10 rounded-bl-full -z-0"></div>
                        <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1 relative z-10">Team Approvals</h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1 relative z-10">Approve or reject leave requests for your direct reports.</p>
                        <div className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 self-start px-2.5 py-1 rounded-full relative z-10">
                            {pendingApprovalsCount} Pending
                        </div>
                    </div>
                )}

                {isAdmin && (
                    <div 
                        onClick={() => navigate('/permissions')} // Directing to admin area
                        className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl p-6 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all group flex flex-col relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-full -z-0"></div>
                        <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform relative z-10">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1 relative z-10">Administration</h3>
                        <p className="text-[var(--text-secondary)] text-sm mb-4 flex-1 relative z-10">Manage users, master data, and system RBAC.</p>
                        <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 self-start px-2.5 py-1 rounded-full relative z-10">
                            System Config
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
