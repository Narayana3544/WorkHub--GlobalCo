import React, { useState } from 'react';
import { User, Save, ShieldAlert } from 'lucide-react';
import { DocumentUploadWidget } from './DocumentUploadWidget';
import type { User as UserType } from '../types';

interface UserProfileProps {
    currentUser: UserType;
}

export const UserProfile: React.FC<UserProfileProps> = ({ currentUser }) => {
    // Local state for the editable fields
    const [formData, setFormData] = useState({
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        role: currentUser.role || 'EMPLOYEE',
        orgId: currentUser.orgId || '',
        status: 'ACTIVE', // Mocked user status field as per PRD
    });

    const isAdmin = currentUser.role === 'ADMIN';

    const handleSave = () => {
        // In a real app, this would fire a PUT /api/users/me (or similar) mutation
        alert('Profile saved successfully! (Mock)');
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-[var(--bg-color)]">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">My Profile & Settings</h2>
                <p className="text-[var(--text-secondary)]">Manage your personal information and documents</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Basic Info Section */}
                        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border-color)]">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Personal Information</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">Update your photo and personal details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-primary)]">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Administrative Section */}
                        <div className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-xl shadow-sm p-6 relative overflow-hidden">
                            {!isAdmin && (
                                <div className="absolute top-4 right-4 text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                    <ShieldAlert size={14} /> Read Only
                                </div>
                            )}
                            
                            <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
                                <h3 className="font-semibold text-lg">Administrative Details</h3>
                                <p className="text-sm text-[var(--text-secondary)]">These fields are controlled by HR or System Admins</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">System Role</label>
                                    <select 
                                        value={formData.role}
                                        disabled={!isAdmin}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-md transition-shadow ${
                                            isAdmin 
                                                ? 'border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]' 
                                                : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed appearance-none'
                                        }`}
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Account Status</label>
                                    <select 
                                        value={formData.status}
                                        disabled={!isAdmin}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-md transition-shadow ${
                                            isAdmin 
                                                ? 'border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]' 
                                                : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed appearance-none'
                                        }`}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Organization ID</label>
                                    <input 
                                        type="text" 
                                        value={formData.orgId}
                                        disabled
                                        className="w-full px-3 py-2 border border-transparent bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Actions */}
                        <div className="flex justify-end pt-2 pb-8">
                            <button 
                                onClick={handleSave}
                                className="bg-[var(--color-primary)] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save Profile Changes
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Document Upload Widget */}
                    <div className="lg:col-span-1 h-full pb-8">
                        <DocumentUploadWidget 
                            ownerType="USER" 
                            ownerId={currentUser.id} 
                            currentUser={currentUser} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
