import { useEffect, useState } from 'react'
import api from '../../../../../utils/api'

interface Props {
  project: any
}

const ProjectSummary = ({ project }: Props) => {
  const [status, setStatus] = useState(project?.status)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setStatus(project?.status)
  }, [project])

  if (!project) return null

  ////////////////////////////////////////////////////////////
  // 🔒 CHECK OPEN TASKS
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px'
    }}>

      {/* Description */}
      <Card title="Description">
        {project.description || 'No description available'}
      </Card>

      {/* Timeline */}
      <Card title="Timeline">
        <Row label="Start Date" value={formatDate(project.startDate)} />
        <Row label="Deadline" value={formatDate(project.endDate)} />
      </Card>

      {/* Status */}
      <Card title="Status">

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#666' }}>
            Current Status
          </label>

          <select
            value={status}
            disabled={updating}
            onChange={(e) =>
              handleStatusChange(e.target.value)
            }
            style={{
              marginTop: 6,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 13
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

            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          {hasOpenTasks && status !== 'COMPLETED' && (
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                color: '#b45309',
              }}
            >
              {/* ⚠ Cannot complete project until all tasks are finished. */}
            </div>
          )}
        </div>

        <Row label="Progress" value={`${project.progress}%`} />
        <ProgressBar value={project.progress} />

      </Card>

      {/* Budget */}
      <Card title="Budget">
        <Row label="Total Budget" value={`$${project.budget ?? 0}`} />
      </Card>

    </div>
  )
}

//////////////////////////////////////////////////////////////
// Helpers
//////////////////////////////////////////////////////////////

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString() : 'N/A'

const Card = ({ title, children }: any) => (
  <div style={{
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: 24
  }}>
    <h3 style={{ marginBottom: 16 }}>{title}</h3>
    {children}
  </div>
)

const Row = ({ label, value }: any) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 12
  }}>
    <span style={{ color: '#666' }}>{label}</span>
    <span style={{ fontWeight: 500 }}>{value}</span>
  </div>
)

const ProgressBar = ({ value }: any) => (
  <div style={{
    height: 8,
    background: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden'
  }}>
    <div style={{
      height: '100%',
      width: `${value}%`,
      background: '#1a1a1a'
    }} />
  </div>
)

export default ProjectSummary