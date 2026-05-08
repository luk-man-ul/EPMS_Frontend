import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import LeaveStatusBadge from './components/LeaveStatusBadge';
import LeaveTypeBadge from './components/LeaveTypeBadge';
import { Button, Card, Input, Select, Modal, LoadingSpinner } from '../../../components/ui';

const LeaveApprovalManagementPage = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, [filters]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      
      // Build params object with only non-empty values
      const params: any = {
        page: filters.page,
        limit: filters.limit,
      };
      
      // Only add filter params if they have valid values
      if (filters.status && filters.status !== '') {
        params.status = filters.status;
      }
      if (filters.type && filters.type !== '') {
        params.type = filters.type;
      }
      if (filters.startDate && filters.startDate !== '') {
        params.startDate = filters.startDate;
      }
      if (filters.endDate && filters.endDate !== '') {
        params.endDate = filters.endDate;
      }
      
      const response = await api.get('/leave', { params });
      setLeaveRequests(response.data.data);
      setPagination({
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
        totalPages: response.data.totalPages,
      });
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      setActionLoading(leaveId);
      await api.patch(`/leave/${leaveId}/approve`, {});
      await fetchLeaveRequests();
    } catch (err: any) {
      console.error('Error approving leave:', err);
      alert(err.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (leaveId: string) => {
    setSelectedLeaveId(leaveId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedLeaveId) return;

    try {
      setActionLoading(selectedLeaveId);
      await api.patch(`/leave/${selectedLeaveId}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedLeaveId(null);
      await fetchLeaveRequests();
    } catch (err: any) {
      console.error('Error rejecting leave:', err);
      alert(err.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(null);
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '8px',
        }}
      >
        Leave Approvals
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Review and manage leave requests
      </p>

      {/* Filters */}
      <Card padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Select
            label="Status"
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value as string, page: 1 })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />

          <Select
            label="Leave Type"
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value as string, page: 1 })}
            options={[
              { value: '', label: 'All Types' },
              { value: 'SICK', label: 'Sick' },
              { value: 'CASUAL', label: 'Casual' },
              { value: 'VACATION', label: 'Vacation' },
              { value: 'UNPAID', label: 'Unpaid' },
            ]}
          />

          <Input
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(value) => setFilters({ ...filters, startDate: value, page: 1 })}
          />

          <Input
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(value) => setFilters({ ...filters, endDate: value, page: 1 })}
          />
        </div>
      </Card>

      {/* Table */}
      <div style={{ marginTop: '16px' }}>
      <Card padding="none">
        {loading ? (
          <div style={{ padding: '48px' }}>
            <LoadingSpinner text="Loading leave requests..." />
          </div>
        ) : leaveRequests.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#666666' }}>
            No leave requests found
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Employee
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Type
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Date Range
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Reason
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((leave) => (
                <tr key={leave.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                    <div style={{ fontWeight: 500 }}>
                      {leave.user?.firstName} {leave.user?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {leave.user?.email}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <LeaveTypeBadge type={leave.type} />
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937' }}>
                    <div>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                      {calculateDays(leave.startDate, leave.endDate)} days
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', maxWidth: '300px' }}>
                    {leave.reason}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <LeaveStatusBadge status={leave.status} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    {leave.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApprove(leave.id)}
                          loading={actionLoading === leave.id}
                          disabled={actionLoading === leave.id}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectClick(leave.id)}
                          disabled={actionLoading === leave.id}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {leave.approvedBy ? `By ${leave.approvedBy.firstName} ${leave.approvedBy.lastName}` : '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
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

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
        }}
        title="Reject Leave Request"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectConfirm}
              loading={actionLoading !== null}
              disabled={actionLoading !== null}
            >
              Reject
            </Button>
          </div>
        }
      >
        <Input
          type="textarea"
          label="Reason (Optional)"
          value={rejectReason}
          onChange={(value) => setRejectReason(value)}
          placeholder="Enter reason for rejection..."
          rows={4}
        />
      </Modal>
    </div>
  );
};

export default LeaveApprovalManagementPage;
