import { useState, useEffect } from 'react';
import api from '../../../../utils/api';

interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  openTasks: number;
  openTickets: number;
  todayAttendance: number;
  monthlyProfit: number;
}

const StatsCards = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(2)}K`;
    }
    return `₹${amount.toFixed(2)}`;
  };

  const statsCardsData = stats
    ? [
        { title: 'Total Employees', value: stats.totalEmployees },
        { title: 'Active Projects', value: stats.activeProjects },
        { title: 'Open Tasks', value: stats.openTasks },
        { title: 'Open Tickets', value: stats.openTickets },
        { title: 'Today Attendance', value: `${stats.todayAttendance}%` },
        { title: 'Monthly Profit', value: formatCurrency(stats.monthlyProfit) },
      ]
    : [];

  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="stat-card skeleton">
            <div className="stat-title skeleton-text"></div>
            <div className="stat-value skeleton-text"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-grid">
        <div className="stat-card error">
          <div className="stat-title">Error</div>
          <div className="stat-value">{error}</div>
          <button onClick={fetchDashboardStats} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {statsCardsData.map((item, index) => (
        <div key={index} className="stat-card">
          <div className="stat-title">{item.title}</div>
          <div className="stat-value">{item.value}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
