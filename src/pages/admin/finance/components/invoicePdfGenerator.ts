/**
 * invoicePdfGenerator.ts
 *
 * Dynamically imported PDF generation helper — intentionally isolated so that
 * @react-pdf/renderer and the two PDF document components are excluded from
 * the initial application bundle and only loaded when the user triggers a
 * PDF action (download or save-to-server).
 *
 * This module is the ONLY place that imports @react-pdf/renderer at runtime.
 * InvoiceDetail.tsx imports this file via dynamic import() inside click handlers.
 */

import { pdf } from '@react-pdf/renderer'
import type { Invoice } from '../types/finance.types'

/**
 * Generate a PDF Blob for the given invoice.
 * Uses BrandedInvoicePdfDocument — the production-grade A4 TAX INVOICE template.
 */
export async function generateInvoicePdfBlob(invoice: Invoice): Promise<Blob> {
  // Dynamic import of the document component — keeps it out of the initial chunk
  const { default: BrandedInvoicePdfDocument } = await import('./BrandedInvoicePdfDocument')
  const { createElement } = await import('react')

  const doc = createElement(BrandedInvoicePdfDocument, { invoice })
  return pdf(doc).toBlob()
}
