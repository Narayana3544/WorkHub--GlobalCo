import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { LeaveRequest } from '../types';

// Mock data fallback to ensure the UI is demonstrable without backend setup
let MOCK_LEAVES: LeaveRequest[] = [
    {
        id: '1',
        userId: 'user-2',
        userName: 'Jane Smith',
        typeId: 2,
        typeCode: 'SICK',
        startDate: '2026-07-28',
        endDate: '2026-07-29',
        statusId: 4,
        statusCode: 'PENDING',
        reason: 'Flu symptoms',
        orgId: 'org-1'
    },
    {
        id: '2',
        userId: 'user-3',
        userName: 'Mike Johnson',
        typeId: 1,
        typeCode: 'CASUAL',
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        statusId: 5,
        statusCode: 'APPROVED',
        reason: 'Family vacation',
        orgId: 'org-1'
    }
];

export const useLeaveRequests = () => {
    return useQuery({
        queryKey: ['leaveRequests'],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<LeaveRequest[]>('/leaves');
                return data;
            } catch (error) {
                console.warn("API failed, falling back to mock leave data", error);
                return MOCK_LEAVES;
            }
        }
    });
};

export const useCreateLeaveRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newLeave: Partial<LeaveRequest>) => {
            try {
                const { data } = await apiClient.post<LeaveRequest>('/leaves', newLeave);
                return data;
            } catch (error) {
                console.warn("API post failed, mocking success", error);
                const mockCreated: LeaveRequest = {
                    id: Math.random().toString(),
                    userId: 'user-1',
                    userName: 'Test User',
                    typeId: newLeave.typeId!,
                    typeCode: newLeave.typeId === 1 ? 'CASUAL' : 'SICK',
                    startDate: newLeave.startDate!,
                    endDate: newLeave.endDate!,
                    statusId: 4,
                    statusCode: 'PENDING',
                    reason: newLeave.reason,
                    orgId: 'org-1'
                };
                MOCK_LEAVES.push(mockCreated);
                return mockCreated;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
        },
    });
};

export const useReviewLeaveRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, statusId, statusCode, comment }: { id: string, statusId: number, statusCode: string, comment?: string }) => {
            try {
                const { data } = await apiClient.patch<LeaveRequest>(`/leaves/${id}/status`, { statusId, comment });
                return data;
            } catch (error) {
                console.warn("API patch failed, mocking review success", error);
                MOCK_LEAVES = MOCK_LEAVES.map(l => l.id === id ? { ...l, statusId, statusCode, approverComment: comment } : l);
                return { id, statusId, statusCode };
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
        }
    });
};
