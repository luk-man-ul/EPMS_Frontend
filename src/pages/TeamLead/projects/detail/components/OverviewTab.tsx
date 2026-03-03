import React, { useEffect, useState } from 'react'
import api from '../../../../../utils/api'
import ConfirmationModal from '../../../../../components/shared/ConfirmationModal'
import { useToast } from '../../../../../context/ToastContext'
import { formatEnumLabel } from '../../../../../types/enums'
import { validateStatusTransition, getAllowedTransitions } from '../../../../../utils/projectWorkflow'

interface Props {
  project: any
}

const OverviewTab = ({ project }: Props) => {
  const [status, setStatus] = useState(project?.status)
  const [updating, setUpdating] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    setStatus(project?.status)
  }, [project])

  if (!project) return null

  ////////////////////////////////////////////////////////////
  // 🔐 USER + OWNERSHIP CHECK
  ////////////////////////////////////////////////////////////

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const canEdit =
    user?.role === 'TEAM_LEAD' &&
    (project.leadId === user?.id || 
     project.members?.some((m: any) => m.userId === user?.id))

  ////////////////////////////////////////////////////////////
  // 🔒 CHECK IF OPEN TASKS EXIST
  ////////////////////////////////////////////////////////////

  const hasOpenTasks =
    project.tasks?.some(
      (task: any) => task.status !== 'COMPLETED'
    ) ?? false

  ////////////////////////////////////////////////////////////
  // STATUS CHANGE HANDLER (with validation and confirmation)
  ////////////////////////////////////////////////////////////

  const handleStatusChangeRequest = (newStatus: string) => {
    // Validate workflow transition
    const validation = validateStatusTransition(status, newStatus)
    
    if (!validation.isValid) {
      showToast('error', validation.error || 'Invalid status transition')
      return
    }

    // Show confirmation modal
    setPendingStatus(newStatus)
    setShowConfirmModal(true)
  }

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return

    try {
      setUpdating(true)
      setShowConfirmModal(false)

      const res = await api.patch(
        `/projects/${project.id}/status`,
        { status: pendingStatus }
      )

      setStatus(res.data.status)
      showToast('success', `Project status updated to ${formatEnumLabel(pendingStatus)}`)
      
      // Refresh page to show updated data
      window.location.reload()
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update project status'
      showToast('error', errorMsg)
    } finally {
      setUpdating(false)
      setPendingStatus(null)
    }
  }

  const handleCancelStatusChange = () => {
    setShowConfirmModal(false)
    setPendingStatus(null)
  }

  ////////////////////////////////////////////////////////////
  // GET ALLOWED STATUS OPTIONS
  ////////////////////////////////////////////////////////////

  const allowedStatuses = getAllowedTransitions(status)

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
      }}
    >
      <h2 style={{ marginBottom: '16px' }}>
        Project Overview
      </h2>

      <div style={{ marginBottom: '12px' }}>
        <strong>Name:</strong> {project.name}
      </div>

      {/* STATUS */}
      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong>{' '}

        {canEdit ? (
          <select
            value={status}
            disabled={updating}
            onChange={(e) =>
              handleStatusChangeRequest(e.target.value)
            }
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 13,
            }}
          >
            <option value={status}>{formatEnumLabel(status)}</option>
            {allowedStatuses.map((allowedStatus) => (
              <option 
                key={allowedStatus} 
                value={allowedStatus}
                disabled={allowedStatus === 'COMPLETED' && hasOpenTasks}
              >
                {formatEnumLabel(allowedStatus)}
                {allowedStatus === 'COMPLETED' && hasOpenTasks ? ' (Open tasks exist)' : ''}
              </option>
            ))}
          </select>
        ) : (
          <span>{formatEnumLabel(status)}</span>
        )}

        {hasOpenTasks && status !== 'COMPLETED' && (
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: '#b45309',
            }}
          >
            {/* ⚠ Project cannot be completed until all tasks are finished. */}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Start Date:</strong>{' '}
        {project.startDate
          ? new Date(
              project.startDate
            ).toLocaleDateString()
          : 'N/A'}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>End Date:</strong>{' '}
        {project.endDate
          ? new Date(
              project.endDate
            ).toLocaleDateString()
          : 'N/A'}
      </div>

      <div>
        <strong>Description:</strong>
        <p style={{ marginTop: '8px' }}>
          {project.description}
        </p>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        title="Confirm Status Change"
        message={`Are you sure you want to change the project status from ${formatEnumLabel(status)} to ${pendingStatus ? formatEnumLabel(pendingStatus) : ''}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        variant="info"
        onConfirm={handleConfirmStatusChange}
        onCancel={handleCancelStatusChange}
      />
    </div>
  )
}

export default OverviewTab