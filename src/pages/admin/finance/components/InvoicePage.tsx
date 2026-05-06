import { useState, useEffect, useCallback } from 'react'
import { getInvoices, deleteInvoice } from '../finance.api'
import type { Invoice } from '../types/finance.types'
import { useToast } from '../../../../context/ToastContext'
import InvoiceList from './InvoiceList'
import InvoiceForm from './InvoiceForm'
import InvoiceDetail from './InvoiceDetail'

// ── View modes ────────────────────────────────────────────────────────────────

type Mode = 'list' | 'create' | 'edit' | 'detail'

// ── Component ─────────────────────────────────────────────────────────────────

const InvoicePage = () => {
  const { showToast } = useToast()

  // ── Data state ──────────────────────────────────────────────────────────────
  const [invoices,  setInvoices]  = useState<Invoice[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [mode,     setMode]     = useState<Mode>('list')
  const [selected, setSelected] = useState<Invoice | null>(null)

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ status: '', search: '' })

  // ── Delete confirm ──────────────────────────────────────────────────────────
  const [deleteTarget,    setDeleteTarget]    = useState<Invoice | null>(null)
  const [deleteConfirm,   setDeleteConfirm]   = useState(false)
  const [deleting,        setDeleting]        = useState(false)

  // ── Fetch invoices ──────────────────────────────────────────────────────────
  const fetchInvoices = useCallback(() => {
    setLoading(true)
    setError(null)
    getInvoices({
      status:    filters.status    || undefined,
      search:    filters.search    || undefined,
    })
      .then(setInvoices)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [filters.status, filters.search])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleView = (inv: Invoice) => {
    setSelected(inv)
    setMode('detail')
  }

  const handleEdit = (inv: Invoice) => {
    setSelected(inv)
    setMode('edit')
  }

  const handleDeleteRequest = (inv: Invoice) => {
    setDeleteTarget(inv)
    setDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await deleteInvoice(deleteTarget.id)
      showToast('success', `Invoice ${deleteTarget.invoiceNo} deleted`)
      setDeleteConfirm(false)
      setDeleteTarget(null)
      fetchInvoices()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to delete invoice')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = (invoice: Invoice) => {
    fetchInvoices()
    setSelected(invoice)
    setMode('detail')
  }

  const handleBackToList = () => {
    setSelected(null)
    setMode('list')
    fetchInvoices()
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header action button (only on list view) ── */}
      {mode === 'list' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={() => setMode('create')}
            style={{
              padding: '10px 18px', borderRadius: '10px', border: 'none',
              backgroundColor: '#1a1a1a', color: '#fff', fontWeight: 500,
              cursor: 'pointer', fontSize: '14px',
            }}
          >
            + New Invoice
          </button>
        </div>
      )}

      {/* ── List view ── */}
      {mode === 'list' && (
        <InvoiceList
          invoices={invoices}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      {/* ── Create form ── */}
      {mode === 'create' && (
        <InvoiceForm
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleBackToList}
        />
      )}

      {/* ── Edit form ── */}
      {mode === 'edit' && selected && (
        <InvoiceForm
          mode="edit"
          invoice={selected}
          onSuccess={handleFormSuccess}
          onCancel={() => { setMode('detail') }}
        />
      )}

      {/* ── Detail view ── */}
      {mode === 'detail' && selected && (
        <InvoiceDetail
          invoice={selected}
          onEdit={() => handleEdit(selected)}
          onBack={handleBackToList}
          onPdfStored={(pdfPath) => {
            // Update the selected invoice in-place so the stored PDF indicator
            // appears immediately without a full refetch.
            setSelected((prev) => prev ? { ...prev, pdfPath } : prev)
          }}
        />
      )}

      {/* ── Delete confirmation dialog ── */}
      {deleteConfirm && deleteTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '28px 32px',
            maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>
              Delete Invoice
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget.invoiceNo}</strong>?
              This action cannot be undone. The linked revenue record will not be affected.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteTarget(null) }}
                disabled={deleting}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: '1px solid #e5e5e5',
                  background: '#fff', color: '#666', fontSize: '13px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{
                  padding: '9px 18px', borderRadius: '8px', border: 'none',
                  background: deleting ? '#999' : '#dc2626', color: '#fff',
                  fontSize: '13px', fontWeight: 500, cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                {deleting ? 'Deleting...' : 'Delete Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoicePage
