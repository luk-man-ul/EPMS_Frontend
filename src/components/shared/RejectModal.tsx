import { useEffect } from 'react';

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

const RejectModal = ({
  isOpen,
  onClose,
  reason,
  onReasonChange,
  onSubmit,
  loading,
}: RejectModalProps) => {
  const minLength = 10;
  const isReasonValid = reason.length >= minLength;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
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
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '540px',
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '12px',
          letterSpacing: '-0.01em',
        }}>
          Reject Self-Work Proposal
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#666666',
          lineHeight: '1.6',
          marginBottom: '20px',
        }}>
          Please provide a reason for rejecting this task proposal. This will help the employee understand your decision.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#333333',
            marginBottom: '8px',
          }}>
            Rejection Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter the reason for rejection (minimum 10 characters)..."
            disabled={loading}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: `1px solid ${!isReasonValid && reason.length > 0 ? '#ef4444' : '#e5e5e5'}`,
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1a1a1a',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5',
              transition: 'border-color 0.2s ease',
              outline: 'none',
              background: loading ? '#f9fafb' : '#ffffff',
              cursor: loading ? 'not-allowed' : 'text',
            }}
            onFocus={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#3b82f6';
              }
            }}
            onBlur={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = !isReasonValid && reason.length > 0 ? '#ef4444' : '#e5e5e5';
              }
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
          }}>
            <span style={{
              fontSize: '12px',
              color: !isReasonValid && reason.length > 0 ? '#ef4444' : '#999999',
            }}>
              {!isReasonValid && reason.length > 0 
                ? `${minLength - reason.length} more characters required`
                : `${reason.length} / ${minLength} minimum characters`
              }
            </span>
            <span style={{
              fontSize: '12px',
              color: '#999999',
            }}>
              {reason.length} characters
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              background: '#ffffff',
              color: '#666666',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.borderColor = '#d4d4d4';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!isReasonValid || loading}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '10px',
              background: !isReasonValid || loading ? '#9ca3af' : '#ef4444',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: !isReasonValid || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (isReasonValid && !loading) {
                e.currentTarget.style.background = '#dc2626';
              }
            }}
            onMouseLeave={(e) => {
              if (isReasonValid && !loading) {
                e.currentTarget.style.background = '#ef4444';
              }
            }}
          >
            {loading ? 'Rejecting...' : 'Reject Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
