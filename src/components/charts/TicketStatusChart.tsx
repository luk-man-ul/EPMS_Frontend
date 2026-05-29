import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '../ui';

interface TicketStatusData {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface TicketStatusChartProps {
  data: TicketStatusData;
  loading?: boolean;
}

const COLORS = {
  open: '#f59e0b',
  inProgress: '#3b82f6',
  resolved: '#10b981',
  closed: '#6b7280',
};

export function TicketStatusChart({ data, loading }: TicketStatusChartProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = [
    { name: 'Open', value: data.open, color: COLORS.open },
    { name: 'In Progress', value: data.inProgress, color: COLORS.inProgress },
    { name: 'Resolved', value: data.resolved, color: COLORS.resolved },
    { name: 'Closed', value: data.closed, color: COLORS.closed },
  ].filter(item => item.value > 0);

  if (loading) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Ticket Status Distribution
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
          Ticket Status Distribution
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>No ticket data available</div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Ticket Status Distribution
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={!isMobile}
              label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={isMobile ? 55 : 80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={isMobile ? { fontSize: '11px' } : undefined} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
