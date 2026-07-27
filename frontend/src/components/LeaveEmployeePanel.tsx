import React, { useState } from 'react';
import { useCreateLeaveRequest } from '../api/leaveQueries';
import { useMasterData } from '../api/masterDataQueries';
import type { LeaveRequest, User } from '../types';

interface LeaveEmployeePanelProps {
    currentUser: User;
    userLeaves: LeaveRequest[];
}

export const LeaveEmployeePanel: React.FC<LeaveEmployeePanelProps> = ({ currentUser, userLeaves }) => {
    const { data: leaveTypes } = useMasterData('LEAVE_TYPE');
    const { mutate: createLeave } = useCreateLeaveRequest();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [typeId, setTypeId] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate || !typeId) return;

        createLeave({
            userId: currentUser.id,
            startDate,
            endDate,
            typeId: parseInt(typeId),
            reason
        });

        // Reset form
        setStartDate('');
        setEndDate('');
        setTypeId('');
        setReason('');
        alert("Leave request submitted successfully!");
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
            case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-orange-600 bg-orange-50 border-orange-200';
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Balances (Mocked as per plan) */}
            <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-4 flex gap-4">
                <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Casual Leave</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">8 <span className="text-sm font-normal">/ 12</span></p>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800 text-center">
                    <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-1">Sick Leave</p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-400">3 <span className="text-sm font-normal">/ 6</span></p>
                </div>
                <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 text-center">
                    <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Earned Leave</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">12 <span className="text-sm font-normal">/ 15</span></p>
                </div>
            </div>

            {/* Request Form */}
            <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="p-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="font-semibold text-lg">Request Time Off</h3>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 flex-1 flex flex-col space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Leave Type</label>
                        <select 
                            value={typeId} 
                            onChange={e => setTypeId(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <option value="">Select a type...</option>
                            {leaveTypes?.map(type => (
                                <option key={type.id} value={type.id}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Start Date</label>
                            <input 
                                type="date" 
                                required
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">End Date</label>
                            <input 
                                type="date" 
                                required
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Reason (Optional)</label>
                        <textarea 
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="mt-auto w-full bg-[var(--color-primary)] hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                        Submit Request
                    </button>
                </form>
            </div>

            {/* My Recent Requests */}
            <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-4 max-h-[300px] overflow-y-auto">
                <h3 className="font-semibold mb-3">My Recent Requests</h3>
                <div className="space-y-3">
                    {userLeaves.length === 0 && <p className="text-sm text-[var(--text-secondary)]">No recent requests.</p>}
                    {userLeaves.map(leave => (
                        <div key={leave.id} className="flex items-start justify-between border-b border-[var(--border-color)] pb-2 last:border-0 last:pb-0">
                            <div>
                                <p className="font-medium text-sm">{leave.typeCode} Leave</p>
                                <p className="text-xs text-[var(--text-secondary)]">{leave.startDate} to {leave.endDate}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(leave.statusCode)}`}>
                                {leave.statusCode}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
