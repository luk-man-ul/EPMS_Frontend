import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button, Card, LoadingSpinner } from '../../../components/ui';
import { useToast } from '../../../context/ToastContext';

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const WfhApprovalPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wfh-requests/pending');
      setRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching pending WFH requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(id);
      await api.patch(`/wfh-requests/${id}/status`, { status });
      showToast('success', `WFH request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      // Refresh the pending list so the actioned item disappears cleanly
      await fetchPending();
    } catch (err: any) {
      console.error(`Error ${status.toLowerCase()} WFH request:`, err);
      showToast('error', err.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
        WFH Approvals
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Review and manage Work From Home requests
      </p>

      <Card padding="none">
        {loading ? (
          <div style={{ padding: '48px' }}>
            <LoadingSpinner text="Loading WFH requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No pending WFH requests
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                {['Employee', 'From Date', 'To Date', 'Reason', 'Submitted', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                    <div style={{ fontWeight: 500 }}>
                      {req.user?.firstName} {req.user?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {req.user?.email}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                    {formatDate(req.fromDate)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                    {formatDate(req.toDate)}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937', maxWidth: '280px' }}>
                    {req.reason}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {formatDate(req.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAction(req.id, 'APPROVED')}
                        loading={actionLoading === req.id}
                        disabled={actionLoading === req.id}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleAction(req.id, 'REJECTED')}
                        disabled={actionLoading === req.id}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};

export default WfhApprovalPage;
