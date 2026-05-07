/**
 * BrandedInvoicePdfDocument.tsx
 *
 * Professional A4 invoice PDF template using @react-pdf/renderer.
 * Designed to match a standard Indian GST invoice layout.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────┐
 *   │  [LOGO]              TAX INVOICE            │
 *   │  Company Name        Invoice No: INV-YYYY-  │
 *   │  Address             Invoice Date: DD MMM   │
 *   │  GSTIN               Due Date:    DD MMM    │
 *   ├──────────────────────┬──────────────────────┤
 *   │  SELLER              │  BUYER               │
 *   │  Company details     │  Client details      │
 *   ├──────────────────────┴──────────────────────┤
 *   │  # │ Item │ HSN │ Qty │ Rate │ GST │ Total  │
 *   │  1 │ ...  │ —   │  2  │ 500  │  0% │ 1000   │
 *   ├─────────────────────────────────────────────┤
 *   │                        Subtotal:  ₹X,XXX    │
 *   │                        CGST (0%): ₹0        │
 *   │                        SGST (0%): ₹0        │
 *   │                        Discount:  ₹0        │
 *   │                        TOTAL:     ₹X,XXX    │
 *   ├─────────────────────────────────────────────┤
 *   │  Amount in words: Rupees X Thousand Only    │
 *   ├─────────────────────────────────────────────┤
 *   │  Terms & Conditions                         │
 *   │  1. Payment due within 30 days...           │
 *   └─────────────────────────────────────────────┘
 *
 * RULES:
 * - Only @react-pdf/renderer primitives — NO React DOM elements.
 * - All branding comes from companyProfile config — never hardcoded here.
 * - GST/HSN/Discount fields are stubbed at 0 — ready for future implementation.
 */

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Invoice } from '../types/finance.types'
import companyProfile from '../config/companyProfile'

// ── Formatting helpers ────────────────────────────────────────────────────────

const fmt = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const fmtDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

/**
 * Convert a number to Indian words.
 * e.g. 12500 → "Twelve Thousand Five Hundred"
 * Handles up to crores (9,99,99,999).
 */
function numberToWords(n: number): string {
  if (n === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigits(num: number): string {
    if (num < 20) return ones[num]
    return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '')
  }

  function threeDigits(num: number): string {
    if (num < 100) return twoDigits(num)
    return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + twoDigits(num % 100) : '')
  }

  const crore = Math.floor(n / 10000000)
  const lakh  = Math.floor((n % 10000000) / 100000)
  const thou  = Math.floor((n % 100000) / 1000)
  const rest  = n % 1000

  const parts: string[] = []
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh)  parts.push(threeDigits(lakh)  + ' Lakh')
  if (thou)  parts.push(threeDigits(thou)  + ' Thousand')
  if (rest)  parts.push(threeDigits(rest))

  return parts.join(' ')
}

