import { useState, useEffect } from 'react';
import axios from 'axios';
import LeaveApprovalCard from './components/LeaveApprovalCard';

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

const LeaveApprovalPage = () => {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingLeaves();
  }, []);

  const fetchPendingLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/pending-approvals');
      setPendingLeaves(response.data);
    } catch (err: any) {
      console.error('Error fetching pending leave approvals:', err);
      alert(err.response?.data?.message || 'Failed to fetch pending leave approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchPendingLeaves();
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
          Leave Approvals
        </h1>
        <p style={{ fontSize: '14px', color: '#666666' }}>
          Review and approve pending leave requests from your team members
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
            Loading pending approvals...
          </div>
        </div>
      ) : pendingLeaves.length === 0 ? (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e5e5',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '16px', fontWeight: 500, color: '#1a1a1a', marginBottom: '8px' }}>
            No Pending Approvals
          </div>
          <div style={{ fontSize: '14px', color: '#666666' }}>
            All leave requests have been processed
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px',
          }}
        >
          {pendingLeaves.map((leave) => (
            <LeaveApprovalCard key={leave.id} leave={leave} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaveApprovalPage;
