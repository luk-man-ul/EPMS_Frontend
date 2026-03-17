import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import LeaveTable from './components/LeaveTable';
import { Card, LoadingSpinner } from '../../../components/ui';

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
        <Card>
          <LoadingSpinner text="Loading leave requests..." />
        </Card>
      ) : (
        <LeaveTable data={leaveRequests} showUserColumn={false} />
      )}
    </div>
  );
};

export default MyLeavePage;
