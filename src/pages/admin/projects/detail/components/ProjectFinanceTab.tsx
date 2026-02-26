interface Props {
  project: any
}

const ProjectFinanceTab = ({ project }: Props) => {
  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Financial Overview</h3>

      <div style={{ padding: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total Budget</span>
          <strong>${project.budget ?? 0}</strong>
        </div>
      </div>
    </div>
  )
}

export default ProjectFinanceTab