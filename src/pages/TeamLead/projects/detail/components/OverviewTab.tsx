import React from 'react'

interface Props {
  project: any
}

const OverviewTab = ({ project }: Props) => {
  if (!project) return null

  return (
    <div style={{
      background: '#ffffff',
      padding: '24px',
      borderRadius: '12px',
      border: '1px solid #e5e5e5',
    }}>
      <h2 style={{ marginBottom: '16px' }}>Project Overview</h2>

      <div style={{ marginBottom: '12px' }}>
        <strong>Name:</strong> {project.name}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Status:</strong> {project.status}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>Start Date:</strong>{' '}
        {project.startDate
          ? new Date(project.startDate).toLocaleDateString()
          : 'N/A'}
      </div>

      <div style={{ marginBottom: '12px' }}>
        <strong>End Date:</strong>{' '}
        {project.endDate
          ? new Date(project.endDate).toLocaleDateString()
          : 'N/A'}
      </div>

      <div>
        <strong>Description:</strong>
        <p style={{ marginTop: '8px' }}>{project.description}</p>
      </div>
    </div>
  )
}

export default OverviewTab