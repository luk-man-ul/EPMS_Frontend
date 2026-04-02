import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button, Card, Select, LoadingSpinner } from '../../../components/ui';
import { useToast } from '../../../context/ToastContext';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:  { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  APPROVED: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2', label: 'Rejected' },
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const WfhManagementPage = () => {
  const { showToast } = useToast();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = { page: filters.page, limit: filters.limit };
      if (filters.status) params.status = filters.status;
      const response = await api.get('/wfh-requests', { params });
      const data = response.data;
      setRequests(data.data || []);
      setPagination({
        total: data.total || 0,
        page: data.page || 1,
        limit: data.limit || 10,
        totalPages: data.totalPages || 0,
      });
    } catch (err: any) {
      console.error('Error fetching WFH requests:', err);
      showToast('error', 'Failed to load WFH requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setActionLoading(id);
      await api.patch(`/wfh-requests/${id}/status`, { status });
      showToast('success', `WFH request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      await fetchRequests();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const setStatusFilter = (value: string) => {
    setFilters({ ...filters, status: value, page: 1 });
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
        WFH Requests
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Review and manage Work From Home requests
      </p>

      {/* Filters */}
      <Card padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Select
            label="Status"
            value={filters.status}
            onChange={(value) => setStatusFilter(value as string)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        {loading ? (
          <div style={{ padding: '48px' }}>
            <LoadingSpinner text="Loading WFH requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No WFH requests found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                {['Employee', 'From Date', 'To Date', 'Reason', 'Status', 'Submitted', 'Actions'].map((h) => (
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
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {formatDate(req.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {req.status === 'PENDING' ? (
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
                      ) : (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {req.approvedBy
                            ? `By ${req.approvedBy.firstName} ${req.approvedBy.lastName}`
                            : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
          >
            Previous
          </Button>
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#374151' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default WfhManagementPage;
