export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type PaymentMethod = 'CASH' | 'ONLINE'

// ── Reference types ──────────────────────────────────────────────────────────

export interface BankAccount {
  id: string
  name: string
  type: 'BANK_ACCOUNT' | 'CASH' | 'UPI' | 'PETTY_CASH' | 'OTHER'
  bankName: string | null
  accountNumber: string | null
  ifscCode?: string | null
  isActive: boolean
}

export interface ExpenseCategory {
  id: string
  name: string
  isActive: boolean
}

// ── Legacy mock type (kept for backward compat) ──────────────────────────────

export interface Income {
  id: string
  invoiceNo: string
  client: string
  project: string
  amount: number
  status: PaymentStatus
  paymentDate: string
  dueDate: string
  createdAt: string
}

// ── Real backend Revenue model ────────────────────────────────────────────────

export interface Revenue {
  id: string
  amount: number
  receivedDate: string
  description?: string
  paymentMethod?: PaymentMethod
  bankAccount?: { id: string; name: string; bankName: string } | null
  invoice?: { id: string; invoiceNo: string; status: string } | null
  project: { id: string; name: string }
  createdBy: { id: string; firstName: string; lastName: string }
  createdAt: string
}

// ── Legacy mock Expense type (kept for backward compat) ──────────────────────

export interface Expense {
  id: string
  category: string
  amount: number
  vendor: string
  date: string
  approvalStatus: ApprovalStatus
  description: string
  billUrl?: string
  requestedBy: string
  approvedBy?: string
}

// ── Real backend Expense model ────────────────────────────────────────────────

export interface ExpenseRecord {
  id: string
  amount: number
  expenseDate: string
  description?: string
  paymentMethod?: PaymentMethod
  bankAccount?: { id: string; name: string; bankName: string } | null
  category: { id: string; name: string }   // required — every expense has a category
  employee?: { id: string; firstName: string; lastName: string }
  project?: { id: string; name: string }
  createdBy: { id: string; firstName: string; lastName: string }
  createdAt: string
}

export interface FinanceSummary {
  monthlyIncome: number
  monthlyExpense: number
  pendingPayments: number
  profitMargin: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
}

// ── Ledger ────────────────────────────────────────────────────────────────────

export type LedgerEntryType = 'CREDIT' | 'DEBIT'
export type LedgerReferenceType = 'REVENUE' | 'EXPENSE'

export interface LedgerEntry {
  id: string
  type: LedgerEntryType
  referenceType: LedgerReferenceType
  referenceId: string
  amount: number
  date: string
  description?: string | null
  paymentMethod?: PaymentMethod | null
  bankAccount?: { id: string; name: string; bankName: string } | null
  category?: { id: string; name: string } | null
  createdBy: { id: string; firstName: string; lastName: string }
  createdAt: string
}

// ── Invoice ───────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  createdAt: string
}

export interface Invoice {
  id: string
  invoiceNo: string
  projectId: string
  clientName: string
  clientAddress?: string | null
  clientGSTIN?: string | null
  issueDate: string
  dueDate: string
  status: InvoiceStatus
  // ── GST fields — null for invoices created before GST was added ──
  subtotal:      number | null   // sum of item totals before tax
  taxPercentage: number | null   // e.g. 18 for 18% GST; null = no GST
  taxAmount:     number | null   // computed by backend; null = no GST
  totalAmount:   number          // subtotal + taxAmount (authoritative grand total)
  notes?: string | null
  pdfPath?: string | null
  revenueId?: string | null
  createdAt: string
  updatedAt: string
  project: { id: string; name: string }
  createdBy: { id: string; firstName: string; lastName: string }
  revenue?: {
    id: string
    amount: number
    receivedDate: string
    description?: string | null
    paymentMethod?: PaymentMethod | null
  } | null
  items: InvoiceItem[]
  // gstType is UI-only — not persisted. Derived from clientGSTIN presence or user selection.
  gstType?: 'CGST_SGST' | 'IGST'
}
