import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../ui';

interface ProjectData {
  name: string;
  progress: number;
}

interface ProjectProgressChartProps {
  data: ProjectData[];
  loading?: boolean;
}

const getProgressColor = (progress: number) => {
  if (progress >= 80) return '#10b981'; // Green
  if (progress >= 50) return '#3b82f6'; // Blue
  if (progress >= 30) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

export function ProjectProgressChart({ data, loading }: ProjectProgressChartProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (loading) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Project Progress Overview
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>Loading chart...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Project Progress Overview
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>No project data available</div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Project Progress Overview
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={isMobile ? { top: 10, right: 5, left: -25, bottom: 5 } : undefined}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              angle={-45}
              textAnchor="end"
              height={isMobile ? 65 : 80}
            />
            <YAxis 
              tick={{ fontSize: isMobile ? 10 : 12 }}
              domain={[0, 100]}
              label={isMobile ? undefined : { value: 'Progress (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => `${value}%`}
              labelStyle={{ color: '#1a1a1a' }}
            />
            <Legend wrapperStyle={isMobile ? { fontSize: '11px' } : undefined} />
            <Bar dataKey="progress" name="Completion %" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getProgressColor(entry.progress)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
