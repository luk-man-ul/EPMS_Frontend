import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../../../utils/api'
import { useToast } from '../../../../context/ToastContext'
import { useAuth } from '../../../../context/AuthContext'
import EditTaskModal from '../components/EditTaskModal'

const statusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
]

const priorityConfig: Record<string, { color: string; bg: string; dot: string }> = {
  LOW:    { color: '#16a34a', bg: '#f0fdf4', dot: '#16a34a' },
  MEDIUM: { color: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
  HIGH:   { color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
  URGENT: { color: '#dc2626', bg: '#fef2f2', dot: '#dc2626' },
}

const statusConfig: Record<string, { color: string; bg: string }> = {
  TODO:        { color: '#6b7280', bg: '#f3f4f6' },
  IN_PROGRESS: { color: '#2563eb', bg: '#eff6ff' },
  REVIEW:      { color: '#d97706', bg: '#fffbeb' },
  COMPLETED:   { color: '#16a34a', bg: '#f0fdf4' },
  CANCELLED:   { color: '#dc2626', bg: '#fef2f2' },
}

const TaskDetailPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const { user } = useAuth()

  const fromProject = location.state?.fromProject

  const handleBack = () => {
    if (fromProject) {
      navigate(`/app/projects/${fromProject}?tab=tasks`)
    } else {
      navigate('/app/tasks')
    }
  }

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [toastShown, setToastShown] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    if (accessDenied) return
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${taskId}`)
        setTask(res.data.data || res.data)
      } catch (err: any) {
        if (err.response?.status === 403) {
          setAccessDenied(true)
          if (!toastShown) { showToast('error', 'You are not authorized to view this task'); setToastShown(true) }
        } else if (err.response?.status === 404) { setTask(null) }
      } finally { setLoading(false) }
    }
    if (taskId && !accessDenied) fetchTask()
  }, [taskId, accessDenied])

  const handleEditSuccess = async () => {
    try {
      const res = await api.get(`/tasks/${taskId}`)
      setTask(res.data.data || res.data)
    } catch {}
  }

  const getAllowedStatusOptions = () => {
    if (user?.role !== 'EMPLOYEE') return statusOptions
    const transitions: Record<string, string[]> = {
      'TODO': ['TODO', 'IN_PROGRESS'],
      'IN_PROGRESS': ['IN_PROGRESS', 'REVIEW', 'TODO'],
      'REVIEW': ['REVIEW', 'IN_PROGRESS'],
      'COMPLETED': ['COMPLETED'],
      'CANCELLED': ['CANCELLED'],
    }
    const allowed = transitions[task?.status] || [task?.status]
    return statusOptions.filter(s => allowed.includes(s.value))
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      const res = await api.patch(`/tasks/${task.id}`, { status: newStatus })
      setTask(res.data)
      showToast('success', 'Status updated')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Status update failed')
    } finally { setUpdating(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e5e5', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#666', fontSize: 14 }}>Loading task...</span>
    </div>
  )

  if (accessDenied) return (
    <div style={{ padding: 60, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Access Denied</h2>
      <p style={{ color: '#666', marginBottom: 28, lineHeight: 1.6 }}>You don't have permission to view this task.</p>
      <button onClick={handleBack} style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Go Back</button>
    </div>
  )

  if (!task) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <h2>Task Not Found</h2>
      <button onClick={handleBack} style={{ marginTop: 16, padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>← Back</button>
    </div>
  )

  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM
  const statusStyle = statusConfig[task.status] || statusConfig.TODO
  const assigneeName = task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'
  const creatorName = task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : '—'
  const avatarInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // Computed after task is loaded so assignedToId is available
  const canEditStatus = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD' || user?.id === task.assignedToId
  const canEditTask = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, color: '#444', cursor: 'pointer' }}>
          ← Back
        </button>
        {canEditTask && (
          <button onClick={() => setEditModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            ✏️ Edit Task
          </button>
        )}
      </div>

      {/* HERO CARD */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '28px 32px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📁</span>
              <span>{task.project?.name}</span>
              <span>›</span>
              <span>Tasks</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
              {task.title}
            </h1>
          </div>

          {/* Status + Priority badges */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: priority.bg, color: priority.color, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
              {task.priority}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Description */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Description</div>
            <p style={{ fontSize: 15, color: '#333', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
              {task.description || <span style={{ color: '#bbb', fontStyle: 'italic' }}>No description provided.</span>}
            </p>
          </div>

          {/* Status History */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Activity</div>
            {!task.statusHistory?.length ? (
              <p style={{ color: '#bbb', fontSize: 14, margin: 0 }}>No activity yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {task.statusHistory.map((entry: any, i: number) => {
                  const from = statusConfig[entry.oldStatus] || statusConfig.TODO
                  const to = statusConfig[entry.newStatus] || statusConfig.TODO
                  return (
                    <div key={entry.id} style={{ display: 'flex', gap: 14, paddingBottom: 16, position: 'relative' }}>
                      {/* Timeline line */}
                      {i < task.statusHistory.length - 1 && (
                        <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: '#f0f0f0' }} />
                      )}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', border: '2px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🔄</div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: from.bg, color: from.color }}>{entry.oldStatus.replace('_', ' ')}</span>
                          <span style={{ color: '#999' }}>→</span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: to.bg, color: to.color }}>{entry.newStatus.replace('_', ' ')}</span>
                          <span style={{ color: '#666', fontSize: 12 }}>by <strong>{entry.changedBy?.firstName} {entry.changedBy?.lastName}</strong></span>
                        </div>
                        <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>{new Date(entry.changedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Status Control */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Status</div>
            {canEditStatus ? (
              <select
                value={task.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, fontWeight: 500, background: '#fafafa', cursor: 'pointer', outline: 'none' }}
              >
                {getAllowedStatusOptions().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            ) : (
              <span style={{ padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color, display: 'inline-block' }}>
                {task.status.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* People */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>People</div>
            <PersonRow label="Assignee" name={assigneeName} photo={task.assignee?.profilePhoto} />
            <PersonRow label="Created By" name={creatorName} photo={task.creator?.profilePhoto} />
          </div>

          {/* Dates */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Dates</div>
            <MetaRow icon="📅" label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
            <MetaRow icon="✅" label="Completed" value={task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
          </div>

          {/* Time Logs */}
          {task.timeLogs?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Time Logs</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
                {task.timeLogs.reduce((acc: number, l: any) => acc + l.hours, 0)}h
                <span style={{ fontSize: 13, fontWeight: 400, color: '#999', marginLeft: 6 }}>total</span>
              </div>
              {task.timeLogs.map((log: any) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#555', padding: '6px 0', borderTop: '1px solid #f5f5f5' }}>
                  <span>{log.hours}h</span>
                  <span style={{ color: '#bbb' }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <EditTaskModal isOpen={editModalOpen} task={task} onClose={() => setEditModalOpen(false)} onSuccess={handleEditSuccess} />

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

const PersonRow = ({ label, name, photo }: { label: string; name: string; photo?: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
          {photo ? (
            <img src={photo} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.textContent = initials }} />
          ) : initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{name}</span>
      </div>
    </div>
  )
}

const MetaRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#999', fontWeight: 500 }}>
      <span>{icon}</span>{label}
    </div>
    <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{value}</span>
  </div>
)

export default TaskDetailPage
