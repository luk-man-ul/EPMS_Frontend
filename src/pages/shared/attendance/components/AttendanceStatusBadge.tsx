import type { AttendanceStatus } from '../../../../types/enums';

interface Props {
  status: AttendanceStatus;
}

const statusConfig = {
  PRESENT: { bg: '#f0fdf4', color: '#15803d', label: 'Present' },
  ABSENT: { bg: '#fef2f2', color: '#dc2626', label: 'Absent' },
  LATE: { bg: '#fef3c7', color: '#d97706', label: 'Late' },
  HALF_DAY: { bg: '#fef3c7', color: '#d97706', label: 'Half Day' },
  LEAVE: { bg: '#f0f9ff', color: '#0369a1', label: 'Leave' },
  WFH: { bg: '#f5f3ff', color: '#7c3aed', label: 'WFH' },
};

const defaultConfig = {
  bg: '#f5f5f5',
  color: '#666666',
  label: 'Unknown',
};

const AttendanceStatusBadge = ({ status }: Props) => {
  const config = statusConfig[status] || defaultConfig;

  if (!statusConfig[status] && status) {
    console.warn(`[AttendanceStatusBadge] Unexpected status value: "${status}"`);
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

export default AttendanceStatusBadge;
