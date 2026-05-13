// ReportFilters is kept minimal — each report tab manages its own filters internally.
// This component is intentionally left as a no-op wrapper for future use.

interface Props {
  onFilterChange: (filters: any) => void
}

const ReportFilters = ({ onFilterChange: _onFilterChange }: Props) => {
  return null
}

export default ReportFilters
