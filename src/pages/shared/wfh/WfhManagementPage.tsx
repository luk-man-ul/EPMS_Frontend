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
  const [filters, setFilters] = useState({ status: '', fromDate: '', toDate: '', page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = { page: filters.page, limit: filters.limit };
      if (filters.status) params.status = filters.status;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
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

  const clearFilters = () => {
    setFilters({ status: '', fromDate: '', toDate: '', page: 1, limit: 10 });
  };

  const hasActiveFilters = filters.status || filters.fromDate || filters.toDate;

  return (
    <div style={{ width: '100%' }}>
      <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
        WFH Requests
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Review and manage Work From Home requests
      </p>

      {/* Filters */}
      <div style={isMobile ? {
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px',
        marginBottom: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '16px',
      } : {
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: isMobile ? '0' : '180px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              color: '#1a1a1a',
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
              width: '100%',
            }}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: isMobile ? '0' : '160px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From Date</label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              color: '#1a1a1a',
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: isMobile ? '0' : '160px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Date</label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              color: '#1a1a1a',
              background: '#fff',
              cursor: 'pointer',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
              width: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ marginTop: '16px' }}>
      <Card padding={isMobile ? 'none' : undefined} style={isMobile ? { border: 'none', background: 'transparent', boxShadow: 'none' } : undefined}>
        {loading ? (
          <div style={{ padding: '48px' }}>
            <LoadingSpinner text="Loading WFH requests..." />
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No WFH requests found
          </div>
        ) : isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((req) => {
              const s = statusConfig[req.status] || statusConfig.PENDING;
              return (
                <div
                  key={req.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '16px',
                    border: '1px solid #f0f0f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {/* Header: Employee Name & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#1f2937' }}>
                        {req.user?.firstName} {req.user?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {req.user?.email}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </div>

                  {/* Dates & Reason */}
                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#888' }}>From Date</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginTop: '2px' }}>
                          {formatDate(req.fromDate)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#888' }}>To Date</div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginTop: '2px' }}>
                          {formatDate(req.toDate)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', color: '#888' }}>Reason</div>
                      <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {req.reason}
                      </div>
                    </div>
                  </div>

                  {/* Footer/Actions */}
                  <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>
                      Submitted: {formatDate(req.createdAt)}
                    </span>
                    <div>
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
                        <span style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>
                          {req.approvedBy
                            ? `By ${req.approvedBy.firstName} ${req.approvedBy.lastName}`
                            : '—'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
      </div>

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
