interface TaskProgressBarProps {
  status: string;
}

const TaskProgressBar = ({ status }: TaskProgressBarProps) => {
  // Calculate progress based on task status
  const getProgress = (status: string): number => {
    switch (status) {
      case 'TODO':
        return 0;
      case 'IN_PROGRESS':
        return 50;
      case 'REVIEW':
        return 75;
      case 'COMPLETED':
        return 100;
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress(status);

  // Color scheme based on progress
  const getColor = (progress: number): string => {
    if (progress === 0) return '#e5e7eb'; // gray
    if (progress === 100) return '#10b981'; // green
    return '#3b82f6'; // blue
  };

  const color = getColor(progress);

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: color,
            transition: 'width 0.3s ease, background-color 0.3s ease',
            borderRadius: '4px',
          }}
        />
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '4px',
          fontWeight: 500,
        }}
      >
        {progress}%
      </div>
    </div>
  );
};

export default TaskProgressBar;
