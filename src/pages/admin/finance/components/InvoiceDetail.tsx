import { useState, useEffect } from 'react'
import type { Invoice } from '../types/finance.types'
import { formatCurrency, formatDate } from '../finance.utils'
import { storeInvoicePdf } from '../finance.api'
import { useToast } from '../../../../context/ToastContext'
import InvoiceStatusBadge from './InvoiceStatusBadge'
import InvoiceItemTable from './InvoiceItemTable'

interface Props {
  invoice: Invoice
  onEdit: () => void
  onBack: () => void
  onPdfStored?: (pdfPath: string) => void  // notify parent when pdfPath updates
}

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#999',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const value: React.CSSProperties = {
  fontSize: '14px',
  color: '#1a1a1a',
  fontWeight: 500,
}

// ── PDF helpers ───────────────────────────────────────────────────────────────

async function generatePdfBlob(invoice: Invoice): Promise<Blob> {
  const { generateInvoicePdfBlob } = await import('./invoicePdfGenerator')
  return generateInvoicePdfBlob(invoice)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function pdfFilename(invoiceNo: string): string {
  return `${invoiceNo.replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`
}

// ── Component ─────────────────────────────────────────────────────────────────

const InvoiceDetail = ({ invoice, onEdit, onBack, onPdfStored }: Props) => {
  const { showToast } = useToast()
  const isPaid = invoice.status === 'PAID'

  const [downloading, setDownloading] = useState(false)
  const [storing,     setStoring]     = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Download PDF (client-side only, no server call) ──────────────────────
  const handleDownload = async () => {
    try {
      setDownloading(true)
      const blob = await generatePdfBlob(invoice)
      downloadBlob(blob, pdfFilename(invoice.invoiceNo))
      showToast('success', `${invoice.invoiceNo}.pdf downloaded`)
    } catch {
      showToast('error', 'Failed to generate PDF')
    } finally {
      setDownloading(false)
    }
  }

  // ── Generate + Store PDF (generates, uploads to backend, updates pdfPath) ─
  const handleGenerateAndStore = async () => {
    try {
      setStoring(true)
      const blob = await generatePdfBlob(invoice)
      const filename = pdfFilename(invoice.invoiceNo)
      const { pdfPath } = await storeInvoicePdf(invoice.id, blob, filename)
      showToast('success', 'PDF saved to server')
      onPdfStored?.(pdfPath)
    } catch {
      showToast('error', 'Failed to store PDF')
    } finally {
      setStoring(false)
    }
  }

  // ── Build absolute URL for stored PDF ────────────────────────────────────
  const backendBase = (import.meta as any).env?.VITE_API_URL?.replace('/api', '') ?? ''
  const storedPdfUrl = invoice.pdfPath ? `${backendBase}${invoice.pdfPath}` : null

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={isMobile ? { display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px', marginBottom: '24px' } : { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e5e5',
            background: '#fff', fontSize: '13px', color: '#666', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            justifyContent: isMobile ? 'center' : 'flex-start',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          ← Back to Invoices
        </button>

        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '8px' } : { display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Download PDF — always available */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid #e5e5e5', background: '#fff',
              fontSize: '13px', color: '#1a1a1a', fontWeight: 500,
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.6 : 1,
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            {downloading ? 'Generating...' : '⬇ Download PDF'}
          </button>

          {/* Generate & Store — saves to server */}
          <button
            onClick={handleGenerateAndStore}
            disabled={storing}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid #d4d4d4', background: '#f8fafc',
              fontSize: '13px', color: '#1a1a1a', fontWeight: 500,
              cursor: storing ? 'not-allowed' : 'pointer',
              opacity: storing ? 0.6 : 1,
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            {storing ? 'Saving...' : '☁ Save PDF to Server'}
          </button>

          {/* View stored PDF — only if pdfPath exists */}
          {storedPdfUrl && (
            <a
              href={storedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px', borderRadius: '8px',
                border: '1px solid #bbf7d0', background: '#f0fdf4',
                fontSize: '13px', color: '#16a34a', fontWeight: 500,
                textDecoration: 'none', display: 'inline-block',
                width: isMobile ? '100%' : 'auto',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}
            >
              👁 View Stored PDF
            </a>
          )}

          {/* Edit — hidden for PAID */}
          {!isPaid && (
            <button
              onClick={onEdit}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none',
                background: '#1a1a1a', color: '#fff', fontSize: '13px',
                fontWeight: 500, cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                textAlign: 'center',
              }}
            >
              Edit Invoice
            </button>
          )}
        </div>
      </div>

      {/* ── Stored PDF indicator ── */}
      {invoice.pdfPath && (
        <div style={{
          marginBottom: '16px', padding: '10px 16px', borderRadius: '8px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          fontSize: '13px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span>✓</span>
          <span>PDF stored on server — last generated version available above.</span>
        </div>
      )}

      {/* ── Invoice card ── */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        padding: isMobile ? '16px' : '40px',
        maxWidth: '860px',
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em' }}>
              {invoice.invoiceNo}
            </div>
            <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>
              Project: {invoice.project.name}
            </div>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        {/* Client + Dates grid */}
        <div style={isMobile ? { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' } : { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
          {/* Bill To */}
          <div>
            <div style={label}>Bill To</div>
            <div style={{ ...value, fontSize: '15px', fontWeight: 600 }}>{invoice.clientName}</div>
            {invoice.clientAddress && (
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', whiteSpace: 'pre-line' }}>
                {invoice.clientAddress}
              </div>
            )}
            {invoice.clientGSTIN && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                GSTIN: {invoice.clientGSTIN}
              </div>
            )}
          </div>

          {/* Dates */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={label}>Issue Date</div>
                <div style={value}>{formatDate(invoice.issueDate)}</div>
              </div>
              <div>
                <div style={label}>Due Date</div>
                <div style={{ ...value, color: invoice.status === 'OVERDUE' ? '#dc2626' : '#1a1a1a' }}>
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
              <div>
                <div style={label}>Created</div>
                <div style={value}>{formatDate(invoice.createdAt)}</div>
              </div>
              {invoice.revenue && (
                <div>
                  <div style={label}>Linked Revenue</div>
                  <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>
                    {formatCurrency(invoice.revenue.amount)}
                    {invoice.revenue.paymentMethod && (
                      <span style={{ color: '#999', fontWeight: 400, marginLeft: '6px' }}>
                        ({invoice.revenue.paymentMethod})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items table */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
            Line Items
          </div>
          <InvoiceItemTable readonly={true} items={invoice.items} invoiceSubtotal={invoice.subtotal ?? invoice.totalAmount} />
        </div>

        {/* Totals summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{
            background: '#f8fafc', borderRadius: '10px',
            border: '1px solid #e5e5e5', padding: '16px 24px', minWidth: isMobile ? '100%' : '260px',
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#666' }}>Subtotal</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                {formatCurrency(invoice.subtotal ?? invoice.totalAmount)}
              </span>
            </div>

            {invoice.taxPercentage != null && invoice.taxPercentage > 0 && invoice.taxAmount != null && (
              invoice.gstType === 'CGST_SGST' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      CGST ({invoice.taxPercentage / 2}%)
                    </span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {formatCurrency(invoice.taxAmount / 2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      SGST ({invoice.taxPercentage / 2}%)
                    </span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {formatCurrency(invoice.taxAmount / 2)}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    GST ({invoice.taxPercentage}%)
                  </span>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    {formatCurrency(invoice.taxAmount)}
                  </span>
                </div>
              )
            )}

            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a1a' }}>
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
            <div style={label}>Notes</div>
            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', whiteSpace: 'pre-line' }}>
              {invoice.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: '24px', fontSize: '12px', color: '#bbb', textAlign: 'center' }}>
          Created by {invoice.createdBy.firstName} {invoice.createdBy.lastName}
          {' · '}Last updated {formatDate(invoice.updatedAt)}
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
