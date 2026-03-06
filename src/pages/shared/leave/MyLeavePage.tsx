import { useState, useEffect } from 'react';
import axios from 'axios';
import LeaveTable from './components/LeaveTable';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MyLeavePage = () => {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/my');
      setLeaveRequests(response.data);
    } catch (err: any) {
      console.error('Error fetching leave requests:', err);
      alert(err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '8px',
          }}
        >
          My Leave Requests
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          View all your leave requests and their approval status
        </p>
      </div>

      {loading ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#666666' }}>
            Loading leave requests...
          </div>
        </div>
      ) : (
        <LeaveTable data={leaveRequests} showUserColumn={false} />
      )}
    </div>
  );
};

export default MyLeavePage;
