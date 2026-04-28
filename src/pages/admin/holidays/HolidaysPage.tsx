import { useState, useEffect } from 'react';
import api from '../../../utils/api';

interface Holiday {
  id: string;
  date: string;
  name: string;
  description?: string;
  isRecurring: boolean;
}

const HolidaysPage = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: '', name: '', description: '' });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get('/holidays');
      setHolidays(res.data || []);
    } catch (err: any) {
      console.error('Failed to load holidays', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.name.trim()) return;
    setError('');
    setSubmitting(true);
    try {
      await api.post('/holidays', {
        date: form.date,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setForm({ date: '', name: '', description: '' });
      await fetchHolidays();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to add holiday');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this holiday?')) return;
    try {
      await api.delete(`/holidays/${id}`);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete holiday');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: 'long', day: 'numeric',
    });

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
            Holiday Management
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Define company holidays. These affect attendance finalization and the calendar view.
          </p>
        </div>

        {/* Add Holiday Form */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
            Add Holiday
          </h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Independence Day"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '180px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>Description</label>
              <input
                type="text"
                placeholder="Optional"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none', width: '100%' }}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 20px', borderRadius: '8px', border: 'none',
                background: submitting ? '#a5b4fc' : '#6366f1', color: '#fff',
                fontWeight: 600, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {submitting ? 'Adding…' : '+ Add Holiday'}
            </button>
          </form>
          {error && (
            <p style={{ marginTop: '10px', fontSize: '13px', color: '#dc2626', fontWeight: 500 }}>
              ⚠ {error}
            </p>
          )}
        </div>

        {/* Holiday List */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Holidays ({holidays.length})
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              Loading…
            </div>
          ) : holidays.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
              No holidays defined yet. Add one above.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Date', 'Name', 'Description', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, i) => (
                  <tr
                    key={holiday.id}
                    style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111827', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {formatDate(holiday.date)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111827' }}>
                      {holiday.name}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280' }}>
                      {holiday.description || '—'}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(holiday.id)}
                        style={{
                          padding: '5px 12px', borderRadius: '6px', border: '1px solid #fecaca',
                          background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default HolidaysPage;
