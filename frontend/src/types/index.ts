export type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    orgId: string;
}

export type WorkItemType = 'TASK' | 'BUG' | 'TEST_CASE';
export type WorkItemStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type WorkItemPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface WorkItem {
    id: string;
    title: string;
    description?: string;
    typeId: number;
    typeCode?: WorkItemType;
    statusId: number;
    statusCode: WorkItemStatus;
    priorityId: number;
    priorityCode?: WorkItemPriority;
    storyPoints: number;
    severity?: 'LOW' | 'MINOR' | 'MAJOR' | 'CRITICAL';
    environment?: 'DEV' | 'STAGING' | 'PROD';
    executionResult?: 'PASS' | 'FAIL' | 'BLOCKED';
    assigneeId?: string;
    assigneeName?: string;
    projectId: string;
    orgId: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface DocumentResponse {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: string;
    ownerType: string;
    ownerId: string;
    orgId: string;
    createdAt: string;
}

export interface MasterData {
    id: number;
    category: string;
    code: string;
    label: string;
    displayOrder: number;
}

export interface LeaveRequest {
    id: string;
    userId: string;
    userName?: string;
    typeId: number;
    typeCode?: string;
    startDate: string;
    endDate: string;
    statusId: number;
    statusCode?: string;
    reason?: string;
    approverId?: string;
    approverComment?: string;
    orgId: string;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employeeName?: string;
    reviewerId: string;
    reviewerName?: string;
    periodId: number;
    periodCode?: string;
    rating: number; // 1-5
    notes?: string;
    orgId: string;
    createdAt?: string;
}

export interface Permission {
    id: string;
    description: string;
}

export interface RolePermission {
    id: number;
    role: Role;
    permission: Permission;
    isEnabled: boolean;
}
