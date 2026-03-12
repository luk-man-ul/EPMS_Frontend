import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '../ui';

interface AttendanceDataPoint {
  date: string;
  present: number;
  absent: number;
}

interface AttendanceTrendChartProps {
  data: AttendanceDataPoint[];
  loading?: boolean;
  days?: 7 | 30;
}

export function AttendanceTrendChart({ data, loading, days = 7 }: AttendanceTrendChartProps) {
  if (loading) {
    return (
      <Card padding="md">
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
          Attendance Trend (Last {days} Days)
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
          Attendance Trend (Last {days} Days)
        </h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#666' }}>No attendance data available</div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Attendance Trend (Last {days} Days)
      </h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="present" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Present"
              activeDot={{ r: 8 }}
            />
            <Line 
              type="monotone" 
              dataKey="absent" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Absent"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
