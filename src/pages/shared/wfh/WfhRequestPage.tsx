import { useState } from 'react';
import api from '../../../utils/api';
import { Button, Card, Input, ErrorMessage } from '../../../components/ui';

const WfhRequestPage = () => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fromDate) {
      setError('From date is required');
      return false;
    }
    if (!formData.toDate) {
      setError('To date is required');
      return false;
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError('From date cannot be after to date');
      return false;
    }
    if (!formData.reason.trim()) {
      setError('Reason is required');
      return false;
    }
    if (formData.reason.length > 500) {
      setError('Reason cannot exceed 500 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post('/wfh-requests', formData);
      setSuccess(true);
      setFormData({ fromDate: '', toDate: '', reason: '' });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting WFH request:', err);
      setError(err.response?.data?.message || 'Failed to submit WFH request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.reason.length;
  const characterLimit = 500;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', marginBottom: '8px' }}>
        Request Work From Home
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Submit a WFH request for approval
      </p>

      {error && <ErrorMessage message={error} type="page" onDismiss={() => setError(null)} />}

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: '#15803d', fontWeight: 500 }}>
            ✅ WFH request submitted successfully! Your request is pending approval.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Input
              label="From Date"
              type="date"
              value={formData.fromDate}
              onChange={(value) => handleChange('fromDate', value)}
              required
            />
            <Input
              label="To Date"
              type="date"
              value={formData.toDate}
              onChange={(value) => handleChange('toDate', value)}
              required
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Input
              label="Reason"
              type="textarea"
              value={formData.reason}
              onChange={(value) => handleChange('reason', value)}
              placeholder="Please provide a reason for your WFH request..."
              required
              rows={5}
              helperText={`${characterCount} / ${characterLimit} characters`}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              type="button"
              onClick={() => setFormData({ fromDate: '', toDate: '', reason: '' })}
              disabled={loading}
              variant="secondary"
            >
              Clear
            </Button>
            <Button type="submit" disabled={loading} loading={loading} variant="primary">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default WfhRequestPage;
