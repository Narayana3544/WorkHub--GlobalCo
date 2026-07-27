import React, { useState } from 'react';
import { Star, Plus, X, Award } from 'lucide-react';
import { usePerformanceReviews, useCreatePerformanceReview } from '../api/performanceQueries';
import { useMasterData } from '../api/masterDataQueries';
import { useAuth } from '../context/AuthContext';

export const PerformanceReviews: React.FC = () => {
    const { currentUser } = useAuth();
    
    const isManagerOrAdmin = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';
    
    // Fetch all for managers, or just mine for employees
    const { data: reviews, isLoading } = usePerformanceReviews(isManagerOrAdmin ? undefined : currentUser?.id);
    const { data: periods } = useMasterData('REVIEW_PERIOD');
    const { mutate: createReview } = useCreatePerformanceReview();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        employeeName: '',
        periodId: '',
        rating: 3,
        notes: ''
    });

    if (!currentUser) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createReview({
            employeeId: formData.employeeId || 'user-2', // Fallback for simple demo
            employeeName: formData.employeeName || 'Jane Smith',
            reviewerId: currentUser.id,
            reviewerName: currentUser.fullName,
            periodId: parseInt(formData.periodId),
            rating: formData.rating,
            notes: formData.notes
        });
        setIsModalOpen(false);
        setFormData({ employeeId: '', employeeName: '', periodId: '', rating: 3, notes: '' });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={16} 
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'} 
                    />
                ))}
            </div>
        );
    };

    if (isLoading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading performance data...</div>;

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-[var(--bg-color)] relative">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold">Performance Reviews</h2>
                    <p className="text-[var(--text-secondary)]">
                        {isManagerOrAdmin ? 'Manage and log performance assessments across the team' : 'Your historical performance and feedback'}
                    </p>
                </div>
                {isManagerOrAdmin && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[var(--color-primary)] hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Review
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {reviews?.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-secondary)]">
                        <Award size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No performance reviews found.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews?.map(review => (
                        <div key={review.id} className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-5 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    {isManagerOrAdmin ? (
                                        <h3 className="font-semibold text-lg">{review.employeeName}</h3>
                                    ) : (
                                        <h3 className="font-semibold text-lg">{review.periodCode} Review</h3>
                                    )}
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        {isManagerOrAdmin ? `${review.periodCode} Review` : `Reviewed by ${review.reviewerName}`}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800 border border-[var(--border-color)] rounded px-2 py-1 flex items-center justify-center">
                                    <span className="text-lg font-bold mr-2">{review.rating}</span>
                                    {renderStars(review.rating)}
                                </div>
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                                    "{review.notes}"
                                </p>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                                Logged on {new Date(review.createdAt || '').toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-xl w-full max-w-md flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                            <h3 className="font-bold text-lg">Log Performance Review</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Employee Name</label>
                                <input 
                                    type="text" 
                                    required
                                    value={formData.employeeName}
                                    onChange={e => setFormData({...formData, employeeName: e.target.value})}
                                    placeholder="e.g. Jane Smith"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Review Period</label>
                                <select 
                                    required
                                    value={formData.periodId}
                                    onChange={e => setFormData({...formData, periodId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                >
                                    <option value="">Select a period...</option>
                                    {periods?.map(p => (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                    {/* Fallback if DB not seeded */}
                                    {!periods?.length && (
                                        <>
                                            <option value="32">Q1</option>
                                            <option value="33">Q2</option>
                                            <option value="34">Q3</option>
                                            <option value="35">Q4</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Rating (1-5)</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <label key={num} className="flex items-center gap-1 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="rating" 
                                                value={num}
                                                checked={formData.rating === num}
                                                onChange={() => setFormData({...formData, rating: num})}
                                                className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                            />
                                            {num}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Review Notes</label>
                                <textarea 
                                    required
                                    rows={4}
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    placeholder="Provide detailed feedback..."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors">
                                    Save Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
