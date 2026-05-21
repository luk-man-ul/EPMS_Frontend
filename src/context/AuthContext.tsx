import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { setAccessToken as setApiToken, refreshAccessToken } from '../utils/api';

//////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////

export interface User {
  id:          string;
  email:       string;
  role:        string;
  permissions: string[];
}

interface AuthContextType {
  user:         User | null;
  accessToken:  string | null;
  loading:      boolean;
  login:        (data: LoginResponse) => void;
  logout:       () => Promise<void>;
  setTokens:    (accessToken: string, user: User) => void;
}

export interface LoginResponse {
  access_token: string;
  user:         User;
}

interface AuthProviderProps {
  children: ReactNode;
}

//////////////////////////////////////////////////////////
// STORAGE HELPERS
//
// Phase 3 change:
//   - access_token is stored IN MEMORY ONLY (never in localStorage/sessionStorage)
//   - user snapshot is stored in localStorage (for display only, not for auth)
//
// The refresh_token lives in an httpOnly cookie — JS cannot read it.
// The uid cookie (non-httpOnly) is set by the backend to identify the user
// for the /auth/refresh call.
//////////////////////////////////////////////////////////

const STORAGE_KEY_USER = 'user';

const readStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw && raw !== 'undefined' && raw !== 'null') return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const writeStoredUser = (user: User): void => {
  try { localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user)); } catch { /* ignore */ }
};

const clearStoredUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    // Also clear legacy token keys from old auth system
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  } catch { /* ignore */ }
};

//////////////////////////////////////////////////////////
// CONTEXT
//////////////////////////////////////////////////////////

const AuthContext = createContext<AuthContextType | null>(null);

//////////////////////////////////////////////////////////
// PROVIDER
//////////////////////////////////////////////////////////

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Access token lives ONLY in memory — never written to any storage
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // User snapshot — restored from localStorage for display, validated by silent refresh
  const [user, setUser] = useState<User | null>(null);

  // loading = true until silent refresh attempt completes on mount
  const [loading, setLoading] = useState(true);

  //////////////////////////////////////////////////////////
  // setTokens — called after login or successful refresh
  //////////////////////////////////////////////////////////

  const setTokens = useCallback((token: string, userData: User) => {
    setAccessToken(token);
    setApiToken(token);          // sync to axios interceptor
    setUser(userData);
    writeStoredUser(userData);
  }, []);

  //////////////////////////////////////////////////////////
  // login — called by LoginPage after successful POST /auth/login
  // The backend has already set the httpOnly refresh_token cookie.
  //////////////////////////////////////////////////////////

  const login = useCallback((data: LoginResponse) => {
    try {
      clearStoredUser();
      if (data?.access_token && data?.user) {
        setTokens(data.access_token, data.user);
      } else {
        console.error('[AuthContext] Invalid login data:', data);
      }
    } catch (error) {
      console.error('[AuthContext] login failed:', error);
    }
  }, [setTokens]);

  //////////////////////////////////////////////////////////
  // logout — optimistic: clears local state immediately, fires backend
  // revocation in the background without blocking the caller.
  //
  // Security: access token is cleared from memory instantly so no further
  // authenticated requests can be made. The backend revocation (cookie clear,
  // DB token revoke, tokenVersion increment) continues asynchronously.
  // The 15-minute access token TTL bounds any residual risk window.
  //////////////////////////////////////////////////////////

  const logout = useCallback(async () => {
    // Capture token before clearing state (needed for the background request)
    const tokenForRevocation = accessToken;

    // 1. Clear local auth state IMMEDIATELY — user is logged out at this point
    setAccessToken(null);
    setApiToken(null);         // clear axios interceptor token
    setUser(null);
    clearStoredUser();

    // 2. Fire backend revocation in the background — do NOT await
    // Backend will: revoke DB refresh token, increment tokenVersion, clear cookies
    fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
      method:      'POST',
      credentials: 'include',   // sends cookies
      headers:     tokenForRevocation
        ? { Authorization: `Bearer ${tokenForRevocation}` }
        : {},
    }).catch(() => {
      // Ignore network errors — local state is already cleared
    });
  }, [accessToken]);

  //////////////////////////////////////////////////////////
  // silentRefresh — called on app mount to restore session.
  // Delegates entirely to refreshAccessToken() from api.ts so this call
  // participates in the same global mutex as the axios interceptor.
  // No independent fetch — guaranteed single POST /auth/refresh at any time.
  //
  // Note: refreshAccessToken() dispatches auth:token-refreshed on success,
  // which the event listener below will catch and call setTokens(). We do NOT
  // call setTokens() here again to avoid a redundant double-set.
  //////////////////////////////////////////////////////////

  const silentRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const data = await refreshAccessToken();
      return !!(data?.access_token && data?.user);
    } catch {
      // Refresh failed — no valid session. Stay on login page.
      // _handleAuthFailure() in api.ts handles mid-session failures (redirect),
      // but on initial mount a missing cookie is normal — don't redirect here.
      return false;
    }
  }, []);

  //////////////////////////////////////////////////////////
  // On mount: attempt silent refresh to restore session.
  // If it fails, user stays logged out.
  // loading flips to false after the attempt completes.
  //////////////////////////////////////////////////////////

  useEffect(() => {
    // Pre-populate user from localStorage for instant display while refresh runs
    const storedUser = readStoredUser();
    if (storedUser) setUser(storedUser);

    silentRefresh().finally(() => setLoading(false));

    // Listen for token refreshes triggered by the axios interceptor.
    // When the interceptor silently refreshes a token mid-flight, it dispatches
    // this event so React state stays in sync without a full re-mount.
    const handleTokenRefreshed = (e: Event) => {
      const { accessToken: newToken, user: newUser } = (e as CustomEvent).detail;
      if (newToken && newUser) setTokens(newToken, newUser);
    };

    // Listen for session expiry triggered by the axios interceptor.
    const handleSessionExpired = () => {
      setAccessToken(null);
      setApiToken(null);
      setUser(null);
      clearStoredUser();
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, setTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

//////////////////////////////////////////////////////////
// HOOK
//////////////////////////////////////////////////////////

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
