/**
 * Task-related TypeScript interfaces
 * Aligned with backend Prisma Task model
 */

import { TaskType, TaskStatus, Priority } from './enums';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  designation?: string;
  department?: string;
  profilePhoto?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  
  // Task type classification
  type: TaskType;
  
  assignedToId: string | null;
  createdById: string;
  
  // Approval metadata
  approvedById: string | null;
  approvedAt: Date | string | null;
  rejectionReason: string | null;
  
  dueDate: Date | string | null;
  estimatedHrs: number | null;
  actualHrs: number | null;
  completedAt: Date | string | null;
  
  position: number;
  isDeleted: boolean;
  
  // Relations
  project?: Project;
  assignee?: User | null;
  creator?: User;
  approvedBy?: User | null;
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TaskStatusHistory {
  id: string;
  taskId: string;
  oldStatus: TaskStatus;
  newStatus: TaskStatus;
  changedById: string;
  changedBy?: User;
  note?: string;
  createdAt: Date | string;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  description?: string;
  logDate: Date | string;
  approvedById?: string | null;
  approvedAt?: Date | string | null;
  user?: User;
  approvedBy?: User | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SelfWorkMetrics {
  projectId: string;
  projectName: string;
  totalProposed: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number; // percentage
  avgApprovalTimeHours: number; // average time from creation to approval
  pendingCount: number;
  byEmployee: Array<{
    employeeId: string;
    employeeName: string;
    proposed: number;
    approved: number;
    rejected: number;
  }>;
}
