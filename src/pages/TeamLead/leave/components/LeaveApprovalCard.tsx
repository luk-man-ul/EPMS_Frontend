import { useState } from 'react';
import axios from 'axios';
import LeaveTypeBadge from '../../../shared/leave/components/LeaveTypeBadge';
import type { LeaveType } from '../../../../types/enums';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface LeaveRequest {
  id: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
  };
}

interface LeaveApprovalCardProps {
  leave: LeaveRequest;
  onUpdate: () => void;
}

const LeaveApprovalCard = ({ leave, onUpdate }: LeaveApprovalCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this leave request?')) return;

    try {
      setLoading(true);
      await api.patch(`/leave/${leave.id}/approve`);
      alert('Leave request approved successfully!');
      onUpdate();
    } catch (err: any) {
      console.error('Error approving leave:', err);
      alert(err.response?.data?.message || 'Failed to approve leave request');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    try {
      setLoading(true);
      await api.patch(`/leave/${leave.id}/reject`, { reason: rejectReason || undefined });
      alert('Leave request rejected successfully!');
      setShowRejectModal(false);
      setRejectReason('');
      onUpdate();
    } catch (err: any) {
      console.error('Error rejecting leave:', err);
      alert(err.response?.data?.message || 'Failed to reject leave request');
    } finally {
      setLoading(false);
    }
  };

  const days = calculateDays(leave.startDate, leave.endDate);

  return (
    <>
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '20px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
      >
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>
                {leave.user.firstName} {leave.user.lastName}
              </div>
              <div style={{ fontSize: '13px', color: '#666666' }}>{leave.user.email}</div>
              {leave.user.department && (
                <div style={{ fontSize: '13px', color: '#666666', marginTop: '2px' }}>
                  {leave.user.department}
                </div>
              )}
            </div>
            <LeaveTypeBadge type={leave.type} />
          </div>
        </div>

        <div
          style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
          }}
        >
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Date Range</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
          </div>
          <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>
            {days} {days === 1 ? 'day' : 'days'}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Reason</div>
          <div style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: '1.5' }}>{leave.reason}</div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#666666' }}>
            Requested on {formatDate(leave.createdAt)}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleApprove}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#d1d5db' : '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#059669';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#10b981';
            }}
          >
            {loading ? 'Processing...' : '✅ Approve'}
          </button>
          <button
            onClick={handleRejectClick}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#d1d5db' : '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = '#dc2626';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = '#ef4444';
            }}
          >
            {loading ? 'Processing...' : '❌ Reject'}
          </button>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '16px',
              }}
            >
              Reject Leave Request
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#666666',
                marginBottom: '16px',
              }}
            >
              Optionally provide a reason for rejecting this leave request:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason (optional)..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '16px',
              }}
            />
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  background: loading ? '#d1d5db' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveApprovalCard;
