import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import LeaveTable from './components/LeaveTable';
import LeaveRequestForm from './components/LeaveRequestForm';
import { Button, Card, LoadingSpinner, Modal } from '../../../components/ui';
import { useToast } from '../../../context/ToastContext';

const MyLeavePage = () => {
  const { showToast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave/my');
      setLeaveRequests(response.data);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: 0 }}>
            My Leave Requests
          </h1>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          + Request Leave
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <LoadingSpinner text="Loading leave requests..." />
        </Card>
      ) : (
        <LeaveTable data={leaveRequests} showUserColumn={false} />
      )}

      {/* Request Leave Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Leave"
        size="md"
      >
        <LeaveRequestForm
          onSuccess={fetchLeaveRequests}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default MyLeavePage;
