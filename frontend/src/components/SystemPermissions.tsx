import React, { useMemo } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useRolePermissions, useUpdateRolePermission } from '../api/permissionQueries';

export const SystemPermissions: React.FC = () => {
    const { data: rolePermissions, isLoading } = useRolePermissions();
    const { mutate: updatePermission } = useUpdateRolePermission();

    // Grouping for the matrix table
    const matrix = useMemo(() => {
        if (!rolePermissions) return { roles: [], permissions: [], map: {} };

        const roles = Array.from(new Set(rolePermissions.map(rp => rp.role)));
        
        // Unique permissions by ID
        const permissionsMap = new Map<string, {id: string, description: string}>();
        rolePermissions.forEach(rp => {
            permissionsMap.set(rp.permission.id, rp.permission);
        });
        const permissions = Array.from(permissionsMap.values());

        // Map[permissionId][role] = boolean
        const map: Record<string, Record<string, boolean>> = {};
        rolePermissions.forEach(rp => {
            if (!map[rp.permission.id]) map[rp.permission.id] = {};
            map[rp.permission.id][rp.role] = rp.isEnabled;
        });

        return { roles, permissions, map };
    }, [rolePermissions]);

    const handleToggle = (role: string, permissionId: string, currentValue: boolean) => {
        // Safety lock: Do not allow disabling Admin's MANAGE_SYSTEM
        if (role === 'ADMIN' && permissionId === 'MANAGE_SYSTEM' && currentValue) {
            alert("Cannot disable core system management for ADMIN to prevent system lockout.");
            return;
        }
        
        updatePermission({ role, permissionId, isEnabled: !currentValue });
    };

    if (isLoading) return <div className="p-8 text-center text-[var(--text-secondary)]">Loading permission matrix...</div>;

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-[var(--bg-color)]">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-[var(--color-primary)]" />
                        System Permissions
                    </h2>
                    <p className="text-[var(--text-secondary)]">Manage Role-Based Access Control (RBAC) across the platform</p>
                </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex gap-3 text-orange-800 text-sm shadow-sm">
                <AlertTriangle size={20} className="shrink-0" />
                <div>
                    <p className="font-semibold mb-1">Warning: Core Security Matrix</p>
                    <p>Changes made here immediately affect what users can see and do across the system. Ensure you understand a permission's scope before modifying it. Admin access is strictly protected.</p>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/80 dark:bg-gray-800/50 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 border-b border-[var(--border-color)] font-semibold text-[var(--text-primary)] w-1/3">
                                Permission
                            </th>
                            {matrix.roles.map(role => (
                                <th key={role} className="p-4 border-b border-[var(--border-color)] font-semibold text-center text-[var(--text-primary)]">
                                    {role}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                        {matrix.permissions.length === 0 && (
                            <tr>
                                <td colSpan={matrix.roles.length + 1} className="p-8 text-center text-[var(--text-secondary)]">
                                    No permissions mapped in database.
                                </td>
                            </tr>
                        )}
                        {matrix.permissions.map((perm) => (
                            <tr key={perm.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="p-4">
                                    <p className="font-medium text-sm text-[var(--text-primary)]">{perm.id}</p>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">{perm.description}</p>
                                </td>
                                {matrix.roles.map(role => {
                                    const isEnabled = matrix.map[perm.id]?.[role] || false;
                                    const isLocked = role === 'ADMIN' && perm.id === 'MANAGE_SYSTEM';

                                    return (
                                        <td key={`${perm.id}-${role}`} className="p-4 text-center align-middle">
                                            <button 
                                                onClick={() => handleToggle(role, perm.id, isEnabled)}
                                                disabled={isLocked}
                                                className={`
                                                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
                                                    ${isEnabled ? 'bg-[var(--color-primary)]' : 'bg-gray-300 dark:bg-gray-600'}
                                                    ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                                `}
                                                title={isLocked ? 'Locked for safety' : 'Toggle permission'}
                                            >
                                                <span 
                                                    className={`
                                                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                        ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
                                                    `}
                                                />
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
