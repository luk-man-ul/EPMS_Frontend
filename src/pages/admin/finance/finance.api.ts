import api from '../../../utils/api'
import type { Revenue, ExpenseRecord, BankAccount, ExpenseCategory, LedgerEntry, Invoice } from './types/finance.types'

// ── Revenue ──────────────────────────────────────────────────────────────────

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
  paymentMethod?: 'CASH' | 'ONLINE'
  bankAccountId?: string
}

export const getRevenues = async (params?: RevenueQueryParams): Promise<Revenue[]> => {
  const res = await api.get('/finance/revenue', { params })
  return res.data
}

export const createRevenue = async (data: CreateRevenuePayload): Promise<Revenue> => {
  const res = await api.post('/finance/revenue', data)
  return res.data
}

// ── Expense ──────────────────────────────────────────────────────────────────

export interface ExpenseQueryParams {
  projectId?: string
  employeeId?: string
  categoryId?: string
  startDate?: string
  endDate?: string
}

export interface CreateExpensePayload {
  categoryId: string
  amount: number
  expenseDate: string
  employeeId?: string
  projectId?: string
  description?: string
  paymentMethod?: 'CASH' | 'ONLINE'
  bankAccountId?: string
}

export const getExpenses = async (params?: ExpenseQueryParams): Promise<ExpenseRecord[]> => {
  const res = await api.get('/finance/expense', { params })
  return res.data
}

export const createExpense = async (data: CreateExpensePayload): Promise<ExpenseRecord> => {
  const res = await api.post('/finance/expense', data)
  return res.data
}

// ── Summary / reporting ───────────────────────────────────────────────────────

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

// ── Project aggregate ─────────────────────────────────────────────────────────

export interface ProjectProfitSummary {
  projectId: string
  projectName: string
  revenue: number
  expense: number
  profit: number
  profitMargin: number
  revenueCount: number
  expenseCount: number
}

export interface AllProjectsProfitData {
  projects: ProjectProfitSummary[]
  totalRevenue: number
  totalExpense: number
  totalProfit: number
  topProject: ProjectProfitSummary | null
}

export const getAllProjectsProfit = async (): Promise<AllProjectsProfitData> => {
  const res = await api.get('/finance/projects/summary')
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

// ── Employee aggregate ────────────────────────────────────────────────────────

export interface EmployeeCostSummary {
  employeeId: string
  employeeName: string
  totalSalary: number
  salaryCount: number
}

export interface AllEmployeesCostData {
  employees: EmployeeCostSummary[]
  totalPayroll: number
  employeeCount: number
  topEarner: EmployeeCostSummary | null
}

export const getAllEmployeesCost = async (): Promise<AllEmployeesCostData> => {
  const res = await api.get('/finance/employees/summary')
  return res.data
}

// ── Bank accounts ─────────────────────────────────────────────────────────────

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const res = await api.get('/finance/bank-accounts')
  return res.data
}

// ── Expense categories ────────────────────────────────────────────────────────

export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const res = await api.get('/finance/expense-categories')
  return res.data
}

// ── Ledger ────────────────────────────────────────────────────────────────────

export interface LedgerQueryParams {
  type?: 'CREDIT' | 'DEBIT'
  referenceType?: 'REVENUE' | 'EXPENSE'
  startDate?: string
  endDate?: string
}

export const getLedgerEntries = async (params?: LedgerQueryParams): Promise<LedgerEntry[]> => {
  const res = await api.get('/finance/ledger', { params })
  return res.data
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export interface InvoiceQueryParams {
  status?: string
  projectId?: string
  search?: string
}

export interface InvoiceItemPayload {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoicePayload {
  projectId: string
  clientName: string
  clientAddress?: string
  clientGSTIN?: string
  issueDate: string
  dueDate: string
  notes?: string
  revenueId?: string
  items: InvoiceItemPayload[]
}

export interface UpdateInvoicePayload {
  clientName?: string
  clientAddress?: string
  clientGSTIN?: string
  issueDate?: string
  dueDate?: string
  status?: string
  notes?: string
  items?: InvoiceItemPayload[]
}

export const getInvoices = async (params?: InvoiceQueryParams): Promise<Invoice[]> => {
  const res = await api.get('/finance/invoices', { params })
  return res.data
}

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const res = await api.get(`/finance/invoices/${id}`)
  return res.data
}

export const createInvoice = async (data: CreateInvoicePayload): Promise<Invoice> => {
  const res = await api.post('/finance/invoices', data)
  return res.data
}

export const updateInvoice = async (id: string, data: UpdateInvoicePayload): Promise<Invoice> => {
  const res = await api.patch(`/finance/invoices/${id}`, data)
  return res.data
}

export const deleteInvoice = async (id: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.delete(`/finance/invoices/${id}`)
  return res.data
}

// ── Invoice PDF ───────────────────────────────────────────────────────────────

/**
 * Upload a generated PDF blob to the backend for storage.
 * The backend saves it to uploads/invoices/{invoiceNo}.pdf and
 * updates Invoice.pdfPath.
 */
export const storeInvoicePdf = async (
  invoiceId: string,
  pdfBlob: Blob,
  filename: string,
): Promise<{ pdfPath: string }> => {
  const formData = new FormData()
  formData.append('file', pdfBlob, filename)
  const res = await api.post(`/finance/invoices/${invoiceId}/pdf`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
