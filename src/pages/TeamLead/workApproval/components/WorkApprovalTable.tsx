import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { approveSelfWork, rejectSelfWork } from '../../../../utils/api'
import type { WorkApproval } from '../types/workApproval.types'

type WorkApprovalTableProps = {
  approvals: WorkApproval[]
  onRefresh: () => void
}

const WorkApprovalTable = ({ approvals, onRefresh }: WorkApprovalTableProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Determine base path from current location
  const basePath = location.pathname.includes('/admin/') ? '/admin' : '/teamlead'

  const handleApprove = async (taskId: string) => {
    if (!confirm('Are you sure you want to approve this self-work task?')) return
    
    try {
      setActionLoading(taskId)
      await approveSelfWork(taskId)
      alert('Self-work task approved successfully!')
      onRefresh()
    } catch (err: any) {
      console.error('Error approving task:', err)
      alert(err.response?.data?.message || 'Failed to approve task')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (taskId: string) => {
    setShowRejectModal(taskId)
    setRejectReason('')
  }

  const handleRejectSubmit = async () => {
    if (!showRejectModal) return
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(showRejectModal)
      await rejectSelfWork(showRejectModal, rejectReason)
      alert('Self-work task rejected successfully!')
      setShowRejectModal(null)
      setRejectReason('')
      onRefresh()
    } catch (err: any) {
      console.error('Error rejecting task:', err)
      alert(err.response?.data?.message || 'Failed to reject task')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
      approved: { bg: '#d1fae5', color: '#065f46', text: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' },
    }

    const style = styles[status as keyof typeof styles] || styles.pending

    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 500,
        background: style.bg,
        color: style.color,
      }}>
        {style.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Work ID
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Employee Name
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Project
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Work Title
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Submitted Date
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Estimated Time
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'left',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Status
              </th>
              <th style={{
                padding: '16px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr 
                key={approval.id}
                style={{
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#3b82f6',
                  fontWeight: 500,
                }}>
                  {approval.id}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontWeight: 500,
                }}>
                  {approval.employeeName}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666666',
                }}>
                  {approval.project}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  maxWidth: '300px',
                }}>
                  {approval.workTitle}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666666',
                }}>
                  {formatDate(approval.submittedDate)}
                </td>
                <td style={{
                  padding: '16px',
                  fontSize: '14px',
                  color: '#666666',
                }}>
                  {approval.estimatedTime}
                </td>
                <td style={{ padding: '16px' }}>
                  {getStatusBadge(approval.status)}
                </td>
                <td style={{
                  padding: '16px',
                  textAlign: 'center',
                }}>
                  {approval.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApprove(approval.id)
                        }}
                        disabled={actionLoading === approval.id}
                        style={{
                          padding: '8px 16px',
                          background: actionLoading === approval.id ? '#d1d5db' : '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: actionLoading === approval.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (actionLoading !== approval.id) e.currentTarget.style.background = '#059669'
                        }}
                        onMouseLeave={(e) => {
                          if (actionLoading !== approval.id) e.currentTarget.style.background = '#10b981'
                        }}
                      >
                        {actionLoading === approval.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRejectClick(approval.id)
                        }}
                        disabled={actionLoading === approval.id}
                        style={{
                          padding: '8px 16px',
                          background: actionLoading === approval.id ? '#d1d5db' : '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: actionLoading === approval.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (actionLoading !== approval.id) e.currentTarget.style.background = '#dc2626'
                        }}
                        onMouseLeave={(e) => {
                          if (actionLoading !== approval.id) e.currentTarget.style.background = '#ef4444'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`${basePath}/work-approval/${approval.id}`)}
                      style={{
                        padding: '8px 16px',
                        background: '#1a1a1a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#333333'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {approvals.length === 0 && (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          color: '#999999',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No work approvals found
          </div>
          <div style={{ fontSize: '14px' }}>
            Work submissions will appear here for review
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div style={{
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
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}>
              Reject Self-Work Task
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#666666',
              marginBottom: '16px',
            }}>
              Please provide a reason for rejecting this task:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
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
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason('')
                }}
                disabled={actionLoading === showRejectModal}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: actionLoading === showRejectModal ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === showRejectModal || !rejectReason.trim()}
                style={{
                  padding: '10px 20px',
                  background: actionLoading === showRejectModal || !rejectReason.trim() ? '#d1d5db' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: actionLoading === showRejectModal || !rejectReason.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading === showRejectModal ? 'Rejecting...' : 'Reject Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkApprovalTable