import ProjectStatus from './ProjectStatus'
import ProjectActions from './ProjectActions'
import type { ProjectListItem } from '../types/project.types'

interface Props {
  project: ProjectListItem
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const ProjectRow = ({ project, onEdit, onDelete }: Props) => {
  const teamSize = project.teamSize ?? 0

  const leadName = project.lead
    ? `${project.lead.firstName} ${project.lead.lastName}`
    : '—'

  const progress = project.progress ?? 0

  const deadline = project.endDate
    ? new Date(project.endDate).toLocaleDateString()
    : '—'

  return (
    <tr
      style={{
        borderBottom: '1px solid #f5f5f5',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = '#fafafa')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = 'transparent')
      }
    >
      {/* Project Name */}
      <td style={{ padding: '16px 20px' }}>
        <div
          style={{
            fontWeight: 500,
            color: '#1a1a1a',
            fontSize: '14px',
          }}
        >
          {project.name}
        </div>
      </td>

      {/* Lead */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {leadName}
      </td>

      {/* Status */}
      <td style={{ padding: '16px 20px' }}>
        <ProjectStatus status={project.status} />
      </td>

      {/* Team Size */}
      <td
        style={{
          padding: '16px 20px',
          fontSize: '14px',
          color: '#1a1a1a',
        }}
      >
        {teamSize} members
      </td>

      {/* Progress */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              flex: 1,
              height: '6px',
              background: '#f0f0f0',
              borderRadius: '3px',
              overflow: 'hidden',
              minWidth: '80px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: '#1a1a1a',
                borderRadius: '3px',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#1a1a1a',
              minWidth: '35px',
            }}
          >
            {progress}%
          </span>
        </div>
      </td>

      {/* Deadline */}
      <td style={{ padding: '16px 20px', fontSize: '14px', color: '#666' }}>
        {deadline}
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
        <ProjectActions
          projectId={project.id}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

export default ProjectRow