import { useState } from 'react';
import axios from 'axios';
import { LeaveType, getEnumOptions } from '../../../types/enums';
import { Button, Card, Input, Select, ErrorMessage } from '../../../components/ui';

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

const LeaveRequestPage = () => {
  const [formData, setFormData] = useState({
    type: 'CASUAL' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const leaveTypeOptions = getEnumOptions(LeaveType);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date cannot be after end date');
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
      await api.post('/leave', formData);
      setSuccess(true);
      // Reset form
      setFormData({
        type: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.reason.length;
  const characterLimit = 500;

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '8px',
        }}
      >
        Request Leave
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Submit a new leave request for approval
      </p>

      {error && (
        <ErrorMessage
          message={error}
          type="page"
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#15803d', fontWeight: 500 }}>
            ✅ Leave request submitted successfully! Your request is pending approval.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <Select
            label="Leave Type"
            value={formData.type}
            onChange={(value) => handleChange('type', value as string)}
            options={leaveTypeOptions}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(value) => handleChange('startDate', value)}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(value) => handleChange('endDate', value)}
              required
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Input
              label="Reason"
              type="textarea"
              value={formData.reason}
              onChange={(value) => handleChange('reason', value)}
              placeholder="Please provide a reason for your leave request..."
              required
              rows={5}
              helperText={`${characterCount} / ${characterLimit} characters`}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button
              type="button"
              onClick={() =>
                setFormData({
                  type: 'CASUAL',
                  startDate: '',
                  endDate: '',
                  reason: '',
                })
              }
              disabled={loading}
              variant="secondary"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              variant="primary"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default LeaveRequestPage;
