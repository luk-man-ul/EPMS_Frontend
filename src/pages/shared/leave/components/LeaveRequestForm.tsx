import { useState } from 'react';
import api from '../../../../utils/api';
import { LeaveType, getEnumOptions } from '../../../../types/enums';
import { Button, Input, Select } from '../../../../components/ui';
import { useToast } from '../../../../context/ToastContext';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

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
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      <Select
        label="Leave Type"
        value={formData.type}
        onChange={(value) => handleChange('type', value as string)}
        options={leaveTypeOptions}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
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

      <div style={{ marginTop: 16 }}>
        <Input
          label="Reason"
          type="textarea"
          value={formData.reason}
          onChange={(value) => handleChange('reason', value)}
          placeholder="Please provide a reason for your leave request..."
          required
          rows={4}
          helperText={`${characterCount} / 500 characters`}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  );
};

export default LeaveRequestForm;
