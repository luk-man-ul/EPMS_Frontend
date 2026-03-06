import { useState, useEffect } from 'react';
import axios from 'axios';

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

const CheckInPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayData, setTodayData] = useState<any>(null);
  const [locationSupported, setLocationSupported] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationSupported(false);
    }
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayData(response.data);
    } catch (err: any) {
      // 404 means no attendance record for today, which is fine
      if (err.response?.status !== 404) {
        console.error('Error fetching attendance:', err);
      }
      setTodayData(null);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          await api.post('/attendance/check-in', {
            latitude,
            longitude,
          });
          setSuccess('Successfully checked in!');
          await fetchTodayAttendance();
        } catch (err: any) {
          console.error('Check-in error:', err);
          setError(err.response?.data?.message || 'Failed to check in. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Location access is required for attendance check-in. Please enable location permissions.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/attendance/check-out');
      setSuccess('Successfully checked out!');
      await fetchTodayAttendance();
    } catch (err: any) {
      console.error('Check-out error:', err);
      setError(err.response?.data?.message || 'Failed to check out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const calculateDuration = (checkIn: string, checkOut: string | null) => {
    if (!checkOut) return 'Running';
    const start = new Date(checkIn).getTime();
    const end = new Date(checkOut).getTime();
    const hours = (end - start) / (1000 * 60 * 60);
    return `${hours.toFixed(2)}h`;
  };

  const hasActiveSession = todayData?.sessions?.some((s: any) => !s.checkOut);

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '8px',
        }}
      >
        Attendance Check-In
      </h1>
      <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
        Record your daily attendance - multiple sessions supported
      </p>

      {!locationSupported && (
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
            ⚠️ Geolocation Not Supported
          </div>
          <div style={{ fontSize: '13px', color: '#991b1b', marginTop: '4px' }}>
            Your browser does not support geolocation. Please use a modern browser to check in.
          </div>
        </div>
      )}

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
            ✅ {success}
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      {todayData && todayData.sessions && todayData.sessions.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
              Today's Sessions
            </h3>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>
              Total: {todayData.totalHours.toFixed(2)}h
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todayData.sessions.map((session: any) => (
              <div
                key={session.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 100px 100px 1fr',
                  gap: '16px',
                  padding: '12px',
                  background: session.checkOut ? '#f9fafb' : '#f0f9ff',
                  borderRadius: '8px',
                  border: session.checkOut ? '1px solid #e5e7eb' : '1px solid #bae6fd',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Check In</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                    {formatTime(session.checkIn)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Check Out</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
                    {formatTime(session.checkOut)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Duration</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: session.checkOut ? '#1f2937' : '#0369a1' }}>
                    {calculateDuration(session.checkIn, session.checkOut)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {!session.checkOut && (
                    <span
                      style={{
                        padding: '4px 12px',
                        background: '#0369a1',
                        color: '#ffffff',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {!hasActiveSession && (
            <button
              onClick={handleCheckIn}
              disabled={loading || !locationSupported}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px 24px',
                background: loading || !locationSupported ? '#d1d5db' : '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading || !locationSupported ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading && locationSupported) e.currentTarget.style.background = '#059669';
              }}
              onMouseLeave={(e) => {
                if (!loading && locationSupported) e.currentTarget.style.background = '#10b981';
              }}
            >
              {loading ? '⏳ Processing...' : '✅ Check In'}
            </button>
          )}

          {hasActiveSession && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '16px 24px',
                background: loading ? '#d1d5db' : '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = '#dc2626';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.background = '#ef4444';
              }}
            >
              {loading ? '⏳ Processing...' : '🚪 Check Out'}
            </button>
          )}
        </div>

        {!hasActiveSession && todayData?.sessions?.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666666',
              textAlign: 'center',
            }}
          >
            You can start a new session by checking in again
          </div>
        )}

        {hasActiveSession && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#0369a1',
              textAlign: 'center',
            }}
          >
            You have an active session. Please check out before starting a new session.
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckInPage;
