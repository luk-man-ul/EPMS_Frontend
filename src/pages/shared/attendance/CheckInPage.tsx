import { useState, useEffect, useRef } from 'react';
import api from '../../../utils/api';
import { ErrorMessage } from '../../../components/ui';
import { LogOut, LogIn } from 'lucide-react';

// Live elapsed time hook — ticks every second, accounts for server/client clock offset
const useLiveElapsed = (checkIn: string | null, serverNow: number) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!checkIn) { setElapsed(0); return; }

    const checkInMs = new Date(checkIn).getTime();
    const clientOffsetMs = Date.now() - serverNow;

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
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

const formatTime = (dateString: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
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
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

const CircularProgress = ({ durationText }: { durationText: string }) => {
  const radius = 140;
  const stroke = 22;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;
  
  return (
    <div className="relative flex justify-center items-center w-full max-w-[360px] mx-auto my-4">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-[135deg]"
      >
        <defs>
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#arcGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-gray-500 text-base mb-1">Duration:</span>
        <span className="text-4xl font-semibold text-gray-900 tracking-tight">{durationText}</span>
      </div>
    </div>
  );
};

const MiniCircularProgress = ({ durationText, isActive }: { durationText: string, isActive?: boolean }) => {
  const radius = 42;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;
  
  return (
    <div className="relative flex justify-center items-center w-[84px] h-[84px] shrink-0">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-[135deg]"
      >
        <defs>
          <linearGradient id={`miniGradient-${isActive ? 'active' : 'inactive'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {isActive ? (
              <>
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#10b981" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#d1d5db" />
                <stop offset="100%" stopColor="#9ca3af" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          stroke="#f1f5f9"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={`url(#miniGradient-${isActive ? 'active' : 'inactive'})`}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength * (isActive ? 1 : 0.6)} ${circumference}`}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-500 font-medium">Duration:</span>
        <span className="text-[12px] font-semibold text-gray-800 tracking-tight mt-[-2px]">{durationText}</span>
      </div>
    </div>
  );
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

    const handleAttendanceUpdated = () => fetchTodayAttendance();
    window.addEventListener('attendance-updated', handleAttendanceUpdated);
    return () => window.removeEventListener('attendance-updated', handleAttendanceUpdated);
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today', {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });
      const serverDate = response.headers['date'];
      if (serverDate) setServerNow(new Date(serverDate).getTime());
      setTodayData({
        sessions: response.data.sessions || [],
        totalHours: response.data.totalHours || 0,
      });
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Error fetching attendance:', err);
      }
      setTodayData({ sessions: [], totalHours: 0 });
    }
  };

  const handleCheckIn = async () => {
    setLoading(true); setError(null); setSuccess(null);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser'); setLoading(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const checkInResponse = await api.post('/attendance/check-in', { latitude, longitude });
          const serverDate = checkInResponse.headers['date'];
          const serverTime = serverDate ? new Date(serverDate).getTime() : Date.now();
          setServerNow(serverTime);
          const optimisticCheckIn = new Date(serverTime).toISOString();
          setTodayData((prev: any) => ({
            sessions: [...(prev?.sessions || []), { id: '__optimistic__', checkIn: optimisticCheckIn, checkOut: null }],
            totalHours: prev?.totalHours || 0,
          }));
          setSuccess('Successfully checked in!');
          window.dispatchEvent(new Event('attendance-updated'));
          setTimeout(async () => { await fetchTodayAttendance(); setSuccess(null); }, 1000);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to check in. Please try again.');
        } finally { setLoading(false); }
      },
      (error) => {
        setError('Location access is required for attendance check-in. Please enable location permissions.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckOut = async () => {
    setLoading(true); setError(null); setSuccess(null);
    try {
      await api.post('/attendance/check-out');
      setSuccess('Successfully checked out!');
      window.dispatchEvent(new Event('attendance-updated'));
      setTimeout(async () => { await fetchTodayAttendance(); setSuccess(null); }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check out. Please try again.');
    } finally { setLoading(false); }
  };

  const hasActiveSession = todayData?.sessions?.some((s: any) => !s.checkOut);
  const activeSession = todayData?.sessions?.find((s: any) => !s.checkOut) || null;
  const liveElapsed = useLiveElapsed(activeSession?.checkIn ?? null, serverNow);

  return (
    <div className="h-full flex flex-col max-h-full overflow-hidden pb-4">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-[28px] font-semibold text-gray-900 tracking-tight mb-1">Attendance Check-In</h1>
        <p className="text-gray-500 text-sm">Record your daily attendance - multiple sessions supported</p>
      </div>

      {!locationSupported && (
        <ErrorMessage message="Geolocation is not supported by your browser. Please use a modern browser to check in." type="page" />
      )}
      {error && <ErrorMessage message={error} type="page" onDismiss={() => setError(null)} />}
      
      {/* Toast Notification */}
      {success && (
        <div className="fixed bottom-8 right-8 z-50 bg-white border border-green-200 rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3 transition-all duration-300">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div className="text-sm text-gray-800 font-semibold pr-2">{success}</div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left Column: Active Tracker */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm relative flex flex-col h-full min-h-0">
          {/* Top left info */}
          {hasActiveSession ? (
            <div className="shrink-0">
              <div className="text-[26px] font-bold text-gray-900 tracking-tight">{formatTime(activeSession.checkIn)}</div>
              <div className="text-sm text-gray-500 font-medium mt-0.5">Start time</div>
            </div>
          ) : (
            <div className="shrink-0">
              <div className="text-[26px] font-bold text-gray-900 tracking-tight">{formatTime(new Date().toISOString())}</div>
              <div className="text-sm text-gray-500 font-medium mt-0.5">Current time</div>
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center relative my-2 min-h-0">
            <CircularProgress durationText={formatElapsed((todayData?.totalHours || 0) + (hasActiveSession ? liveElapsed : 0))} />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
              {hasActiveSession ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3.5 bg-[#a32a39] hover:bg-[#8b2331] text-white rounded-full font-medium shadow-xl transition-all disabled:opacity-70 whitespace-nowrap text-[17px]"
                >
                  <LogOut size={18} />
                  {loading ? 'Processing...' : 'Check Out'}
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={loading || !locationSupported}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium shadow-xl transition-all disabled:opacity-70 whitespace-nowrap text-[17px]"
                >
                  <LogIn size={18} />
                  {loading ? 'Processing...' : 'Check In'}
                </button>
              )}
            </div>
          </div>

          {/* Status Banner */}
          <div className="mt-auto shrink-0 pt-2">
            <div className="w-full text-center py-3 px-4 rounded-xl text-[13px] font-medium bg-blue-50/60 text-blue-700 border border-blue-100/60">
              {hasActiveSession 
                ? "You have an active session. Please check out before starting a new session."
                : "You can start a new session by checking in."
              }
            </div>
          </div>
        </div>

        {/* Right Column: Today's Sessions */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm flex flex-col h-full min-h-0">
          <div className="mb-4 shrink-0">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Today's Sessions</h2>
            <p className="text-sm text-gray-500 mt-0.5">{todayData?.sessions?.length || 0} total sessions</p>
          </div>
          
          <div className="flex flex-col gap-3 overflow-y-auto pr-2 min-h-0 flex-1">
            {(!todayData?.sessions || todayData.sessions.length === 0) ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No sessions recorded today yet.
              </div>
            ) : (
              todayData.sessions.map((session: any, index: number) => {
                const isActive = !session.checkOut;
                const durationText = isActive 
                  ? formatElapsed(liveElapsed)
                  : calculateDuration(session.checkIn, session.checkOut);
                  
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-[1.25rem] border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                      <MiniCircularProgress durationText={durationText} isActive={isActive} />
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900 text-lg">Session {index + 1}</span>
                          {isActive && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold tracking-wide uppercase">Active</span>
                          )}
                        </div>
                        <div className="text-gray-500 text-[15px]">
                          {formatTime(session.checkIn)} - {isActive ? 'Present' : formatTime(session.checkOut)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end mr-4">
                      <span className="text-gray-500 text-sm mb-1">Duration:</span>
                      <span className="font-semibold text-gray-900 text-lg">{durationText}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckInPage;
