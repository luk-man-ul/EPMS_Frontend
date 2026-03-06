import { useState } from 'react';
import axios from 'axios';
import { LeaveType, getEnumOptions } from '../../../types/enums';

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
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: 500 }}>
            ❌ {error}
          </div>
        </div>
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
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Leave Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                background: '#ffffff',
              }}
            >
              {leaveTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#666666',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#666666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Reason *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Please provide a reason for your leave request..."
              required
              maxLength={500}
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
            <div
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: characterCount > characterLimit ? '#dc2626' : '#666666',
                textAlign: 'right',
              }}
            >
              {characterCount} / {characterLimit} characters
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
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
              style={{
                padding: '12px 24px',
                background: '#f3f4f6',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#d1d5db' : '#1a1a1a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#333333';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#1a1a1a';
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestPage;
