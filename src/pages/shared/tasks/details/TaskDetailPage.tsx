import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'
import { TaskStatus, formatEnumLabel } from '../../../../types/enums'
import { useToast } from '../../../../context/ToastContext'

const TaskDetailPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [newHours, setNewHours] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [toastShown, setToastShown] = useState(false)

  ////////////////////////////////////////////////////////////
  // FETCH TASK
  ////////////////////////////////////////////////////////////
  // FETCH TASK
  ////////////////////////////////////////////////////////////

  const fetchTask = async () => {
    // Prevent fetch if already denied access
    if (accessDenied) return

    try {
      const res = await api.get(`/tasks/${taskId}`)
      setTask(res.data)
    } catch (err: any) {
      console.error('Failed to load task', err)
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        setAccessDenied(true)
        // Only show toast once
        if (!toastShown) {
          showToast('error', 'You are not authorized to view this task')
          setToastShown(true)
        }
      } else if (err.response?.status === 404) {
        setTask(null)
      }
      // 401 is handled by axios interceptor
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId && !accessDenied) {
      fetchTask()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  ////////////////////////////////////////////////////////////
  // STATUS UPDATE
  ////////////////////////////////////////////////////////////

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status })
      await fetchTask()
      showToast('success', 'Task status updated successfully')
    } catch (err: any) {
      console.error('Status update failed', err)
      const errorMessage = err.response?.data?.message || 'Failed to update task status'
      showToast('error', errorMessage)
    }
  }

  ////////////////////////////////////////////////////////////

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  
  if (accessDenied) {
    return (
      <div style={{ 
        padding: 60, 
        textAlign: 'center',
        maxWidth: 600,
        margin: '0 auto'
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔒</div>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
          Access Denied
        </h2>
        <p style={{ color: '#666', marginBottom: 32, lineHeight: 1.6 }}>
          You are not authorized to view this task. This task may not be assigned to you or you may not have the required permissions.
        </p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
        >
          ← Go Back
        </button>
      </div>
    )
  }
  
  if (!task) return <div style={{ padding: 40 }}>Task not found</div>

  const totalHours =
    task.timeLogs?.reduce((acc: number, log: any) => acc + log.hours, 0) || 0

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ margin: 0 }}>{task.title}</h2>
          <p style={{ color: '#666', marginTop: 4 }}>
            Project: {task.project.name}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button style={secondaryBtn} onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={gridStyle}>
        {/* LEFT SIDE */}
        <div>
          <Section title="Description">
            <p>{task.description || 'No description provided.'}</p>
          </Section>

          <Section title="Status History">
            {task.statusHistory?.length ? (
              task.statusHistory.map((h: any) => (
                <div key={h.id} style={historyItem}>
                  <strong>{h.oldStatus}</strong> →{' '}
                  <strong>{h.newStatus}</strong> by{' '}
                  {h.changedBy.firstName} {h.changedBy.lastName}
                </div>
              ))
            ) : (
              <p>No history yet</p>
            )}
          </Section>

          <Section title="Time Logs">
            <p>Total Hours: {totalHours}</p>

            {task.timeLogs?.map((log: any) => (
              <div key={log.id} style={logItem}>
                {log.hours}h — {log.description}
              </div>
            ))}

            <div style={{ marginTop: 12 }}>
              <input
                type="number"
                placeholder="Hours"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                style={inputStyle}
              />
              <button style={primaryBtn}>
                Add Log (Mock)
              </button>
            </div>
          </Section>

          <Section title="Comments (Mock)">
            <div style={{ marginBottom: 10 }}>
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ ...inputStyle, height: 80 }}
              />
              <button style={primaryBtn}>
                Add Comment
              </button>
            </div>

            <p style={{ color: '#888' }}>No comments yet</p>
          </Section>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <Section title="Details">
            <DetailRow label="Priority" value={task.priority} />
            <DetailRow label="Status">
              <select
                value={task.status}
                onChange={(e) => updateStatus(e.target.value)}
                style={inputStyle}
              >
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </select>
            </DetailRow>
            <DetailRow
              label="Assignee"
              value={
                task.assignee
                  ? `${task.assignee.firstName} ${task.assignee.lastName}`
                  : 'Unassigned'
              }
            />
            <DetailRow
              label="Due Date"
              value={
                task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : '—'
              }
            />
            <DetailRow
              label="Created By"
              value={`${task.creator.firstName} ${task.creator.lastName}`}
            />
            <DetailRow
              label="Completed At"
              value={
                task.completedAt
                  ? new Date(task.completedAt).toLocaleDateString()
                  : '—'
              }
            />
          </Section>
        </div>
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////
// REUSABLE COMPONENTS
////////////////////////////////////////////////////////////

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div style={sectionStyle}>
    <h3>{title}</h3>
    {children}
  </div>
)

const DetailRow = ({
  label,
  value,
  children,
}: any) => (
  <div style={detailRow}>
    <span style={{ fontWeight: 500 }}>{label}</span>
    {children || <span>{value}</span>}
  </div>
)

////////////////////////////////////////////////////////////
// STYLES
////////////////////////////////////////////////////////////

const containerStyle: React.CSSProperties = {
  padding: 40,
  maxWidth: 1200,
  margin: '0 auto',
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 30,
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: 30,
}

const sectionStyle: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 14,
  border: '1px solid #eee',
  marginBottom: 24,
}

const detailRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 12,
}

const historyItem: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #f0f0f0',
}

const logItem: React.CSSProperties = {
  padding: 8,
  borderBottom: '1px solid #f0f0f0',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #ddd',
  marginBottom: 8,
}

const primaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 'none',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
  marginTop: 6,
}

const secondaryBtn: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer',
}

export default TaskDetailPage