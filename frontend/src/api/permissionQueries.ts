import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { RolePermission } from '../types';

let MOCK_PERMISSIONS: RolePermission[] = [
    { id: 1, role: 'ADMIN', permission: { id: 'MANAGE_USERS', description: 'Create, update, and manage system users' }, isEnabled: true },
    { id: 2, role: 'ADMIN', permission: { id: 'MANAGE_SYSTEM', description: 'Access and modify system configuration' }, isEnabled: true },
    { id: 3, role: 'ADMIN', permission: { id: 'VIEW_ALL_PROJECTS', description: 'View all projects across the organization' }, isEnabled: true },
    { id: 4, role: 'MANAGER', permission: { id: 'MANAGE_USERS', description: 'Create, update, and manage system users' }, isEnabled: false },
    { id: 5, role: 'MANAGER', permission: { id: 'MANAGE_SYSTEM', description: 'Access and modify system configuration' }, isEnabled: false },
    { id: 6, role: 'MANAGER', permission: { id: 'VIEW_ALL_PROJECTS', description: 'View all projects across the organization' }, isEnabled: true },
    { id: 7, role: 'EMPLOYEE', permission: { id: 'MANAGE_USERS', description: 'Create, update, and manage system users' }, isEnabled: false },
    { id: 8, role: 'EMPLOYEE', permission: { id: 'MANAGE_SYSTEM', description: 'Access and modify system configuration' }, isEnabled: false },
    { id: 9, role: 'EMPLOYEE', permission: { id: 'VIEW_ALL_PROJECTS', description: 'View all projects across the organization' }, isEnabled: false },
];

export const useRolePermissions = () => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            try {
                const { data } = await apiClient.get<RolePermission[]>('/permissions');
                return data;
            } catch (error) {
                console.warn("API failed, falling back to mock permission data", error);
                return MOCK_PERMISSIONS;
            }
        }
    });
};

export const useUpdateRolePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ role, permissionId, isEnabled }: { role: string, permissionId: string, isEnabled: boolean }) => {
            try {
                const { data } = await apiClient.patch<RolePermission>('/permissions', { role, permissionId, isEnabled });
                return data;
            } catch (error) {
                console.warn("API patch failed, mocking success", error);
                // Mock update
                MOCK_PERMISSIONS = MOCK_PERMISSIONS.map(p => 
                    (p.role === role && p.permission.id === permissionId) 
                        ? { ...p, isEnabled } 
                        : p
                );
                return { role, permissionId, isEnabled };
            }
        },
        onMutate: async (newUpdate) => {
            await queryClient.cancelQueries({ queryKey: ['permissions'] });
            const previous = queryClient.getQueryData<RolePermission[]>(['permissions']);
            
            if (previous) {
                queryClient.setQueryData<RolePermission[]>(['permissions'], old => {
                    return old?.map(p => 
                        (p.role === newUpdate.role && p.permission.id === newUpdate.permissionId) 
                            ? { ...p, isEnabled: newUpdate.isEnabled } 
                            : p
                    );
                });
            }
            return { previous };
        },
        onError: (err, newUpdate, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['permissions'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
        }
    });
};
