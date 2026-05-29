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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchDashboardStats();
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      <>
        {isMobile && (
          <style>{`
            .admin-stats-container::-webkit-scrollbar {
              display: none;
            }
            .admin-stats-container {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
          `}</style>
        )}
        <div 
          className={isMobile ? "admin-stats-container" : "stats-grid"}
          style={isMobile ? {
            display: 'flex',
            overflowX: 'auto',
            gap: '12px',
            paddingBottom: '10px',
            width: '100%',
            WebkitOverflowScrolling: 'touch',
          } : undefined}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="stat-card skeleton"
              style={isMobile ? {
                flex: '0 0 130px',
                padding: '12px 14px',
                borderRadius: '12px',
                height: '76px',
              } : undefined}
            >
              <div className="stat-title skeleton-text"></div>
              <div className="stat-value skeleton-text"></div>
            </div>
          ))}
        </div>
      </>
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
    <>
      {isMobile && (
        <style>{`
          .admin-stats-container::-webkit-scrollbar {
            display: none;
          }
          .admin-stats-container {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        `}</style>
      )}
      <div 
        className={isMobile ? "admin-stats-container" : "stats-grid"}
        style={isMobile ? {
          display: 'flex',
          overflowX: 'auto',
          gap: '12px',
          paddingBottom: '10px',
          width: '100%',
          WebkitOverflowScrolling: 'touch',
        } : undefined}
      >
        {statsCardsData.map((item, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={isMobile ? {
              flex: '0 0 130px',
              padding: '12px 14px',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            } : undefined}
          >
            <div className="stat-title" style={isMobile ? { fontSize: '11px', marginBottom: '4px' } : undefined}>{item.title}</div>
            <div className="stat-value" style={isMobile ? { fontSize: '20px', fontWeight: 700 } : undefined}>{item.value}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StatsCards;
