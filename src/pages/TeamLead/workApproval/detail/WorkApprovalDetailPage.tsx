import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getTaskById, approveSelfWork, rejectSelfWork } from '../../../../utils/api'
import type { Task } from '../../../../types/task'
import InformationPanel from './components/InformationPanel'
import ActionButtons from './components/ActionButtons'
import FeedbackModal from './components/FeedbackModal'
import ConvertToTaskModal from './components/ConvertToTaskModal'

const WorkApprovalDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Determine base path from current location
  const basePath = location.pathname.includes('/admin/') ? '/admin' : '/teamlead'

  useEffect(() => {
    if (id) {
      fetchTask()
    }
  }, [id])

  const fetchTask = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const taskData = await getTaskById(id)
      setTask(taskData)
    } catch (err: any) {
      console.error('Error fetching task:', err)
      setError(err.response?.data?.message || 'Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!task || !confirm('Are you sure you want to approve this self-work task?')) return
    
    try {
      setActionLoading(true)
      await approveSelfWork(task.id)
      alert('Self-work task approved successfully!')
      navigate(`${basePath}/work-approval`)
    } catch (err: any) {
      console.error('Error approving task:', err)
      alert(err.response?.data?.message || 'Failed to approve task')
      setActionLoading(false)
    }
  }

  const handleRejectClick = () => {
    setShowRejectModal(true)
    setRejectReason('')
  }

  const handleRejectSubmit = async () => {
    if (!task || !rejectReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    try {
      setActionLoading(true)
      await rejectSelfWork(task.id, rejectReason)
      alert('Self-work task rejected successfully!')
      navigate(`${basePath}/work-approval`)
    } catch (err: any) {
      console.error('Error rejecting task:', err)
      alert(err.response?.data?.message || 'Failed to reject task')
      setActionLoading(false)
      setShowRejectModal(false)
    }
  }

  const handleSendFeedback = (feedback: string) => {
    alert(`Feedback sent: ${feedback}`)
    setShowFeedbackModal(false)
  }

  const handleConvertToTask = (taskData: { title: string; priority: string; assignee: string }) => {
    alert(`Converted to task: ${taskData.title}`)
    setShowConvertModal(false)
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <div style={{ fontSize: '16px', color: '#666666' }}>
              Loading task details...
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error or not found state
  if (error || !task) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{
          background: '#ffffff',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {error ? 'Error Loading Task' : 'Task Not Found'}
          </h2>
          <p style={{ color: '#666666', marginBottom: '24px' }}>
            {error || "The task you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate(`${basePath}/work-approval`)}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back to Work Approvals
          </button>
        </div>
      </div>
    )
  }

  // Transform task to workApproval format for existing components
  const workApproval = {
    id: task.id,
    employeeName: task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : 'Unknown',
    project: task.project?.name || 'Unknown Project',
    workTitle: task.title,
    submittedDate: task.createdAt.toString(),
    estimatedTime: task.estimatedHrs ? `${task.estimatedHrs} hours` : 'N/A',
    status: task.status === 'PROPOSED' ? 'pending' as const : 
            task.status === 'REJECTED' ? 'rejected' as const : 
            'approved' as const, // Any status other than PROPOSED or REJECTED means approved
    description: task.description || '',
    reason: task.rejectionReason || '',
    expectedOutcome: '',
    attachment: '',
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(`${basePath}/work-approval`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666666',
            cursor: 'pointer',
            marginBottom: '16px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fafafa'
            e.currentTarget.style.borderColor = '#d4d4d4'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = '#e5e5e5'
          }}
        >
          <span>←</span>
          <span>Back to Work Approvals</span>
        </button>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1a1a1a',
              marginBottom: '8px',
            }}>
              {workApproval.workTitle}
            </h1>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: '#666666',
            }}>
              <span>ID: {workApproval.id}</span>
              <span>•</span>
              <span>Submitted by {workApproval.employeeName}</span>
              <span>•</span>
              <span>{new Date(workApproval.submittedDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
          </div>

          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            background: workApproval.status === 'pending' ? '#fef3c7' : 
                       workApproval.status === 'approved' ? '#d1fae5' : '#fee2e2',
            color: workApproval.status === 'pending' ? '#92400e' : 
                   workApproval.status === 'approved' ? '#065f46' : '#991b1b',
          }}>
            {workApproval.status.charAt(0).toUpperCase() + workApproval.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px',
      }}>
        {/* Main Content */}
        <div>
          <InformationPanel workApproval={workApproval} />
        </div>

        {/* Sidebar */}
        <div>
          <ActionButtons
            status={workApproval.status}
            onApprove={handleApprove}
            onReject={handleRejectClick}
            onConvertToTask={() => setShowConvertModal(true)}
            onSendFeedback={() => setShowFeedbackModal(true)}
            loading={actionLoading}
          />
        </div>
      </div>

      {/* Modals */}
      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSend={handleSendFeedback}
        />
      )}

      {showConvertModal && (
        <ConvertToTaskModal
          workTitle={workApproval.workTitle}
          onClose={() => setShowConvertModal(false)}
          onConvert={handleConvertToTask}
        />
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
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                disabled={actionLoading}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectReason.trim()}
                style={{
                  padding: '10px 20px',
                  background: actionLoading || !rejectReason.trim() ? '#d1d5db' : '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: actionLoading || !rejectReason.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkApprovalDetailPage
