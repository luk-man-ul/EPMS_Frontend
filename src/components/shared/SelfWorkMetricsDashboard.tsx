import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSelfWorkMetrics } from '../../utils/api';
import type { SelfWorkMetrics } from '../../types/task';
import axios from 'axios';

interface SelfWorkMetricsDashboardProps {
  projectId?: string;
}

const SelfWorkMetricsDashboard = ({ projectId }: SelfWorkMetricsDashboardProps) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SelfWorkMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
  const [projects, setProjects] = useState<any[]>([]);

  // Only TEAM_LEAD and ADMIN can view self-work metrics
  if (!user || user.role === 'EMPLOYEE') {
    return null;
  }

  useEffect(() => {
    // Fetch projects for Team Leads
    if (user?.role === 'TEAM_LEAD') {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/projects/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.data && Array.isArray(res.data)) {
        setProjects(res.data);
      } else {
        console.warn('Invalid projects response format');
        setProjects([]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await getSelfWorkMetrics(selectedProjectId || undefined);
      
      if (data) {
        setMetrics(data);
      } else {
        console.warn('No metrics data received');
        setMetrics(null);
      }
    } catch (err) {
      console.error('Failed to load metrics:', err);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
      }}>
        Loading metrics...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        color: '#6b7280',
      }}>
        No metrics available
      </div>
    );
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          margin: 0,
        }}>
          Self-Work Metrics
        </h3>

        {/* Project selector for Team Leads */}
        {user?.role === 'TEAM_LEAD' && projects.length > 0 && (
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <MetricCard
          label="Total Proposed"
          value={metrics.totalProposed ?? 0}
          color="#3b82f6"
        />
        <MetricCard
          label="Approved"
          value={metrics.totalApproved ?? 0}
          color="#10b981"
        />
        <MetricCard
          label="Rejected"
          value={metrics.totalRejected ?? 0}
          color="#ef4444"
        />
        <MetricCard
          label="Approval Rate"
          value={`${metrics.approvalRate ?? 0}%`}
          color="#8b5cf6"
        />
        <MetricCard
          label="Avg Approval Time"
          value={`${(metrics.avgApprovalTimeHours ?? 0).toFixed(1)}h`}
          color="#f59e0b"
        />
        <MetricCard
          label="Pending"
          value={metrics.pendingCount ?? 0}
          color="#fbbf24"
        />
      </div>

      {/* By Employee Table */}
      {metrics.byEmployee && metrics.byEmployee.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
          }}>
            By Employee
          </h4>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={tableHeaderStyle}>Employee</th>
                <th style={tableHeaderStyle}>Proposed</th>
                <th style={tableHeaderStyle}>Approved</th>
                <th style={tableHeaderStyle}>Rejected</th>
                <th style={tableHeaderStyle}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {metrics.byEmployee.map(emp => (
                <tr key={emp.employeeId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tableCellStyle}>{emp.employeeName}</td>
                  <td style={tableCellStyle}>{emp.proposed ?? 0}</td>
                  <td style={tableCellStyle}>{emp.approved ?? 0}</td>
                  <td style={tableCellStyle}>{emp.rejected ?? 0}</td>
                  <td style={tableCellStyle}>
                    {(emp.proposed ?? 0) > 0 
                      ? `${Math.round(((emp.approved ?? 0) / emp.proposed) * 100)}%`
                      : 'N/A'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value, color }: any) => (
  <div style={{
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
  }}>
    <div style={{
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '8px',
    }}>
      {label}
    </div>
    <div style={{
      fontSize: '24px',
      fontWeight: 700,
      color,
    }}>
      {value}
    </div>
  </div>
);

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#374151',
};

const tableCellStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  color: '#6b7280',
};

export default SelfWorkMetricsDashboard;
