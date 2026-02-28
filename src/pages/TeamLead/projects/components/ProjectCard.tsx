import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/project.types'
import ProjectStatus from './ProjectStatus'

interface ProjectCardProps {
  project: Project
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate()

  const getDaysRemaining = () => {
    const deadline = new Date(project.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e5e5',
      borderRadius: '12px',
      padding: '20px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#d4d4d4'
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#e5e5e5'
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.transform = 'translateY(0)'
    }}
    onClick={() => navigate(`/teamlead/projects/${project.id}`)}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>
          <p style={{
            fontSize: '13px',
            color: '#666666',
            lineHeight: '1.5',
            marginBottom: '12px',
          }}>
            {project.description.substring(0, 100)}...
          </p>
        </div>
        <ProjectStatus status={project.status} />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#666666',
          }}>
            Progress
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1a1a1a',
          }}>
            {project.progress}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: '#f5f5f5',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${project.progress}%`,
            height: '100%',
            background: project.progress >= 75 ? '#10b981' : project.progress >= 50 ? '#4a90e2' : '#f59e0b',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <div style={{
          padding: '12px',
          background: '#fafafa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '4px',
          }}>
            {project.teamMembersCount}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666666',
            fontWeight: 500,
          }}>
            Team Members
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: '#fafafa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '4px',
          }}>
            {project.openTasks}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666666',
            fontWeight: 500,
          }}>
            Open Tasks
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: '#fafafa',
          borderRadius: '8px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 600,
            color: daysRemaining < 7 ? '#ef4444' : '#1a1a1a',
            marginBottom: '4px',
          }}>
            {daysRemaining}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666666',
            fontWeight: 500,
          }}>
            Days Left
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #e5e5e5',
      }}>
        <div style={{
          fontSize: '12px',
          color: '#666666',
        }}>
          Deadline: <span style={{ fontWeight: 600, color: '#1a1a1a' }}>
            {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/teamlead/projects/${project.id}`)
          }}
          style={{
            padding: '6px 16px',
            background: '#1a1a1a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#333333'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#1a1a1a'}
        >
          View Details →
        </button>
      </div>
    </div>
  )
}

export default ProjectCard
