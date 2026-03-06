import LeaveStatusBadge from './LeaveStatusBadge';
import LeaveTypeBadge from './LeaveTypeBadge';
import type { LeaveType, ApprovalStatus } from '../../../../types/enums';

interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: ApprovalStatus;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  } | null;
}

interface LeaveTableProps {
  data: LeaveRequest[];
  showUserColumn?: boolean;
}

const LeaveTable = ({ data, showUserColumn = false }: LeaveTableProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  const getDateRange = (startDate: string, endDate: string) => {
    const days = calculateDays(startDate, endDate);
    return `${formatDate(startDate)} - ${formatDate(endDate)} (${days} ${days === 1 ? 'day' : 'days'})`;
  };

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}
        >
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Type
              </th>
              {showUserColumn && (
                <th
                  style={{
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Employee
                </th>
              )}
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Date Range
              </th>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Reason
              </th>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: '16px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Approved By
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((leave) => (
              <tr
                key={leave.id}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '16px' }}>
                  <LeaveTypeBadge type={leave.type} />
                </td>
                {showUserColumn && leave.user && (
                  <td
                    style={{
                      padding: '16px',
                      fontSize: '14px',
                      color: '#1a1a1a',
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>
                      {leave.user.firstName} {leave.user.lastName}
                    </div>
                    {leave.user.department && (
                      <div style={{ fontSize: '12px', color: '#666666', marginTop: '2px' }}>
                        {leave.user.department}
                      </div>
                    )}
                  </td>
                )}
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666666',
                  }}
                >
                  {getDateRange(leave.startDate, leave.endDate)}
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    maxWidth: '300px',
                  }}
                >
                  {leave.reason}
                </td>
                <td style={{ padding: '16px' }}>
                  <LeaveStatusBadge status={leave.status} />
                </td>
                <td
                  style={{
                    padding: '16px',
                    fontSize: '14px',
                    color: '#666666',
                  }}
                >
                  {leave.approvedBy
                    ? `${leave.approvedBy.firstName} ${leave.approvedBy.lastName}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999999',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏖️</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No leave requests found
          </div>
          <div style={{ fontSize: '14px' }}>
            Leave requests will appear here once submitted
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTable;
