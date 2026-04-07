import type { AttendanceStatus } from '../../../../types/enums';

interface Props {
  status: AttendanceStatus | string;
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  PRESENT:  { bg: '#dcfce7', color: '#15803d', label: 'Present' },
  ABSENT:   { bg: '#fee2e2', color: '#b91c1c', label: 'Absent' },
  LATE:     { bg: '#ffedd5', color: '#c2410c', label: 'Late' },
  HALF_DAY: { bg: '#fef9c3', color: '#a16207', label: 'Half Day' },
  LEAVE:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Leave' },
  WFH:      { bg: '#ede9fe', color: '#6d28d9', label: 'WFH' },
};

const AttendanceStatusBadge = ({ status }: Props) => {
  const config = statusConfig[status] ?? { bg: '#f3f4f6', color: '#6b7280', label: status ?? 'Unknown' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 12px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
};

export default AttendanceStatusBadge;
