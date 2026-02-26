interface Props {
  project: any
}

const ProjectTasksTab = ({ project }: Props) => {
  const tasks = project.tasks || []

  return (
    <div>
      <h3 style={{ marginBottom: '20px' }}>Tasks ({tasks.length})</h3>

      {tasks.length === 0 && (
        <div style={{ padding: '40px', background: '#fafafa', borderRadius: '12px' }}>
          No tasks yet.
        </div>
      )}

      {tasks.map((task: any) => (
        <div key={task.id} style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
          <strong>{task.title}</strong>
          <div>Status: {task.status}</div>
          <div>Priority: {task.priority}</div>
        </div>
      ))}
    </div>
  )
}

export default ProjectTasksTab