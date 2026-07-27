import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { PerformanceReview } from '../types';

let MOCK_REVIEWS: PerformanceReview[] = [
    {
        id: '1',
        employeeId: 'user-1',
        employeeName: 'Test User',
        reviewerId: 'admin-1',
        reviewerName: 'Admin Person',
        periodId: 32, // Mock ID for Q1
        periodCode: 'Q1',
        rating: 4,
        notes: 'Great performance this quarter. Met all sprint goals and improved the React codebase significantly.',
        orgId: 'org-1',
        createdAt: '2026-04-01T10:00:00Z'
    },
    {
        id: '2',
        employeeId: 'user-2',
        employeeName: 'Jane Smith',
        reviewerId: 'user-1',
        reviewerName: 'Test User',
        periodId: 33, // Mock ID for Q2
        periodCode: 'Q2',
        rating: 5,
        notes: 'Exceptional delivery on the Kanban backend features. Highly proactive.',
        orgId: 'org-1',
        createdAt: '2026-07-01T10:00:00Z'
    }
];

export const usePerformanceReviews = (employeeId?: string) => {
    return useQuery({
        queryKey: ['performanceReviews', employeeId],
        queryFn: async () => {
            try {
                // If employeeId is provided, fetch specifically for them.
                // Otherwise fetch all (assuming ADMIN/MANAGER can see all in this simple view)
                const params = employeeId ? { employeeId } : {};
                const { data } = await apiClient.get<PerformanceReview[]>('/performance-reviews', { params });
                return data;
            } catch (error) {
                console.warn("API failed, falling back to mock performance data", error);
                if (employeeId) {
                    return MOCK_REVIEWS.filter(r => r.employeeId === employeeId);
                }
                return MOCK_REVIEWS;
            }
        }
    });
};

export const useCreatePerformanceReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newReview: Partial<PerformanceReview>) => {
            try {
                const { data } = await apiClient.post<PerformanceReview>('/performance-reviews', newReview);
                return data;
            } catch (error) {
                console.warn("API post failed, mocking success", error);
                const mockCreated: PerformanceReview = {
                    id: Math.random().toString(),
                    employeeId: newReview.employeeId!,
                    employeeName: newReview.employeeName || 'Unknown Employee',
                    reviewerId: newReview.reviewerId!,
                    reviewerName: newReview.reviewerName || 'Current Manager',
                    periodId: newReview.periodId!,
                    periodCode: newReview.periodId === 32 ? 'Q1' : 'Q2',
                    rating: newReview.rating!,
                    notes: newReview.notes,
                    orgId: 'org-1',
                    createdAt: new Date().toISOString()
                };
                MOCK_REVIEWS.push(mockCreated);
                return mockCreated;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['performanceReviews'] });
        },
    });
};
