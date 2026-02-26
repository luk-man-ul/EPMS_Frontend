import React, { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  project: any
}

const OverviewTab = ({ project }: Props) => {
  const [status, setStatus] = useState(project?.status)
  const [updating, setUpdating] = useState(false)

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
    project.leadId === user?.id

  ////////////////////////////////////////////////////////////
  // 🔒 CHECK IF OPEN TASKS EXIST
  ////////////////////////////////////////////////////////////

  const hasOpenTasks =
    project.tasks?.some(
      (task: any) => task.status !== 'COMPLETED'
    ) ?? false

  ////////////////////////////////////////////////////////////
  // STATUS UPDATE
  ////////////////////////////////////////////////////////////

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)

      const res = await api.patch(
        `/projects/${project.id}/status`,
        { status: newStatus }
      )

      setStatus(res.data.status)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(false)
    }
  }

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
              handleStatusChange(e.target.value)
            }
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ddd',
              fontSize: 13,
            }}
          >
            <option value="PLANNING">PLANNING</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="ON_HOLD">ON_HOLD</option>

            <option
              value="COMPLETED"
              disabled={hasOpenTasks}
            >
              COMPLETED
              {hasOpenTasks
                ? ' (Open tasks exist)'
                : ''}
            </option>

            <option value="ARCHIVED">
              ARCHIVED
            </option>
          </select>
        ) : (
          <span>{status}</span>
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
    </div>
  )
}

export default OverviewTab