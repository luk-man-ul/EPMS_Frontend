import { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';
import { Button, Card, ErrorMessage, Badge } from '../../../components/ui';

// Live elapsed time hook — ticks every second, accounts for server/client clock offset
const useLiveElapsed = (checkIn: string | null, serverNow: number) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!checkIn) { setElapsed(0); return; }

    // Use server time as reference to avoid client clock skew
    const checkInMs = new Date(checkIn).getTime();
    const clientOffsetMs = Date.now() - serverNow; // how far client is behind/ahead of server

    const tick = () => {
      const serverNowMs = Date.now() - clientOffsetMs;
      setElapsed(Math.max(0, (serverNowMs - checkInMs) / 3600000));
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [checkIn, serverNow]);

  return elapsed;
};

const formatElapsed = (hours: number) => {
  const totalSecs = Math.floor(hours * 3600);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

const CheckInPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayData, setTodayData] = useState<any>(null);
  const [locationSupported, setLocationSupported] = useState(true);
  const [serverNow, setServerNow] = useState(() => Date.now());

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationSupported(false);
    }
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      // Capture server time from response Date header to correct clock skew
      const serverDate = response.headers['date'];
      if (serverDate) setServerNow(new Date(serverDate).getTime());
      setTodayData({
        sessions: response.data.sessions || [],
        totalHours: response.data.totalHours || 0,
      });
    } catch (err: any) {
      // 404 means no attendance record for today, which is fine
      if (err.response?.status !== 404) {
        console.error('Error fetching attendance:', err);
      }
      setTodayData({ sessions: [], totalHours: 0 });
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const checkInResponse = await api.post('/attendance/check-in', {
            latitude,
            longitude,
          });
          // Capture server time immediately from check-in response
          const serverDate = checkInResponse.headers['date'];
          if (serverDate) setServerNow(new Date(serverDate).getTime());

          setSuccess('Successfully checked in!');
          setTimeout(async () => {
            await fetchTodayAttendance();
            setSuccess(null);
          }, 1000);
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
      // Force refresh to get updated state
      setTimeout(async () => {
        await fetchTodayAttendance();
        setSuccess(null);
      }, 1000);
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
    const ms = end - start;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const hasActiveSession = todayData?.sessions?.some((s: any) => !s.checkOut);
  const activeSession = todayData?.sessions?.find((s: any) => !s.checkOut) || null;
  const liveElapsed = useLiveElapsed(activeSession?.checkIn ?? null, serverNow);

  // Total = completed sessions hours + live elapsed for active session
  const completedHours = (todayData?.sessions || [])
    .filter((s: any) => s.checkOut)
    .reduce((acc: number, s: any) => {
      return acc + (new Date(s.checkOut).getTime() - new Date(s.checkIn).getTime()) / 3600000;
    }, 0);
  const liveTotal = Math.max(0, completedHours + (activeSession ? liveElapsed : 0));

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
        <ErrorMessage
          message="Geolocation is not supported by your browser. Please use a modern browser to check in."
          type="page"
        />
      )}

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
            ✅ {success}
          </div>
        </div>
      )}

      {/* Today's Sessions */}
      {todayData && todayData.sessions && todayData.sessions.length > 0 && (
        <Card className="mb-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
              Today's Sessions
            </h3>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981' }}>
              Total: {activeSession ? formatElapsed(liveTotal) : (() => {
                const h = Math.floor(todayData.totalHours || 0);
                const m = Math.round(((todayData.totalHours || 0) - h) * 60);
                if (h === 0 && m === 0) return '0m';
                if (h === 0) return `${m}m`;
                if (m === 0) return `${h}h`;
                return `${h}h ${m}m`;
              })()}
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
                    {session.checkOut
                      ? calculateDuration(session.checkIn, session.checkOut)
                      : formatElapsed(liveElapsed)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {!session.checkOut && (
                    <Badge variant="info">Active</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {!hasActiveSession && (
            <Button
              onClick={handleCheckIn}
              disabled={loading || !locationSupported}
              loading={loading}
              variant="primary"
              size="lg"
              style={{ flex: 1, minWidth: '200px' }}
            >
              {loading ? 'Processing...' : '✅ Check In'}
            </Button>
          )}

          {hasActiveSession && (
            <Button
              onClick={handleCheckOut}
              disabled={loading}
              loading={loading}
              variant="danger"
              size="lg"
              style={{ flex: 1, minWidth: '200px' }}
            >
              {loading ? 'Processing...' : '🚪 Check Out'}
            </Button>
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
      </Card>
    </div>
  );
};

export default CheckInPage;
