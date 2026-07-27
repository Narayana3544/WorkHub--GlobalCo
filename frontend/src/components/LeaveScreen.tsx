import React from 'react';
import { useLeaveRequests } from '../api/leaveQueries';
import { LeaveCalendar } from './LeaveCalendar';
import { LeaveEmployeePanel } from './LeaveEmployeePanel';
import { LeaveManagerPanel } from './LeaveManagerPanel';
import type { User } from '../types';

interface LeaveScreenProps {
    currentUser: User;
}

export const LeaveScreen: React.FC<LeaveScreenProps> = ({ currentUser }) => {
    const { data: leaves, isLoading } = useLeaveRequests();

    const isManager = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';

    if (isLoading) {
        return <div className="p-8 text-center text-[var(--text-secondary)]">Loading time-off data...</div>;
    }

    const safeLeaves = leaves || [];
    
    // Filter leaves for the employee panel (only show their own leaves)
    const userLeaves = safeLeaves.filter(l => l.userId === currentUser.id);

    // Filter pending leaves for the manager queue
    const pendingLeaves = safeLeaves.filter(l => l.statusCode === 'PENDING');

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-[var(--bg-color)]">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Leave & Time Off</h2>
                    <p className="text-[var(--text-secondary)]">Manage schedules, requests, and team availability</p>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Main Content Area (Calendar & Queue) */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <div className="flex-1 min-h-[300px]">
                        <LeaveCalendar leaves={safeLeaves} />
                    </div>
                    {isManager && (
                        <div className="h-[40%] min-h-[250px]">
                            <LeaveManagerPanel pendingLeaves={pendingLeaves} />
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Employee Request Flow) */}
                <div className="w-[380px] shrink-0 h-full overflow-y-auto">
                    <LeaveEmployeePanel currentUser={currentUser} userLeaves={userLeaves} />
                </div>
            </div>
        </div>
    );
};
