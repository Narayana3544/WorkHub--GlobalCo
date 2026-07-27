import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { WorkItem } from '../types';

// Mock data for demonstration purposes if the API is not yet seeded
const MOCK_DATA: WorkItem[] = [
    {
        id: '1',
        title: 'Implement JWT Authentication',
        typeId: 1,
        typeCode: 'TASK',
        statusId: 1,
        statusCode: 'BACKLOG',
        priorityId: 3,
        priorityCode: 'HIGH',
        storyPoints: 5,
        projectId: 'mock-project-id',
        orgId: 'org-1',
    },
    {
        id: '2',
        title: 'Design Kanban Board UI',
        typeId: 1,
        typeCode: 'TASK',
        statusId: 2,
        statusCode: 'TODO',
        priorityId: 2,
        priorityCode: 'MEDIUM',
        storyPoints: 3,
        assigneeId: 'user-1',
        assigneeName: 'Test User',
        projectId: 'mock-project-id',
        orgId: 'org-1',
    },
    {
        id: '3',
        title: 'Fix Login Screen Crash',
        description: 'App crashes on invalid credentials',
        typeId: 2,
        typeCode: 'BUG',
        statusId: 3,
        statusCode: 'IN_PROGRESS',
        priorityId: 4,
        priorityCode: 'CRITICAL',
        storyPoints: 2,
        assigneeId: 'user-1',
        assigneeName: 'Test User',
        projectId: 'mock-project-id',
        orgId: 'org-1',
    },
    {
        id: '4',
        title: 'User API Endpoint Tests',
        typeId: 3,
        typeCode: 'TEST_CASE',
        statusId: 4,
        statusCode: 'REVIEW',
        priorityId: 1,
        priorityCode: 'LOW',
        storyPoints: 1,
        assigneeId: 'user-2',
        assigneeName: 'Jane Smith',
        projectId: 'mock-project-id',
        orgId: 'org-1',
    },
    {
        id: '5',
        title: 'Database Schema Migrations',
        typeId: 1,
        typeCode: 'TASK',
        statusId: 5,
        statusCode: 'DONE',
        priorityId: 3,
        priorityCode: 'HIGH',
        storyPoints: 8,
        assigneeId: 'user-1',
        assigneeName: 'Test User',
        projectId: 'mock-project-id',
        orgId: 'org-1',
    }
];

export const useWorkItems = (projectId: string) => {
    return useQuery({
        queryKey: ['workItems', projectId],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<any>(`/workitems`, {
                    params: { size: 100 }
                });
                const items: WorkItem[] = Array.isArray(data) ? data : (data?.content || []);
                return items.length > 0 ? items : MOCK_DATA;
            } catch (error) {
                console.warn("API failed, falling back to mock data", error);
                return MOCK_DATA;
            }
        },
        enabled: !!projectId,
    });
};

export const useUpdateWorkItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, statusId, statusCode }: { id: string; statusId?: number, statusCode?: string }) => {
            // Synchronously update in-memory MOCK_DATA array as well for mock items
            const mockIndex = MOCK_DATA.findIndex(m => m.id === id);
            if (mockIndex !== -1 && statusCode) {
                MOCK_DATA[mockIndex] = {
                    ...MOCK_DATA[mockIndex],
                    statusCode: statusCode as any
                };
            }

            try {
                const { data } = await apiClient.patch<WorkItem>(`/workitems/${id}/status`, { statusId, statusCode });
                return data;
            } catch (error) {
                console.warn("API patch failed, using optimistic state", error);
                return { id, statusCode } as any;
            }
        },
        onMutate: async (newStatus) => {
            await queryClient.cancelQueries({ queryKey: ['workItems'] });
            
            const previousItems = queryClient.getQueryData<WorkItem[]>(['workItems', 'mock-project-id']);

            queryClient.setQueriesData<WorkItem[]>({ queryKey: ['workItems'] }, (old) => {
                if (!old) return old;
                return old.map((item) =>
                    item.id === newStatus.id
                        ? { ...item, statusCode: newStatus.statusCode as any }
                        : item
                );
            });

            return { previousItems };
        },
        onError: (_err, _newStatus, _context) => {
            // Retain optimistic update so card stays snapped in target column
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['workItems'] });
        },
    });
};
