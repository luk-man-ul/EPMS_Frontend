/**
 * InvoicePdfDocument.tsx
 *
 * @react-pdf/renderer template that mirrors the InvoiceDetail layout.
 * Used for both client-side download and server-side storage.
 *
 * DO NOT import React DOM elements here — only @react-pdf/renderer primitives.
 */
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Invoice } from '../types/finance.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrencyPdf = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const formatDatePdf = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// ── Status color map ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     '#888888',
  SENT:      '#2563eb',
  PAID:      '#16a34a',
  OVERDUE:   '#dc2626',
  CANCELLED: '#1a1a1a',
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  invoiceNo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  projectLabel: {
    fontSize: 9,
    color: '#999999',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: 20,
  },

  // Two-column grid
  grid2: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  col: {
    flex: 1,
  },

  // Labels + values
  fieldLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 10,
    color: '#1a1a1a',
    fontFamily: 'Helvetica-Bold',
  },
  fieldValueNormal: {
    fontSize: 10,
    color: '#1a1a1a',
  },
  fieldValueSmall: {
    fontSize: 9,
    color: '#666666',
    marginTop: 2,
  },
  fieldValueGreen: {
    fontSize: 10,
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  fieldValueRed: {
    fontSize: 10,
    color: '#dc2626',
    fontFamily: 'Helvetica-Bold',
  },

  // Dates mini-grid
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  dateCell: {
    width: '45%',
    marginBottom: 10,
  },

  // Section title
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Items table
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  colDesc:  { flex: 5, fontSize: 9, color: '#666666', fontFamily: 'Helvetica-Bold' },
  colQty:   { flex: 1, fontSize: 9, color: '#666666', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  colPrice: { flex: 2, fontSize: 9, color: '#666666', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  colTotal: { flex: 2, fontSize: 9, color: '#666666', fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  cellDesc:  { flex: 5, fontSize: 9, color: '#1a1a1a' },
  cellQty:   { flex: 1, fontSize: 9, color: '#1a1a1a', textAlign: 'right' },
  cellPrice: { flex: 2, fontSize: 9, color: '#1a1a1a', textAlign: 'right' },
  cellTotal: { flex: 2, fontSize: 9, color: '#1a1a1a', fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  // Totals
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  totalsBox: {
    width: 220,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  totalsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalsLabel: { fontSize: 9, color: '#666666' },
  totalsValue: { fontSize: 9, color: '#1a1a1a', fontFamily: 'Helvetica-Bold' },
  totalsDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginVertical: 6,
  },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  grandValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },

  // Notes
  notesSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 14,
  },
  notesText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#bbbbbb',
  },
})

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  invoice: Invoice
}

const InvoicePdfDocument = ({ invoice }: Props) => {
  const statusColor = STATUS_COLORS[invoice.status] ?? '#888888'
  const isOverdue   = invoice.status === 'OVERDUE'

  // ── All monetary values from backend-persisted fields — no recalculation ──
  const subtotal  = invoice.subtotal   ?? invoice.totalAmount
  const taxPct    = invoice.taxPercentage ?? 0
  const taxAmount = invoice.taxAmount  ?? 0
  const hasGst    = taxPct > 0 && taxAmount > 0

  return (
    <Document
      title={invoice.invoiceNo}
      author="EMPS Finance"
      subject={`Invoice for ${invoice.clientName}`}
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.invoiceNo}>{invoice.invoiceNo}</Text>
            <Text style={s.projectLabel}>Project: {invoice.project.name}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '22', color: statusColor }]}>
            <Text style={{ color: statusColor, fontSize: 9, fontFamily: 'Helvetica-Bold' }}>
              {invoice.status}
            </Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Client + Dates ── */}
        <View style={s.grid2}>
          {/* Bill To */}
          <View style={s.col}>
            <Text style={s.fieldLabel}>Bill To</Text>
            <Text style={s.fieldValue}>{invoice.clientName}</Text>
            {invoice.clientAddress ? (
              <Text style={s.fieldValueSmall}>{invoice.clientAddress}</Text>
            ) : null}
            {invoice.clientGSTIN ? (
              <Text style={[s.fieldValueSmall, { marginTop: 3 }]}>
                GSTIN: {invoice.clientGSTIN}
              </Text>
            ) : null}
          </View>

          {/* Dates */}
          <View style={s.col}>
            <View style={s.datesGrid}>
              <View style={s.dateCell}>
                <Text style={s.fieldLabel}>Issue Date</Text>
                <Text style={s.fieldValueNormal}>{formatDatePdf(invoice.issueDate)}</Text>
              </View>
              <View style={s.dateCell}>
                <Text style={s.fieldLabel}>Due Date</Text>
                <Text style={isOverdue ? s.fieldValueRed : s.fieldValueNormal}>
                  {formatDatePdf(invoice.dueDate)}
                </Text>
              </View>
              <View style={s.dateCell}>
                <Text style={s.fieldLabel}>Created</Text>
                <Text style={s.fieldValueNormal}>{formatDatePdf(invoice.createdAt)}</Text>
              </View>
              {invoice.revenue ? (
                <View style={s.dateCell}>
                  <Text style={s.fieldLabel}>Linked Revenue</Text>
                  <Text style={s.fieldValueGreen}>
                    {formatCurrencyPdf(invoice.revenue.amount)}
                    {invoice.revenue.paymentMethod
                      ? ` (${invoice.revenue.paymentMethod})`
                      : ''}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Items table ── */}
        <Text style={s.sectionTitle}>Line Items</Text>

        {/* Table header */}
        <View style={s.tableHeader}>
          <Text style={s.colDesc}>Description</Text>
          <Text style={s.colQty}>Qty</Text>
          <Text style={s.colPrice}>Unit Price</Text>
          <Text style={s.colTotal}>Total</Text>
        </View>

        {/* Table rows */}
        {invoice.items.map((item, idx) => (
          <View key={idx} style={s.tableRow}>
            <Text style={s.cellDesc}>{item.description}</Text>
            <Text style={s.cellQty}>{item.quantity}</Text>
            <Text style={s.cellPrice}>{formatCurrencyPdf(item.unitPrice)}</Text>
            <Text style={s.cellTotal}>{formatCurrencyPdf(item.total)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={s.totalsRow}>
          <View style={s.totalsBox}>
            <View style={s.totalsLine}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>{formatCurrencyPdf(subtotal)}</Text>
            </View>
            {hasGst && invoice.gstType === 'CGST_SGST' ? (
              <>
                <View style={s.totalsLine}>
                  <Text style={s.totalsLabel}>CGST ({taxPct / 2}%)</Text>
                  <Text style={s.totalsValue}>{formatCurrencyPdf(taxAmount / 2)}</Text>
                </View>
                <View style={s.totalsLine}>
                  <Text style={s.totalsLabel}>SGST ({taxPct / 2}%)</Text>
                  <Text style={s.totalsValue}>{formatCurrencyPdf(taxAmount / 2)}</Text>
                </View>
              </>
            ) : hasGst ? (
              <View style={s.totalsLine}>
                <Text style={s.totalsLabel}>IGST ({taxPct}%)</Text>
                <Text style={s.totalsValue}>{formatCurrencyPdf(taxAmount)}</Text>
              </View>
            ) : null}
            <View style={s.totalsDivider} />
            <View style={s.totalsLine}>
              <Text style={s.grandLabel}>Total</Text>
              <Text style={s.grandValue}>{formatCurrencyPdf(invoice.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ── Notes ── */}
        {invoice.notes ? (
          <View style={s.notesSection}>
            <Text style={s.fieldLabel}>Notes</Text>
            <Text style={s.notesText}>{invoice.notes}</Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>
            Created by {invoice.createdBy.firstName} {invoice.createdBy.lastName}
            {'  ·  '}
            Last updated {formatDatePdf(invoice.updatedAt)}
          </Text>
        </View>

      </Page>
    </Document>
  )
}

export default InvoicePdfDocument
