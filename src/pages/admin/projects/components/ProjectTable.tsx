import ProjectRow from './ProjectRow'
import type { ProjectListItem } from '../types/project.types'

interface Props {
  projects: ProjectListItem[]
}

const ProjectTable = ({ projects }: Props) => {
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
            color: '#666',
            fontWeight: 500,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Project Name
          </th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Lead
          </th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Status
          </th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Team Size
          </th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Progress
          </th>
          <th style={{ padding: '16px 20px', fontWeight: 500 }}>
            Deadline
          </th>
        </tr>
      </thead>

      <tbody>
        {projects.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
          />
        ))}
      </tbody>
    </table>
  )
}

export default ProjectTable