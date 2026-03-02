export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export interface EmployeeRole {
  role: {
    name: string
  }
}

export interface EmployeeSkill {
  skill: {
    id: string
    name: string
  }
}


export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  department?: string
  designation?: string
  skills: EmployeeSkill[]
  profilePhoto?: string
  joinedAt?: string
  lastLoginAt?: string
  status: EmployeeStatus
  roles: EmployeeRole[]
}