function amountInWords(amount: number): string {
  const rupees = Math.floor(amount)
  const paise  = Math.round((amount - rupees) * 100)
  let result   = 'Rupees ' + numberToWords(rupees)
  if (paise > 0) result += ' and ' + numberToWords(paise) + ' Paise'
  result += ' Only'
  return result
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const ACCENT   = '#1a1a2e'   // dark navy — header background
const ACCENT2  = '#16213e'   // slightly lighter navy — table header
const WHITE    = '#ffffff'
const LIGHT_BG = '#f8f9fa'
const BORDER   = '#dee2e6'
const TEXT_DIM = '#6c757d'
const TEXT_MAIN= '#212529'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Page ──
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_MAIN,
    backgroundColor: WHITE,
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 0,
  },

  // ── Top header band ──
  headerBand: {
    backgroundColor: ACCENT,
    paddingHorizontal: 36,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoBlock: {
    flexDirection: 'column',
    maxWidth: 200,
  },
  logoImage: {
    width: 80,
    height: 40,
    objectFit: 'contain',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    marginBottom: 3,
  },
  companyDetail: {
    fontSize: 8,
    color: '#adb5bd',
    lineHeight: 1.5,
  },
  invoiceTitleBlock: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 2,
    marginBottom: 8,
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  invoiceMetaLabel: {
    fontSize: 8,
    color: '#adb5bd',
    width: 80,
    textAlign: 'right',
  },
  invoiceMetaValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    width: 90,
    textAlign: 'right',
  },

  // ── Seller / Buyer band ──
  partyBand: {
    flexDirection: 'row',
    marginHorizontal: 36,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  partyCol: {
    flex: 1,
    padding: 12,
  },
  partyColRight: {
    flex: 1,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  partyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_MAIN,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 8,
    color: TEXT_DIM,
    lineHeight: 1.5,
  },
  partyGstin: {
    fontSize: 8,
    color: TEXT_MAIN,
    fontFamily: 'Helvetica-Bold',
    marginTop: 4,
  },

  // ── Items table ──
  tableWrapper: {
    marginHorizontal: 36,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: ACCENT2,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  tableRowAlt: {
    backgroundColor: LIGHT_BG,
  },

  // Column widths (flex values)
  cNo:    { width: 24,  fontSize: 8 },
  cDesc:  { flex: 4,    fontSize: 8 },
  cHsn:   { width: 52,  fontSize: 8, textAlign: 'center' },
  cQty:   { width: 36,  fontSize: 8, textAlign: 'right' },
  cRate:  { width: 64,  fontSize: 8, textAlign: 'right' },
  cGst:   { width: 40,  fontSize: 8, textAlign: 'center' },
  cTotal: { width: 72,  fontSize: 8, textAlign: 'right' },

  thText: {
    color: WHITE,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },
  tdText: {
    color: TEXT_MAIN,
    fontSize: 8,
  },
  tdTextBold: {
    color: TEXT_MAIN,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
  },

  // ── Totals section ──
  totalsWrapper: {
    marginHorizontal: 36,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  totalsBox: {
    width: 220,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  totalsLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalsLineTop: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 4,
    paddingTop: 6,
  },
  totalsLabel: {
    fontSize: 8,
    color: TEXT_DIM,
  },
  totalsValue: {
    fontSize: 8,
    color: TEXT_MAIN,
    fontFamily: 'Helvetica-Bold',
  },
  grandLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: ACCENT,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  grandLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  grandValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },

  // ── Amount in words ──
  amountWords: {
    marginHorizontal: 36,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: LIGHT_BG,
  },
  amountWordsLabel: {
    fontSize: 7,
    color: TEXT_DIM,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  amountWordsText: {
    fontSize: 8,
    color: TEXT_MAIN,
    fontFamily: 'Helvetica-Bold',
  },

  // ── Terms & Conditions ──
  termsSection: {
    marginHorizontal: 36,
    marginTop: 14,
  },
  termsLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  termsText: {
    fontSize: 8,
    color: TEXT_DIM,
    lineHeight: 1.6,
  },

  // ── Footer ──
  footer: {
    marginHorizontal: 36,
    marginTop: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    fontSize: 7,
    color: TEXT_DIM,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  signatureLabel: {
    fontSize: 7,
    color: TEXT_DIM,
    marginBottom: 20,  // space for physical signature
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: TEXT_DIM,
    width: 120,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 7,
    color: TEXT_DIM,
    fontFamily: 'Helvetica-Bold',
  },
})

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  invoice: Invoice
}

const BrandedInvoicePdfDocument = ({ invoice }: Props) => {
  const cp = companyProfile

  // GST stubs — 0 until full GST implementation
  const subtotal  = invoice.totalAmount
  const cgst      = 0
  const sgst      = 0
  const discount  = 0
  const grandTotal = subtotal + cgst + sgst - discount

  // Terms: use invoice.notes if provided, otherwise fall back to company default
  const terms = invoice.notes?.trim() || cp.termsAndConditions

  return (
    <Document
      title={invoice.invoiceNo}
      author={cp.companyName}
      subject={`Tax Invoice — ${invoice.clientName}`}
      creator="EMPS Finance"
    >
      <Page size="A4" style={s.page}>

        {/* ══════════════════════════════════════════════════
            HEADER BAND — Company + Invoice title
        ══════════════════════════════════════════════════ */}
        <View style={s.headerBand}>

          {/* Left: Logo + Company details */}
          <View style={s.logoBlock}>
            {cp.logoUrl ? (
              <Image src={cp.logoUrl} style={s.logoImage} />
            ) : null}
            <Text style={s.companyName}>{cp.companyName}</Text>
            <Text style={s.companyDetail}>{cp.address}</Text>
            {cp.gstin ? (
              <Text style={[s.companyDetail, { marginTop: 4, fontFamily: 'Helvetica-Bold', color: '#ced4da' }]}>
                GSTIN: {cp.gstin}
              </Text>
            ) : null}
            {cp.phone ? (
              <Text style={[s.companyDetail, { marginTop: 2 }]}>Ph: {cp.phone}</Text>
            ) : null}
            {cp.email ? (
              <Text style={s.companyDetail}>{cp.email}</Text>
            ) : null}
          </View>

          {/* Right: TAX INVOICE title + invoice meta */}
          <View style={s.invoiceTitleBlock}>
            <Text style={s.invoiceTitle}>TAX INVOICE</Text>

            <View style={s.invoiceMeta}>
              <Text style={s.invoiceMetaLabel}>Invoice No</Text>
              <Text style={s.invoiceMetaValue}>{invoice.invoiceNo}</Text>
            </View>
            <View style={s.invoiceMeta}>
              <Text style={s.invoiceMetaLabel}>Invoice Date</Text>
              <Text style={s.invoiceMetaValue}>{fmtDate(invoice.issueDate)}</Text>
            </View>
            <View style={s.invoiceMeta}>
              <Text style={s.invoiceMetaLabel}>Due Date</Text>
              <Text style={s.invoiceMetaValue}>{fmtDate(invoice.dueDate)}</Text>
            </View>
            <View style={s.invoiceMeta}>
              <Text style={s.invoiceMetaLabel}>Project</Text>
              <Text style={s.invoiceMetaValue}>{invoice.project.name}</Text>
            </View>
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            SELLER / BUYER SECTION
        ══════════════════════════════════════════════════ */}
        <View style={s.partyBand}>

          {/* Seller (company) */}
          <View style={s.partyCol}>
            <Text style={s.partyLabel}>Seller / From</Text>
            <Text style={s.partyName}>{cp.companyName}</Text>
            <Text style={s.partyDetail}>{cp.address}</Text>
            {cp.gstin ? (
              <Text style={s.partyGstin}>GSTIN: {cp.gstin}</Text>
            ) : null}
          </View>

          {/* Buyer (client) */}
          <View style={s.partyColRight}>
            <Text style={s.partyLabel}>Buyer / Bill To</Text>
            <Text style={s.partyName}>{invoice.clientName}</Text>
            {invoice.clientAddress ? (
              <Text style={s.partyDetail}>{invoice.clientAddress}</Text>
            ) : null}
            {invoice.clientGSTIN ? (
              <Text style={s.partyGstin}>GSTIN: {invoice.clientGSTIN}</Text>
            ) : null}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════
            ITEMS TABLE
        ══════════════════════════════════════════════════ */}
        <View style={s.tableWrapper}>

          {/* Table header */}
          <View style={s.tableHead}>
            <Text style={[s.cNo,    s.thText]}>#</Text>
            <Text style={[s.cDesc,  s.thText]}>Item / Description</Text>
            <Text style={[s.cHsn,   s.thText]}>HSN</Text>
            <Text style={[s.cQty,   s.thText]}>Qty</Text>
            <Text style={[s.cRate,  s.thText]}>Rate</Text>
            <Text style={[s.cGst,   s.thText]}>GST</Text>
            <Text style={[s.cTotal, s.thText]}>Amount</Text>
          </View>

          {/* Table rows */}
          {invoice.items.map((item, idx) => (
            <View
              key={idx}
              style={[s.tableRow, idx % 2 === 1 ? s.tableRowAlt : {}]}
            >
              <Text style={[s.cNo,    s.tdText]}>{idx + 1}</Text>
              <Text style={[s.cDesc,  s.tdText]}>{item.description}</Text>
              <Text style={[s.cHsn,   s.tdText, { textAlign: 'center' }]}>—</Text>
              <Text style={[s.cQty,   s.tdText]}>{item.quantity}</Text>
              <Text style={[s.cRate,  s.tdText]}>{fmt(item.unitPrice)}</Text>
              <Text style={[s.cGst,   s.tdText]}>0%</Text>
              <Text style={[s.cTotal, s.tdTextBold]}>{fmt(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════
            TOTALS
        ══════════════════════════════════════════════════ */}
        <View style={s.totalsWrapper}>
          <View style={s.totalsBox}>
            <View style={s.totalsLine}>
              <Text style={s.totalsLabel}>Subtotal</Text>
              <Text style={s.totalsValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.totalsLine}>
              <Text style={s.totalsLabel}>CGST (0%)</Text>
              <Text style={s.totalsValue}>{fmt(cgst)}</Text>
            </View>
            <View style={s.totalsLine}>
              <Text style={s.totalsLabel}>SGST (0%)</Text>
              <Text style={s.totalsValue}>{fmt(sgst)}</Text>
            </View>
            <View style={s.totalsLine}>
              <Text style={s.totalsLabel}>Discount</Text>
              <Text style={s.totalsValue}>— {fmt(discount)}</Text>
            </View>
          </View>
        </View>

        {/* Grand total band */}
        <View style={[s.grandLine, { marginHorizontal: 36 }]}>
          <Text style={s.grandLabel}>TOTAL AMOUNT</Text>
          <Text style={s.grandValue}>{fmt(grandTotal)}</Text>
        </View>

        {/* ══════════════════════════════════════════════════
            AMOUNT IN WORDS
        ══════════════════════════════════════════════════ */}
        <View style={s.amountWords}>
          <Text style={s.amountWordsLabel}>Amount in Words</Text>
          <Text style={s.amountWordsText}>{amountInWords(grandTotal)}</Text>
        </View>

        {/* ══════════════════════════════════════════════════
            TERMS & CONDITIONS
        ══════════════════════════════════════════════════ */}
        <View style={s.termsSection}>
          <Text style={s.termsLabel}>Terms &amp; Conditions</Text>
          <Text style={s.termsText}>{terms}</Text>
        </View>

        {/* ══════════════════════════════════════════════════
            FOOTER — tagline + authorised signature
        ══════════════════════════════════════════════════ */}
        <View style={s.footer}>
          <View>
            {cp.footerTagline ? (
              <Text style={s.footerLeft}>{cp.footerTagline}</Text>
            ) : null}
            <Text style={[s.footerLeft, { marginTop: 4 }]}>
              Generated by EMPS Finance  ·  {fmtDate(invoice.updatedAt)}
            </Text>
          </View>

          <View style={s.footerRight}>
            <Text style={s.signatureLabel}>For {cp.companyName}</Text>
            <View style={s.signatureLine} />
            <Text style={s.signatureName}>Authorised Signatory</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
}

export default BrandedInvoicePdfDocument
