import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Card, LoadingSpinner } from '../../../components/ui';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:  { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  APPROVED: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2', label: 'Rejected' },
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const MyWfhPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wfh-requests/my');
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching WFH requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
          My WFH Requests
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          View all your Work From Home requests and their approval status
        </p>
      </div>

      {loading ? (
        <Card>
          <LoadingSpinner text="Loading WFH requests..." />
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No WFH requests yet
          </div>
        </Card>
      ) : (
        <Card padding="none">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                {['From Date', 'To Date', 'Reason', 'Status', 'Submitted'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const s = statusConfig[req.status] || statusConfig.PENDING;
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      {formatDate(req.fromDate)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      {formatDate(req.toDate)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937', maxWidth: '320px' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {formatDate(req.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};

export default MyWfhPage;
