import type { ApprovalStatus } from '../../../../types/enums';

interface Props {
  status: ApprovalStatus;
}

const statusConfig = {
  PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  APPROVED: { bg: '#f0fdf4', color: '#15803d', label: 'Approved' },
  REJECTED: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
};

const defaultConfig = {
  bg: '#f5f5f5',
  color: '#666666',
  label: 'Unknown',
};

const LeaveStatusBadge = ({ status }: Props) => {
  const config = statusConfig[status] || defaultConfig;

  if (!statusConfig[status] && status) {
    console.warn(`[LeaveStatusBadge] Unexpected status value: "${status}"`);
  }

  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
        border: '1px solid #e5e5e5',
      }}
    >
      {config.label}
    </span>
  );
};

export default LeaveStatusBadge;
