import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import api from '../../../../utils/api'
import { TaskStatus, formatEnumLabel } from '../../../../types/enums'
import { useToast } from '../../../../context/ToastContext'
import TaskTypeBadge from '../../../../components/shared/TaskTypeBadge'
import TaskAttachments from '../../../../components/shared/TaskAttachments'

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
  REJECTED:    { color: '#dc2626', bg: '#fef2f2' },
}

const TaskDetailPage = () => {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [newHours, setNewHours] = useState('')
  const [accessDenied, setAccessDenied] = useState(false)
  const [toastShown, setToastShown] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fromProject = location.state?.fromProject

  const fetchTask = async () => {
    if (accessDenied) return
    try {
      const res = await api.get(`/tasks/${taskId}`)
      setTask(res.data)
    } catch (err: any) {
      if (err.response?.status === 403) {
        setAccessDenied(true)
        if (!toastShown) { showToast('error', 'You are not authorized to view this task'); setToastShown(true) }
      } else if (err.response?.status === 404) { setTask(null) }
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (taskId && !accessDenied) fetchTask()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const updateStatus = async (status: string) => {
    try {
      setUpdatingStatus(true)
      await api.patch(`/tasks/${taskId}`, { status })
      await fetchTask()
      showToast('success', 'Task status updated successfully')
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update task status')
    } finally { setUpdatingStatus(false) }
  }

  const handleBack = () => {
    if (fromProject) {
      const isAdmin = window.location.pathname.startsWith('/admin')
      navigate(isAdmin ? `/admin/projects/${fromProject}?tab=tasks` : `/app/projects/${fromProject}?tab=tasks`)
      return
    }
    const isAdmin = window.location.pathname.startsWith('/admin')
    navigate(isAdmin ? '/admin/tasks' : '/app/tasks', { state: { refresh: true } })
  }

  // ── Loading ──
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e5e5', borderTopColor: '#1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#666', fontSize: 14 }}>Loading task...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // ── Access denied ──
  if (accessDenied) return (
    <div style={{ padding: 60, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Access Denied</h2>
      <p style={{ color: '#666', marginBottom: 28, lineHeight: 1.6 }}>You are not authorized to view this task.</p>
      <button onClick={handleBack} style={{ padding: '10px 24px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Go Back</button>
    </div>
  )

  if (!task) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>Task Not Found</h2>
      <button onClick={handleBack} style={{ marginTop: 20, padding: '10px 20px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>← Back</button>
    </div>
  )

  const totalHours = task.timeLogs?.reduce((acc: number, log: any) => acc + log.hours, 0) || 0
  const priority = priorityConfig[task.priority] || priorityConfig.MEDIUM
  const statusStyle = statusConfig[task.status] || statusConfig.TODO
  const assigneeName = task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unassigned'
  const creatorName = task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : '—'
  const avatarInitials = (name: string) => name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #e5e5e5', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500, color: '#444', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>

      {/* HERO CARD */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '28px 32px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: '#999', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📁</span><span>{task.project?.name}</span><span>›</span><span>Tasks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {task.title}
              </h1>
              <TaskTypeBadge type={task.type} status={task.status} />
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: priority.bg, color: priority.color, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
              {task.priority}
            </span>
            <span style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
              {task.status?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Approval banner */}
        {task.approvedBy && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #86efac' }}>
            <p style={{ margin: 0, fontSize: 13, color: '#166534', fontWeight: 500 }}>
              ✅ Approved by {task.approvedBy.firstName} {task.approvedBy.lastName} · {new Date(task.approvedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* Rejection banner */}
        {task.status === 'REJECTED' && task.rejectionReason && (
          <div style={{ marginTop: 20, padding: '12px 16px', background: '#fef2f2', borderRadius: 10, border: '1px solid #fca5a5' }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#991b1b' }}>Rejection Reason</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#991b1b' }}>{task.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* LEFT */}
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
                      {i < task.statusHistory.length - 1 && (
                        <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: '#f0f0f0' }} />
                      )}
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f5f5f5', border: '2px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🔄</div>
                      <div style={{ paddingTop: 4 }}>
                        <div style={{ fontSize: 13, color: '#333', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: from.bg, color: from.color }}>{entry.oldStatus?.replace(/_/g, ' ')}</span>
                          <span style={{ color: '#999' }}>→</span>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: to.bg, color: to.color }}>{entry.newStatus?.replace(/_/g, ' ')}</span>
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

          {/* Time Logs */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Time Logs</div>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{totalHours}h <span style={{ fontSize: 12, fontWeight: 400, color: '#999' }}>total</span></span>
            </div>

            {task.timeLogs?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {task.timeLogs.map((log: any) => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: 13, color: '#555' }}>
                    <span style={{ fontWeight: 500 }}>⏱ {log.hours}h</span>
                    {log.description && <span style={{ color: '#999', fontSize: 12 }}>{log.description}</span>}
                    <span style={{ color: '#bbb', fontSize: 12 }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                type="number"
                placeholder="Hours"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                style={{ flex: 1, padding: '9px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, outline: 'none', background: '#fafafa' }}
              />
              <button style={{ padding: '9px 16px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Add Log
              </button>
            </div>
          </div>

          {/* Comments */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Comments</div>
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: 8 }}
            />
            <button style={{ padding: '9px 18px', background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Add Comment
            </button>
            <p style={{ color: '#bbb', fontSize: 13, marginTop: 16, marginBottom: 0 }}>No comments yet.</p>
          </div>

          {/* Attachments */}
          <TaskAttachments taskId={taskId!} />
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Status Control */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Status</div>
            <select
              value={task.status}
              disabled={updatingStatus}
              onChange={(e) => updateStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e5e5', fontSize: 13, fontWeight: 500, background: '#fafafa', cursor: 'pointer', outline: 'none' }}
            >
              {Object.values(TaskStatus).map((status) => (
                <option key={status} value={status}>{formatEnumLabel(status)}</option>
              ))}
            </select>
          </div>

          {/* People */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>People</div>
            <PersonRow label="Assignee" name={assigneeName} gradient="linear-gradient(135deg, #667eea, #764ba2)" photo={task.assignee?.profilePhoto} />
            <PersonRow label="Created By" name={creatorName} gradient="linear-gradient(135deg, #f093fb, #f5576c)" photo={task.creator?.profilePhoto} />
          </div>

          {/* Dates */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e5e5', padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Dates</div>
            <MetaRow icon="📅" label="Due Date" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
            <MetaRow icon="✅" label="Completed" value={task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'} />
          </div>
        </div>
      </div>
    </div>
  )
}

const PersonRow = ({ label, name, gradient, photo }: { label: string; name: string; gradient: string; photo?: string }) => {
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
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
