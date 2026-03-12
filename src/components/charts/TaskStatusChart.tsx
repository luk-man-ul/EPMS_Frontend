import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '../ui';

interface TaskStatusData {
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

interface TaskStatusChartProps {
  data: TaskStatusData;
  loading?: boolean;
}

const COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  pending: '#f59e0b',
  overdue: '#ef4444',
};

export function TaskStatusChart({ data, loading }: TaskStatusChartProps) {
  const chartData = [
    { name: 'Completed', value: data.completed, color: COLORS.completed },
    { name: 'In Progress', value: data.inProgress, color: COLORS.inProgress },
    { name: 'Pending', value: data.pending, color: COLORS.pending },
    { name: 'Overdue', value: data.overdue, color: COLORS.overdue },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Task Status Distribution
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>Loading chart...</div>
        </div>
      </Card>
    );
  }

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Task Status Distribution
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>No task data available</div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Task Status Distribution
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
