import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { approveSelfWork, rejectSelfWork } from '../../utils/api';
import type { Task } from '../../types/task';
import { TaskType, TaskStatus } from '../../types/enums';
import RejectModal from './RejectModal.js';

interface ApprovalActionsProps {
  task: Task;
  onApprove: () => void;
  onReject: () => void;
  canApprove: boolean;
}

const ApprovalActions = ({
  task,
  onApprove,
  onReject,
  canApprove,
}: ApprovalActionsProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Only show buttons for SELF_WORK tasks with PROPOSED status when user can approve
  if (task.type !== TaskType.SELF_WORK || task.status !== TaskStatus.PROPOSED || !canApprove) {
    return null;
  }

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveSelfWork(task.id);
      showToast('success', 'Task approved successfully');
      onApprove();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to approve task');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectClick = () => {
    setShowRejectModal(true);
  };

  const handleRejectSubmit = async () => {
    if (rejectionReason.length < 10) {
      showToast('error', 'Rejection reason must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      await rejectSelfWork(task.id, rejectionReason);
      showToast('success', 'Task rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      onReject();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to reject task');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  return (
    <>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '16px',
      }}>
        <button
          onClick={handleApprove}
          disabled={loading}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            background: loading ? '#9ca3af' : '#10b981',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#10b981';
            }
          }}
        >
          <span>✓</span>
          <span>Approve</span>
        </button>
        <button
          onClick={handleRejectClick}
          disabled={loading}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            background: loading ? '#9ca3af' : '#ef4444',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#dc2626';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = '#ef4444';
            }
          }}
        >
          <span>✗</span>
          <span>Reject</span>
        </button>
      </div>

      <RejectModal
        isOpen={showRejectModal}
        onClose={handleModalClose}
        reason={rejectionReason}
        onReasonChange={setRejectionReason}
        onSubmit={handleRejectSubmit}
        loading={loading}
      />
    </>
  );
};

export default ApprovalActions;
