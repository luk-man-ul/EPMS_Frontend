import { useState } from 'react';
import api from '../../../../utils/api';
import { LeaveType, getEnumOptions } from '../../../../types/enums';
import { useToast } from '../../../../context/ToastContext';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #e5e5e5',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  display: 'block',
  color: '#374151',
};

const LeaveRequestForm = ({ onSuccess, onClose }: Props) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    type: 'CASUAL' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leaveTypeOptions = getEnumOptions(LeaveType);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.startDate) { setError('Start date is required'); return false; }
    if (!formData.endDate) { setError('End date is required'); return false; }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date cannot be after end date'); return false;
    }
    if (!formData.reason.trim()) { setError('Reason is required'); return false; }
    if (formData.reason.length > 500) { setError('Reason cannot exceed 500 characters'); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/leave', formData);
      showToast('success', 'Leave request submitted successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to submit leave request';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const characterCount = formData.reason.length;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && (
        <div style={{ background: '#fff5f5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Leave Type */}
      <div>
        <label style={labelStyle}>Leave Type</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          style={inputStyle}
          required
        >
          {leaveTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            style={inputStyle}
            required
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            style={inputStyle}
            required
          />
        </div>
      </div>

      {/* Reason */}
      <div>
        <label style={labelStyle}>Reason</label>
        <textarea
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          placeholder="Please provide a reason for your leave request..."
          rows={4}
          style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
          required
        />
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>
          {characterCount} / 500
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: loading ? '#555' : '#111', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
