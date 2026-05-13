export type ReportCategory = 'PROJECT_PERFORMANCE' | 'EMPLOYEE_PRODUCTIVITY' | 'ATTENDANCE_SUMMARY' | 'FINANCIAL_ANALYTICS'

export interface ProjectPerformance {
  projectName: string
  status: string
  progress: number
  tasksCompleted: number
  totalTasks: number
  budget: number
  spent: number
  teamSize: number
  onTimeDelivery: number
}

export interface EmployeeProductivity {
  employeeName: string
  department: string
  tasksCompleted: number
  hoursLogged: number
  efficiency: number
  projectsInvolved: number
  avgTaskCompletionTime: number
}

export interface AttendanceSummary {
  month: string
  totalEmployees: number
  avgAttendance: number
  totalPresent: number
  totalAbsent: number
  totalLate: number
  totalLeave: number
}

export interface FinancialReport {
  month: string
  revenue: number
  expenses: number
  profit: number
  profitMargin: number
  invoicesPaid: number
  invoicesPending: number
}

export interface ProfitLoss {
  category: string
  income: number
  expense: number
  profit: number
  percentage: number
}
