import ProjectRow from './ProjectRow'
import type { ProjectListItem } from '../types/project.types'

interface Props {
  projects: ProjectListItem[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const ProjectTable = ({ projects, onEdit, onDelete }: Props) => {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr
          style={{
            textAlign: 'left',
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <th style={{ padding: '12px 20px' }}>Project Name</th>
          <th style={{ padding: '12px 20px' }}>Lead</th>
          <th style={{ padding: '12px 20px' }}>Status</th>
          <th style={{ padding: '12px 20px' }}>Team Size</th>
          <th style={{ padding: '12px 20px' }}>Progress</th>
          <th style={{ padding: '12px 20px' }}>Deadline</th>
          <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>

      <tbody>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </tbody>
    </table>
  )
}

export default ProjectTable