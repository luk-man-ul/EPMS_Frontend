export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED'

/* =========================
   LIST RESPONSE TYPE
========================= */
export interface ProjectListItem {
  id: string
  name: string
  description?: string

  status: ProjectStatus
  progress: number

  endDate?: string

  teamSize: number

  lead: {
    id: string
    firstName: string
    lastName: string
  }
}

/* =========================
   DETAIL RESPONSE TYPE
========================= */
export interface ProjectDetail extends Omit<ProjectListItem, 'teamSize'> {
  startDate?: string
  budget?: number

  members: {
    userId: string
    user?: {
      id: string
      firstName: string
      lastName: string
      email: string
    }
  }[]
}