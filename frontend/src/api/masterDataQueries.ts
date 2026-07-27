import { useQuery } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { MasterData } from '../types';

export const useMasterData = (category: string) => {
    return useQuery({
        queryKey: ['masterData', category],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<MasterData[]>(`/master-data`, {
                    params: { category }
                });
                return data;
            } catch (error) {
                console.warn(`API failed to fetch master data for ${category}, using fallback data.`);
                // Mock data fallback if API is unreachable
                if (category === 'LEAVE_TYPE') {
                    return [
                        { id: 1, category: 'LEAVE_TYPE', code: 'CASUAL', label: 'Casual Leave', displayOrder: 1 },
                        { id: 2, category: 'LEAVE_TYPE', code: 'SICK', label: 'Sick Leave', displayOrder: 2 },
                        { id: 3, category: 'LEAVE_TYPE', code: 'EARNED', label: 'Earned Leave', displayOrder: 3 },
                    ];
                }
                if (category === 'LEAVE_STATUS') {
                     return [
                        { id: 4, category: 'LEAVE_STATUS', code: 'PENDING', label: 'Pending', displayOrder: 1 },
                        { id: 5, category: 'LEAVE_STATUS', code: 'APPROVED', label: 'Approved', displayOrder: 2 },
                        { id: 6, category: 'LEAVE_STATUS', code: 'REJECTED', label: 'Rejected', displayOrder: 3 },
                     ];
                }
                return [];
            }
        },
        enabled: !!category,
    });
};
