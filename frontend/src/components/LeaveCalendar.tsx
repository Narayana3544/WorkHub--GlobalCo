import React from 'react';
import type { LeaveRequest } from '../types';

interface LeaveCalendarProps {
    leaves: LeaveRequest[];
}

export const LeaveCalendar: React.FC<LeaveCalendarProps> = ({ leaves }) => {
    // Generate a simple 14-day timeline (current week + next week)
    const today = new Date();
    // Normalize to start of day
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
    });

    const getLeaveColor = (typeCode?: string, statusCode?: string) => {
        if (statusCode === 'PENDING') return 'bg-gray-300 dark:bg-gray-600 border-dashed border-gray-400';
        if (statusCode === 'REJECTED') return 'hidden';
        
        switch (typeCode) {
            case 'SICK': return 'bg-red-400 border-red-500';
            case 'CASUAL': return 'bg-blue-400 border-blue-500';
            case 'EARNED': return 'bg-green-400 border-green-500';
            default: return 'bg-[var(--color-primary)] border-blue-700';
        }
    };

    return (
        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="font-semibold text-lg">Team Calendar (14 Days)</h3>
                <p className="text-sm text-[var(--text-secondary)]">View upcoming time off across the team</p>
            </div>

            <div className="p-4 overflow-x-auto flex-1">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-15 gap-1 mb-2">
                        <div className="col-span-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Team Member</div>
                        {days.map((day, i) => (
                            <div key={i} className="text-center text-xs font-medium text-[var(--text-secondary)]">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}<br/>
                                <span className={day.getTime() === today.getTime() ? 'bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded-full' : ''}>
                                    {day.getDate()}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Group leaves by user (simplified for mock purposes) */}
                    {['Jane Smith', 'Mike Johnson', 'Test User'].map(user => {
                        const userLeaves = leaves.filter(l => l.userName === user || (l.userId === 'user-1' && user === 'Test User'));
                        
                        return (
                            <div key={user} className="grid grid-cols-15 gap-1 items-center py-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="col-span-3 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {user.charAt(0)}
                                    </div>
                                    <span className="text-sm font-medium truncate">{user}</span>
                                </div>

                                {days.map((day, i) => {
                                    // Check if this day falls within any of the user's leaves
                                    const activeLeave = userLeaves.find(l => {
                                        const start = new Date(l.startDate);
                                        const end = new Date(l.endDate);
                                        // Reset time for comparison
                                        start.setHours(0,0,0,0);
                                        end.setHours(23,59,59,999);
                                        return day >= start && day <= end;
                                    });

                                    return (
                                        <div key={i} className="h-8 relative p-0.5">
                                            {activeLeave && activeLeave.statusCode !== 'REJECTED' && (
                                                <div 
                                                    className={`h-full w-full rounded-sm border ${getLeaveColor(activeLeave.typeCode, activeLeave.statusCode)}`}
                                                    title={`${activeLeave.typeCode} (${activeLeave.statusCode})`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="p-3 border-t border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20 flex gap-4 text-xs font-medium text-[var(--text-secondary)]">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400"></div> Casual</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400"></div> Sick</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-400"></div> Earned</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-300 border-dashed border border-gray-400"></div> Pending</div>
            </div>
        </div>
    );
};
