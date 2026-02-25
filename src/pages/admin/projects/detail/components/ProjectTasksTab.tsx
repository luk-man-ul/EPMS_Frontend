const ProjectTasksTab = () => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
          Task Board
        </h3>

        <button
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          + Add Task
        </button>
      </div>

      <div
        style={{
          padding: '40px',
          background: '#fafafa',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#666',
        }}
      >
        No tasks yet. Task module will power this board.
      </div>
    </div>
  )
}

export default ProjectTasksTab