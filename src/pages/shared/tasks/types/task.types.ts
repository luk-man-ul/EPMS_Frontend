////////////////////////////////////////////////////////////
// ENUM TYPES (Aligned With Prisma)
////////////////////////////////////////////////////////////

export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'

////////////////////////////////////////////////////////////
// MAIN TASK TYPE (Backend Shape)
////////////////////////////////////////////////////////////

export interface Task {
  id: string
  title: string
  description?: string

  status: TaskStatus
  priority: TaskPriority

  dueDate?: string
  estimatedHrs?: number
  actualHrs?: number
  completedAt?: string

  createdAt: string
  updatedAt: string

  project: {
    id: string
    name: string
  }

  assignee?: {
    id: string
    firstName: string
    lastName: string
  }
}

////////////////////////////////////////////////////////////
// STATUS HISTORY (Aligned With Backend)
////////////////////////////////////////////////////////////

export interface TaskStatusHistory {
  id: string
  oldStatus: TaskStatus
  newStatus: TaskStatus
  changedBy: {
    id: string
    firstName: string
    lastName: string
  }
  changedAt: string
}

////////////////////////////////////////////////////////////
// OPTIONAL FUTURE EXTENSIONS
////////////////////////////////////////////////////////////

export interface TaskTimeLog {
  id: string
  user: {
    id: string
    firstName: string
    lastName: string
  }
  hours: number
  logDate: string
  description: string
}

export interface TaskAttachment {
  id: string
  filePath: string
  uploadedBy: {
    id: string
    firstName: string
    lastName: string
  }
  uploadedAt: string
}