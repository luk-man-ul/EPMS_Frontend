import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../../../utils/api'

const statusOptions = [
  'TODO',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
]

const TaskDetailPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  ////////////////////////////////////////////////////////////
  // FETCH TASK
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`)
        setTask(res.data.data || res.data)
      } catch (err: any) {
        console.error('Failed to load task', err)
        
        // Handle specific error cases
        if (err.response?.status === 403) {
          navigate('/unauthorized')
        } else if (err.response?.status === 404) {
          setTask(null)
        }
        // 401 is handled by axios interceptor
      } finally {
        setLoading(false)
      }
    }

    if (taskId) fetchTask()
  }, [taskId, navigate])

  ////////////////////////////////////////////////////////////
  // ROLE CHECK
  ////////////////////////////////////////////////////////////

  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  const canEditStatus =
    user?.role === 'ADMIN' ||
    user?.role === 'TEAM_LEAD' ||
    user?.id === task?.assignedToId

  ////////////////////////////////////////////////////////////
  // STATUS UPDATE
  ////////////////////////////////////////////////////////////

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)

      const res = await api.patch(`/tasks/${task.id}`, {
        status: newStatus,
      })

      setTask(res.data)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed')
    } finally {
      setUpdating(false)
    }
  }

  ////////////////////////////////////////////////////////////
  // LOADING STATES
  ////////////////////////////////////////////////////////////

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>

  if (!task)
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <h2>Task Not Found</h2>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    )

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 12,
            fontWeight: 500,
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 700 }}>
          {task.title}
        </h1>

        <div style={{ color: '#666', marginTop: 6 }}>
          Project: {task.project?.name}
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 24,
        }}
      >
        {/* LEFT - DESCRIPTION */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Description</h3>
          <p style={{ lineHeight: 1.6 }}>
            {task.description || 'No description'}
          </p>
        </div>

        {/* RIGHT - DETAILS */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Details</h3>

          <DetailRow
            label="Priority"
            value={task.priority}
          />

          <div style={{ marginBottom: 14 }}>
            <strong>Status</strong>
            <div style={{ marginTop: 6 }}>
              {canEditStatus ? (
                <select
                  value={task.status}
                  disabled={updating}
                  onChange={(e) =>
                    handleStatusChange(e.target.value)
                  }
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                  }}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <div>{task.status}</div>
              )}
            </div>
          </div>

          <DetailRow
            label="Assignee"
            value={`${task.assignee?.firstName} ${task.assignee?.lastName}`}
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
            value={`${task.creator?.firstName} ${task.creator?.lastName}`}
          />

          <DetailRow
            label="Completed At"
            value={
              task.completedAt
                ? new Date(task.completedAt).toLocaleString()
                : '—'
            }
          />
        </div>
      </div>

      {/* STATUS HISTORY */}
      <div
        style={{
          marginTop: 32,
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 20 }}>Status History</h3>

        {task.statusHistory?.length === 0 && (
          <div style={{ color: '#666' }}>
            No status changes recorded.
          </div>
        )}

        {task.statusHistory?.length > 0 &&
  task.statusHistory.map((entry: any) => (
          <div
            key={entry.id}
            style={{
              padding: '10px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <strong>{entry.oldStatus}</strong> →{' '}
            <strong>{entry.newStatus}</strong>{' '}
            by {entry.changedBy?.firstName}{' '}
            {entry.changedBy?.lastName}
            <div style={{ fontSize: 12, color: '#888' }}>
              {new Date(entry.changedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* TIME LOGS */}
      <div
        style={{
          marginTop: 32,
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ marginBottom: 16 }}>Time Logs</h3>

        {task.timeLogs?.length === 0 ? (
          <div style={{ color: '#666' }}>
            No time logs recorded.
          </div>
        ) : (
          task.timeLogs?.map((log: any) => (
            <div key={log.id}>
              {log.hours} hrs —{' '}
              {new Date(log.createdAt).toLocaleDateString()}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

////////////////////////////////////////////////////////////
// SMALL REUSABLE ROW
////////////////////////////////////////////////////////////

const DetailRow = ({
  label,
  value,
}: {
  label: string
  value: any
}) => (
  <div style={{ marginBottom: 14 }}>
    <strong>{label}</strong>
    <div style={{ marginTop: 4 }}>{value}</div>
  </div>
)

export default TaskDetailPage