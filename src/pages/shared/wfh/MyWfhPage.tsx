import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import WfhRequestForm from './components/WfhRequestForm';
import { Button, Card, LoadingSpinner, Modal } from '../../../components/ui';
import { useToast } from '../../../context/ToastContext';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  PENDING:  { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  APPROVED: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  REJECTED: { color: '#991b1b', bg: '#fee2e2', label: 'Rejected' },
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const MyWfhPage = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wfh-requests/my');
      setRequests(response.data);
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to fetch WFH requests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'flex-start',
        gap: isMobile ? '16px' : '0px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: 0 }}>
            My WFH Requests
          </h1>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          style={isMobile ? { width: '100%', display: 'block', textAlign: 'center' } : undefined}
        >
          + Request WFH
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <LoadingSpinner text="Loading WFH requests..." />
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            No WFH requests yet
          </div>
        </Card>
      ) : isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requests.map((req) => {
            const s = statusConfig[req.status] || statusConfig.PENDING;
            return (
              <div
                key={req.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                }}
              >
                {/* Header: Date Range & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#888' }}>Date Range</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', marginTop: '2px' }}>
                      {formatDate(req.fromDate)} – {formatDate(req.toDate)}
                    </div>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                </div>

                {/* Reason */}
                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#888' }}>Reason</div>
                  <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {req.reason}
                  </div>
                </div>

                {/* Submitted */}
                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>
                    Submitted: {formatDate(req.createdAt)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Card padding="none">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e5e5' }}>
                {['From Date', 'To Date', 'Reason', 'Status', 'Submitted'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const s = statusConfig[req.status] || statusConfig.PENDING;
                return (
                  <tr key={req.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      {formatDate(req.fromDate)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>
                      {formatDate(req.toDate)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937', maxWidth: '320px' }}>
                      {req.reason}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {formatDate(req.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Request WFH Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Request Work From Home"
        size="md"
      >
        <WfhRequestForm
          onSuccess={fetchRequests}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default MyWfhPage;
