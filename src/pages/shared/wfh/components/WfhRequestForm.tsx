import { useState } from 'react';
import api from '../../../../utils/api';
import { Button, Input } from '../../../../components/ui';
import { useToast } from '../../../../context/ToastContext';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const WfhRequestForm = ({ onSuccess, onClose }: Props) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fromDate) { setError('From date is required'); return false; }
    if (!formData.toDate) { setError('To date is required'); return false; }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      setError('From date cannot be after to date'); return false;
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
      await api.post('/wfh-requests', formData);
      showToast('success', 'WFH request submitted successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to submit WFH request';
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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

      <div style={{ marginTop: 16 }}>
        <Input
          label="Reason"
          type="textarea"
          value={formData.reason}
          onChange={(value) => handleChange('reason', value)}
          placeholder="Please provide a reason for your WFH request..."
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

export default WfhRequestForm;
