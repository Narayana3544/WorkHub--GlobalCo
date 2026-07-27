import React, { useState } from 'react';
import { apiClient } from '../api/axios';
import type { Role } from '../types';

export const CreateUser: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<Role>('EMPLOYEE');
    const [orgId] = useState('org-1'); // Default for demo

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            await apiClient.post('/auth/register', {
                email,
                password,
                fullName,
                role,
                orgId
            });
            setStatus('success');
            setMessage(`User ${fullName} created successfully. Provide them the temporary password directly.`);
            // Reset form
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('EMPLOYEE');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to create user. Please check your connection.');
        }
    };

    return (
        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-6 max-w-2xl">
            <div className="mb-6 border-b border-[var(--border-color)] pb-4">
                <h3 className="text-xl font-bold">Create New User</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Users are created exclusively by Administration. Provide the temporary password securely to the user.
                </p>
            </div>

            {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg">
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Full Name</label>
                        <input 
                            type="text" 
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Temporary Password</label>
                        <input 
                            type="text" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono text-sm"
                            placeholder="e.g. Temp123!"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">System Role</label>
                        <select 
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-[var(--bg-color)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)] flex justify-end">
                    <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="bg-[var(--color-primary)] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                        {status === 'loading' ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    );
};
