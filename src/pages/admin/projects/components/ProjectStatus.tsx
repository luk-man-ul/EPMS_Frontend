import type { ProjectStatus as ProjectStatusType } from '../types/project.types'

interface Props {
  status: ProjectStatusType | string
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  PLANNING: {
    bg: '#eef2ff',
    color: '#3730a3',
    label: 'Planning',
  },
  ACTIVE: {
    bg: '#fef3c7',
    color: '#92400e',
    label: 'Active',
  },
  ON_HOLD: {
    bg: '#f3f4f6',
    color: '#4b5563',
    label: 'On Hold',
  },
  COMPLETED: {
    bg: '#dcfce7',
    color: '#166534',
    label: 'Completed',
  },
  ARCHIVED: {
    bg: '#fee2e2',
    color: '#991b1b',
    label: 'Archived',
  },
}

const ProjectStatus = ({ status }: Props) => {
  const config = statusConfig[status]

  if (!config) {
    return (
      <span
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 500,
          backgroundColor: '#f5f5f5',
          color: '#999',
          border: '1px solid #e5e5e5',
        }}
      >
        {status || 'Unknown'}
      </span>
    )
  }

  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color,
        border: '1px solid #e5e5e5',
      }}
    >
      {config.label}
    </span>
  )
}

export default ProjectStatus