import type { WorkApprovalStatus } from '../../types/workApproval.types'

type ActionButtonsProps = {
  status: WorkApprovalStatus
  onApprove: () => void
  onReject: () => void
  onConvertToTask: () => void
  onSendFeedback: () => void
  loading?: boolean
}

const ActionButtons = ({
  status,
  onApprove,
  onReject,
  onConvertToTask,
  onSendFeedback,
  loading = false,
}: ActionButtonsProps) => {
  const isPending = status === 'pending'

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      padding: '24px',
      position: 'sticky',
      top: '24px',
    }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        color: '#1a1a1a',
        marginBottom: '20px',
      }}>
        Actions
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {/* Approve Button */}
        <button
          onClick={onApprove}
          disabled={!isPending || loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: isPending && !loading ? '#10b981' : '#e5e5e5',
            color: isPending && !loading ? '#ffffff' : '#999999',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isPending && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (isPending && !loading) e.currentTarget.style.background = '#059669'
          }}
          onMouseLeave={(e) => {
            if (isPending && !loading) e.currentTarget.style.background = '#10b981'
          }}
        >
          <span>✓</span>
          <span>{loading ? 'Processing...' : 'Approve'}</span>
        </button>

        {/* Reject Button */}
        <button
          onClick={onReject}
          disabled={!isPending || loading}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: isPending && !loading ? '#ef4444' : '#e5e5e5',
            color: isPending && !loading ? '#ffffff' : '#999999',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isPending && !loading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (isPending && !loading) e.currentTarget.style.background = '#dc2626'
          }}
          onMouseLeave={(e) => {
            if (isPending && !loading) e.currentTarget.style.background = '#ef4444'
          }}
        >
          <span>✕</span>
          <span>{loading ? 'Processing...' : 'Reject'}</span>
        </button>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: '#e5e5e5',
          margin: '8px 0',
        }} />

        {/* Convert to Task Button */}
        <button
          onClick={onConvertToTask}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: '#ffffff',
            color: '#3b82f6',
            border: '1px solid #3b82f6',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#3b82f6'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = '#3b82f6'
          }}
        >
          <span>🔄</span>
          <span>Convert to Task</span>
        </button>

        {/* Send Feedback Button */}
        <button
          onClick={onSendFeedback}
          style={{
            width: '100%',
            padding: '14px 20px',
            background: '#ffffff',
            color: '#6366f1',
            border: '1px solid #6366f1',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6366f1'
            e.currentTarget.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = '#6366f1'
          }}
        >
          <span>💬</span>
          <span>Send Feedback</span>
        </button>
      </div>

      {/* Info Box */}
      {!isPending && (
        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
        }}>
          <div style={{
            fontSize: '13px',
            color: '#666666',
            lineHeight: '1.5',
          }}>
            <strong>Note:</strong> This work has already been {status}. 
            Approval actions are disabled.
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionButtons
