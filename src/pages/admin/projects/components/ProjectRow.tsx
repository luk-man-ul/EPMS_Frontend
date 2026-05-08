import { useNavigate } from 'react-router-dom'
import ProjectStatus from './ProjectStatus'
import type { ProjectListItem } from '../types/project.types'

interface Props {
  project: ProjectListItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const ProjectRow = ({ project, onEdit, onDelete }: Props) => {
  const navigate = useNavigate()
  const teamSize = project.teamSize ?? 0

  const leadName = project.lead
    ? `${project.lead.firstName} ${project.lead.lastName}`
    : '—'

  const progress = project.progress ?? 0

  const deadline = project.endDate
    ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'

  const handleClick = () => {
    navigate(`/admin/projects/${project.id}`)
  }

  return (
    <tr
      onClick={handleClick}
      style={{
        borderBottom: '1px solid #f3f4f6',
        transition: 'background 0.15s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#f9fafb')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      {/* Project Name */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
          {project.name}
        </div>
      </td>

      {/* Lead */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4b5563' }}>
        {leadName}
      </td>

      {/* Status */}
      <td style={{ padding: '16px 20px' }}>
        <ProjectStatus status={project.status} />
      </td>

      {/* Team Size */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#111827' }}>
        <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
          {teamSize} members
        </span>
      </td>

      {/* Progress */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              flex: 1,
              height: '6px',
              background: '#f3f4f6',
              borderRadius: '3px',
              overflow: 'hidden',
              minWidth: '80px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: progress === 100 ? '#16a34a' : '#2563eb',
                borderRadius: '3px',
              }}
            />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', minWidth: '30px' }}>
            {progress}%
          </span>
        </div>
      </td>

      {/* Deadline */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#4b5563' }}>
        {deadline}
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(project.id); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#374151',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #fee2e2',
              background: '#fff',
              color: '#dc2626',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

export default ProjectRow