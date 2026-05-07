/**
 * companyProfile.ts
 *
 * Single source of truth for company branding used in PDF invoices.
 * Update this file to change company details across all generated PDFs.
 *
 * DO NOT hardcode these values inside the PDF template.
 */

export interface CompanyProfile {
  /** Display name printed on the invoice */
  companyName: string
  /** Multi-line address — use \n for line breaks */
  address: string
  /** GST Identification Number */
  gstin: string
  /** Contact phone (optional) */
  phone?: string
  /** Contact email (optional) */
  email?: string
  /** Website URL (optional) */
  website?: string
  /**
   * Path to logo image relative to the public/ directory.
   * Must be a URL-accessible path at runtime (e.g. '/logo.png').
   * Set to null to render a text-only header.
   *
   * For @react-pdf/renderer, use an absolute URL or a base64 data URI.
   * Example: import logoUrl from '../assets/logo.png'  (Vite handles this)
   */
  logoUrl: string | null
  /**
   * Default terms & conditions text printed at the bottom of every invoice.
   * invoice.notes overrides this per-invoice when provided.
   */
  termsAndConditions: string
  /**
   * Optional footer tagline printed below terms.
   */
  footerTagline?: string
}

const companyProfile: CompanyProfile = {
  companyName:  'Altezzai LLP',
  address:      '306, Students Amenities Centre, \n Innovation and Incubation Foundation (KU-IIF), \n Thavakkara, Kannur University Campus, \n Kannur, 670002',
  gstin:        '',
  phone:        '+91 9562937970',
  email:        'billing@Altezzai.com',
  website:      'www.Altezzai.com',
  logoUrl:      '/logo.png',   // set to '/logo.png' or a base64 data URI when logo is available
  termsAndConditions:
    '1. Payment is due within 30 days of the invoice date.\n' +
    '2. Please include the invoice number in your payment reference.\n' +
    '3. Goods once sold will not be taken back.\n' +
    '4. Interest @ 18% p.a. will be charged on overdue amounts.',
  footerTagline: 'Thank you for your business!',
}

export default companyProfile
