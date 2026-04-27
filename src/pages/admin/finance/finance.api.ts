import api from '../../../utils/api'
import type { Revenue, ExpenseRecord } from './types/finance.types'

export interface RevenueQueryParams {
  projectId?: string
  startDate?: string
  endDate?: string
}

export interface CreateRevenuePayload {
  projectId: string
  amount: number
  receivedDate: string
  description?: string
}

export interface ExpenseQueryParams {
  projectId?: string
  employeeId?: string
  type?: 'SALARY' | 'MANUAL'
  startDate?: string
  endDate?: string
}

export interface CreateExpensePayload {
  type: 'SALARY' | 'MANUAL'
  amount: number
  expenseDate: string
  employeeId?: string
  projectId?: string
  description?: string
}

export const getRevenues = async (params?: RevenueQueryParams): Promise<Revenue[]> => {
  const res = await api.get('/finance/revenue', { params })
  return res.data
}

export const createRevenue = async (data: CreateRevenuePayload): Promise<Revenue> => {
  const res = await api.post('/finance/revenue', data)
  return res.data
}

export const getExpenses = async (params?: ExpenseQueryParams): Promise<ExpenseRecord[]> => {
  const res = await api.get('/finance/expense', { params })
  return res.data
}

export const createExpense = async (data: CreateExpensePayload): Promise<ExpenseRecord> => {
  const res = await api.post('/finance/expense', data)
  return res.data
}

export interface FinanceSummaryData {
  totalRevenue: number
  totalExpense: number
  profit: number
}

export const getFinanceSummary = async (): Promise<FinanceSummaryData> => {
  const res = await api.get('/finance/summary')
  return res.data
}

export interface ProjectProfitData {
  projectId: string
  revenue: number
  expense: number
  profit: number
}

export const getProjectProfit = async (projectId: string): Promise<ProjectProfitData> => {
  const res = await api.get(`/finance/project/${projectId}`)
  return res.data
}

export interface EmployeeCostData {
  employeeId: string
  totalSalary: number
}

export const getEmployeeCost = async (employeeId: string): Promise<EmployeeCostData> => {
  const res = await api.get(`/finance/employee/${employeeId}`)
  return res.data
}
