import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getTaskById, approveSelfWork, rejectSelfWork } from '../../../../utils/api'
import type { Task } from '../../../../types/task'
import { Button, LoadingSpinner, ErrorMessage, Modal, Input } from '../../../../components/ui'
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
      navigate(`${basePath}/tasks/approval`)
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
      navigate(`${basePath}/tasks/approval`)
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
          <LoadingSpinner size="lg" text="Loading task details..." />
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
          <ErrorMessage
            message={error || "The task you're looking for doesn't exist."}
            type="page"
          />
          <div style={{ marginTop: '24px' }}>
            <Button
              onClick={() => navigate(`${basePath}/tasks/approval`)}
              variant="primary"
            >
              Back to Work Approvals
            </Button>
          </div>
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
        <Button
          onClick={() => navigate(`${basePath}/tasks/approval`)}
          variant="ghost"
          size="sm"
          style={{ marginBottom: '16px' }}
        >
          <span>←</span>
          <span>Back to Work Approvals</span>
        </Button>

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
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setRejectReason('')
        }}
        title="Reject Self-Work Task"
        size="md"
        footer={
          <>
            <Button
              onClick={() => {
                setShowRejectModal(false)
                setRejectReason('')
              }}
              disabled={actionLoading}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              disabled={actionLoading || !rejectReason.trim()}
              loading={actionLoading}
              variant="danger"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Task'}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: '14px', color: '#666666', marginBottom: '16px' }}>
          Please provide a reason for rejecting this task:
        </p>
        <Input
          type="textarea"
          value={rejectReason}
          onChange={setRejectReason}
          placeholder="Enter rejection reason..."
          rows={5}
        />
      </Modal>
    </div>
  )
}

export default WorkApprovalDetailPage
