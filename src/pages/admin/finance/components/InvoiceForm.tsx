import { useState, useEffect, useMemo } from 'react'
import { createInvoice, updateInvoice, getRevenues } from '../finance.api'
import type { Invoice, InvoiceStatus } from '../types/finance.types'
import type { Revenue } from '../types/finance.types'
import { getProjectOptions } from '../lookup.api'
import type { ProjectOption } from '../lookup.api'
import { useToast } from '../../../../context/ToastContext'
import { formatCurrency } from '../finance.utils'
import InvoiceItemTable from './InvoiceItemTable'
import type { ItemRow } from './InvoiceItemTable'

// ── Props ─────────────────────────────────────────────────────────────────────

interface CreateProps {
  mode: 'create'
  onSuccess: (invoice: Invoice) => void
  onCancel: () => void
}

interface EditProps {
  mode: 'edit'
  invoice: Invoice
  onSuccess: (invoice: Invoice) => void
  onCancel: () => void
}

type Props = CreateProps | EditProps

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e5e5e5',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#666',
  marginBottom: '6px',
}

const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']

const EMPTY_ITEM: ItemRow = { description: '', quantity: '1', unitPrice: '0' }

// ── Component ─────────────────────────────────────────────────────────────────

const InvoiceForm = (props: Props) => {
  const { showToast } = useToast()
  const isEdit = props.mode === 'edit'
  const existing = isEdit ? props.invoice : null

  // ── Dropdown data ───────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [revenues, setRevenues] = useState<Revenue[]>([])

  // ── Form state ──────────────────────────────────────────────────────────────
  const [projectId,      setProjectId]      = useState(existing?.projectId      ?? '')
  const [revenueId,      setRevenueId]      = useState(existing?.revenueId      ?? '')
  const [clientName,     setClientName]     = useState(existing?.clientName     ?? '')
  const [clientAddress,  setClientAddress]  = useState(existing?.clientAddress  ?? '')
  const [clientGSTIN,    setClientGSTIN]    = useState(existing?.clientGSTIN    ?? '')
  const [issueDate,      setIssueDate]      = useState(
    existing ? existing.issueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
  )
  const [dueDate,        setDueDate]        = useState(
    existing ? existing.dueDate.slice(0, 10) : '',
  )
  const [status,         setStatus]         = useState<InvoiceStatus>(existing?.status ?? 'DRAFT')
  const [notes,          setNotes]          = useState(existing?.notes ?? '')
  const [items,          setItems]          = useState<ItemRow[]>(
    existing?.items.length
      ? existing.items.map((i) => ({
          description: i.description,
          quantity:    String(i.quantity),
          valueColor:  undefined,
          unitPrice:   String(i.unitPrice),
        }))
      : [{ ...EMPTY_ITEM }],
  )

  const [gstEnabled,    setGstEnabled]    = useState(
    isEdit ? (existing!.taxPercentage != null && existing!.taxPercentage > 0) : false,
  )
  const [gstPercentage, setGstPercentage] = useState<number | ''>(
    isEdit && existing!.taxPercentage != null ? existing!.taxPercentage : '',
  )
  const [gstType,       setGstType]       = useState<'CGST_SGST' | 'IGST' | ''>(
    isEdit ? (existing!.gstType ?? '') : '',
  )

  const [formError,  setFormError]  = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Derived totals preview (useMemo — no state, no re-render loops) ─────────
  const previewSubtotal = useMemo(
    () => items.reduce((sum, r) => sum + (parseFloat(r.quantity) || 0) * (parseFloat(r.unitPrice) || 0), 0),
    [items],
  )
  const previewTaxPct   = gstEnabled && gstPercentage !== '' ? Number(gstPercentage) : 0
  const previewTaxAmt   = previewSubtotal * previewTaxPct / 100
  const previewTotal    = previewSubtotal + previewTaxAmt

  // ── Fetch dropdowns ─────────────────────────────────────────────────────────
  useEffect(() => {
    getProjectOptions().then(setProjects).catch(() => {})
    getRevenues().then(setRevenues).catch(() => {})
  }, [])

  const availableRevenues = revenues.filter(
    (r) => !r.invoice || r.id === existing?.revenueId,
  )

  // ── GST toggle ──────────────────────────────────────────────────────────────
  const handleGstToggle = (checked: boolean) => {
    setGstEnabled(checked)
    if (!checked) {
      setGstPercentage('')
      setGstType('')
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!projectId)   return 'Project is required'
    if (!clientName.trim()) return 'Client name is required'
    if (!issueDate)   return 'Issue date is required'
    if (!dueDate)     return 'Due date is required'
    if (items.length === 0) return 'At least one item is required'
    for (let i = 0; i < items.length; i++) {
      const row = items[i]
      if (!row.description.trim()) return `Item ${i + 1}: description is required`
      const qty = parseFloat(row.quantity)
      if (isNaN(qty) || qty <= 0) return `Item ${i + 1}: quantity must be > 0`
      const price = parseFloat(row.unitPrice)
      if (isNaN(price) || price < 0) return `Item ${i + 1}: unit price must be ≥ 0`
    }
    return null
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const err = validate()
    if (err) { setFormError(err); return }

    const itemPayload = items.map((r) => ({
      description: r.description.trim(),
      quantity:    parseFloat(r.quantity),
      unitPrice:   parseFloat(r.unitPrice),
    }))

    try {
      setSubmitting(true)
      let result: Invoice

      if (isEdit) {
        result = await updateInvoice(existing!.id, {
          clientName:    clientName.trim(),
          clientAddress: clientAddress.trim() || undefined,
          clientGSTIN:   clientGSTIN.trim()   || undefined,
          issueDate,
          dueDate,
          status,
          notes:         notes.trim()         || undefined,
          taxPercentage: gstEnabled && gstPercentage !== '' ? Number(gstPercentage) : 0,
          items:         itemPayload,
        })
        showToast('success', 'Invoice updated')
      } else {
        result = await createInvoice({
          projectId,
          clientName:    clientName.trim(),
          clientAddress: clientAddress.trim() || undefined,
          clientGSTIN:   clientGSTIN.trim()   || undefined,
          issueDate,
          dueDate,
          notes:         notes.trim()         || undefined,
          revenueId:     revenueId            || undefined,
          taxPercentage: gstEnabled && gstPercentage !== '' ? Number(gstPercentage) : undefined,
          items:         itemPayload,
        })
        showToast('success', `Invoice ${result.invoiceNo} created`)
      }

      props.onSuccess(result)
    } catch (err: any) {
      const msg = err.response?.data?.message
      showToast('error', Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save invoice')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5', padding: isMobile ? '16px' : '28px' }}>
      {/* Title */}
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginBottom: '20px' }}>
        {isEdit ? `Edit ${existing!.invoiceNo}` : 'New Invoice'}
      </div>

      {formError && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '8px', background: '#fff5f5', color: '#dc2626', fontSize: '13px' }}>
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Row 1: Project + Revenue link */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Project *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isEdit}
              style={{ ...inputStyle, background: isEdit ? '#fafafa' : '#fff', cursor: isEdit ? 'not-allowed' : 'pointer' }}
            >
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Link to Revenue (optional)</label>
            <select
              value={revenueId}
              onChange={(e) => setRevenueId(e.target.value)}
              disabled={isEdit}
              style={{ ...inputStyle, background: isEdit ? '#fafafa' : '#fff', cursor: isEdit ? 'not-allowed' : 'pointer' }}
            >
              <option value="">None</option>
              {availableRevenues.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.project.name} — ₹{r.amount.toLocaleString('en-IN')} ({r.receivedDate.slice(0, 10)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Client Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Client Name *</label>
          <input
            type="text"
            placeholder="Acme Corporation"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Apply GST toggle */}
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            id="gstEnabled"
            checked={gstEnabled}
            onChange={(e) => handleGstToggle(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="gstEnabled" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer', fontSize: '13px', color: '#1a1a1a' }}>
            Apply GST
          </label>
        </div>

        {/* Conditional GST field group */}
        {gstEnabled && (
          <div style={{ marginBottom: '14px', padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e5e5e5' }}>
            {/* Row: Client GSTIN */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Client GSTIN</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={clientGSTIN}
                onChange={(e) => setClientGSTIN(e.target.value)}
                style={inputStyle}
              />
            </div>
            {/* Row: GST Percentage + GST Type */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>GST Percentage (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="18"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>GST Type</label>
                <select
                  value={gstType}
                  onChange={(e) => setGstType(e.target.value as 'CGST_SGST' | 'IGST' | '')}
                  style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
                >
                  <option value="">Select type</option>
                  <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                  <option value="IGST">IGST (Inter-state)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Client Address */}
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Client Address</label>
          <input
            type="text"
            placeholder="123 Business Park, Mumbai 400001"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Row 4: Issue Date + Due Date + Status (edit only) */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isEdit ? '1fr 1fr 1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Issue Date *</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Due Date *</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          {isEdit && (
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                style={{ ...inputStyle, background: '#fff', cursor: 'pointer' }}
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 5: Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Notes</label>
          <input
            type="text"
            placeholder="Payment due within 30 days."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Invoice items */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
            Line Items *
          </div>
          <InvoiceItemTable readonly={false} items={items} onChange={setItems} />

          {/* ── GST totals preview ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', marginTop: '12px',
          }}>
            <div style={{
              background: '#f8fafc', borderRadius: '10px',
              border: '1px solid #e5e5e5', padding: '14px 20px', minWidth: isMobile ? '100%' : '240px',
              boxSizing: 'border-box',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatCurrency(previewSubtotal)}</span>
              </div>

              {gstEnabled && previewTaxPct > 0 && (
                <>
                  {gstType === 'CGST_SGST' ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>CGST ({previewTaxPct / 2}%)</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{formatCurrency(previewTaxAmt / 2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>SGST ({previewTaxPct / 2}%)</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{formatCurrency(previewTaxAmt / 2)}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#888' }}>
                        {gstType === 'IGST' ? `IGST (${previewTaxPct}%)` : `GST (${previewTaxPct}%)`}
                      </span>
                      <span style={{ fontSize: '12px', color: '#888' }}>{formatCurrency(previewTaxAmt)}</span>
                    </div>
                  )}
                </>
              )}

              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '8px', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Grand Total</span>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a' }}>
                  {formatCurrency(previewTotal)}
                </span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#aaa', textAlign: 'right' }}>
                preview — backend recomputes on save
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '8px' } : { display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={props.onCancel}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid #e5e5e5',
              background: '#fff', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: 'none',
              background: submitting ? '#666' : '#1a1a1a', color: '#fff',
              fontSize: '13px', fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer',
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default InvoiceForm
