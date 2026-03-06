import type { LeaveType } from '../../../../types/enums';

interface Props {
  type: LeaveType;
}

const typeConfig = {
  SICK: { bg: '#fef2f2', color: '#dc2626', label: 'Sick Leave' },
  CASUAL: { bg: '#f0f9ff', color: '#0369a1', label: 'Casual Leave' },
  VACATION: { bg: '#f0fdf4', color: '#15803d', label: 'Vacation' },
  UNPAID: { bg: '#f5f5f5', color: '#666666', label: 'Unpaid Leave' },
};

const defaultConfig = {
  bg: '#f5f5f5',
  color: '#666666',
  label: 'Unknown',
};

const LeaveTypeBadge = ({ type }: Props) => {
  const config = typeConfig[type] || defaultConfig;

  if (!typeConfig[type] && type) {
    console.warn(`[LeaveTypeBadge] Unexpected type value: "${type}"`);
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

export default LeaveTypeBadge;
