import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useReviewLeaveRequest } from '../api/leaveQueries';
import type { LeaveRequest } from '../types';

interface LeaveManagerPanelProps {
    pendingLeaves: LeaveRequest[];
}

export const LeaveManagerPanel: React.FC<LeaveManagerPanelProps> = ({ pendingLeaves }) => {
    const { mutate: reviewLeave } = useReviewLeaveRequest();
    
    // Track which request is currently being reviewed to show the comment input
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [comment, setComment] = useState('');

    const handleReview = (id: string, isApproved: boolean) => {
        if (reviewingId !== id) {
            setReviewingId(id);
            setComment('');
            return;
        }

        // Finalize review
        reviewLeave({
            id,
            statusId: isApproved ? 5 : 6, // 5 = APPROVED, 6 = REJECTED
            statusCode: isApproved ? 'APPROVED' : 'REJECTED',
            comment
        });
        setReviewingId(null);
    };

    return (
        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-[var(--border-color)] bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    Approval Queue
                    {pendingLeaves.length > 0 && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
                            {pendingLeaves.length}
                        </span>
                    )}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">Review team time-off requests</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {pendingLeaves.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[var(--text-secondary)]">
                        No pending requests in your queue!
                    </div>
                )}

                {pendingLeaves.map(leave => (
                    <div key={leave.id} className="border border-[var(--border-color)] rounded-lg p-4 bg-[var(--bg-color)] shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                    {leave.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{leave.userName}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Requested {leave.typeCode} Leave</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{leave.startDate} to {leave.endDate}</p>
                            </div>
                        </div>

                        {leave.reason && (
                            <p className="text-sm text-[var(--text-secondary)] mb-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-100 dark:border-gray-700">
                                "{leave.reason}"
                            </p>
                        )}

                        {reviewingId === leave.id ? (
                            <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
                                <input 
                                    type="text" 
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="Add a comment (optional)..."
                                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] mb-3"
                                />
                                <div className="flex gap-2 justify-end">
                                    <button 
                                        onClick={() => setReviewingId(null)}
                                        className="px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => handleReview(leave.id, false)}
                                        className="px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 rounded transition-colors font-medium"
                                    >
                                        Confirm Reject
                                    </button>
                                    <button 
                                        onClick={() => handleReview(leave.id, true)}
                                        className="px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded transition-colors font-medium"
                                    >
                                        Confirm Approve
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2 mt-4">
                                <button 
                                    onClick={() => handleReview(leave.id, false)}
                                    className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                                <button 
                                    onClick={() => handleReview(leave.id, true)}
                                    className="flex items-center gap-1 text-sm text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                >
                                    <CheckCircle2 size={16} /> Approve
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
