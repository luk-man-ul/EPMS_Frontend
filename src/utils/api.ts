import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { Task, SelfWorkMetrics } from '../types/task';
import { TaskType } from '../types/enums';

// ─── Shared refresh result type ───────────────────────────────────────────────

export interface RefreshResult {
  access_token: string;
  user: {
    id:          string;
    email:       string;
    role:        string;
    permissions: string[];
  };
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:     import.meta.env.VITE_API_URL,
  withCredentials: true,   // always send cookies (refresh_token, uid)
});

// ─── In-memory token store ────────────────────────────────────────────────────
// The access token lives here — never in localStorage/sessionStorage.
// AuthContext calls setAccessToken() after login and after silent refresh.
// The interceptor reads it from here on every request.

let _accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};

export const getAccessToken = (): string | null => _accessToken;

// ─── Refresh state ────────────────────────────────────────────────────────────
// Single global mutex for all refresh callers — interceptor AND AuthContext.
//
// _refreshPromise holds the in-flight refresh call so every concurrent caller
// (axios interceptor, AuthContext.silentRefresh, NotificationBell socket init)
// awaits the SAME promise instead of firing independent POST /auth/refresh
// requests. This eliminates the parallel refresh race entirely.

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject:  (error: unknown) => void;
}

let _isRefreshing    = false;
let _refreshPromise: Promise<RefreshResult> | null = null;
let _refreshSubscribers: RefreshSubscriber[] = [];

const subscribeToRefresh = (
  resolve: (token: string) => void,
  reject:  (error: unknown) => void,
): void => {
  _refreshSubscribers.push({ resolve, reject });
};

const resolveRefreshSubscribers = (newToken: string): void => {
  _refreshSubscribers.forEach(({ resolve }) => resolve(newToken));
  _refreshSubscribers = [];
};

const rejectRefreshSubscribers = (error: unknown): void => {
  _refreshSubscribers.forEach(({ reject }) => reject(error));
  _refreshSubscribers = [];
};

// ─── Shared refresh function ──────────────────────────────────────────────────
//
// Callers:
//   - axios response interceptor (on 401)
//   - AuthContext.silentRefresh() (on app mount)
//
// Guarantees:
//   - Only ONE POST /auth/refresh is ever in-flight at a time
//   - All concurrent callers await the same promise
//   - On success: updates _accessToken, dispatches auth:token-refreshed
//   - On failure: dispatches auth:session-expired, redirects to login
//   - _refreshPromise is always cleared in finally so the next call starts fresh

export const refreshAccessToken = (): Promise<RefreshResult> => {
  // If a refresh is already in-flight, return the same promise — don't fire again
  if (_refreshPromise) return _refreshPromise;

  _isRefreshing = true;

  _refreshPromise = axios
    .post<RefreshResult>(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    .then((res) => {
      const newToken = res.data.access_token;
      const newUser  = res.data.user;

      // Update in-memory token — single source of truth
      _accessToken = newToken;

      // Notify AuthContext so React state stays in sync
      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', {
          detail: { accessToken: newToken, user: newUser },
        }),
      );

      // Unblock all queued interceptor requests
      resolveRefreshSubscribers(newToken);

      return res.data;
    })
    .catch((err) => {
      // Reject all queued interceptor requests immediately
      rejectRefreshSubscribers(err);
      _handleAuthFailure();
      return Promise.reject(err);
    })
    .finally(() => {
      _isRefreshing   = false;
      _refreshPromise = null;   // clear so next expiry starts a fresh call
    });

  return _refreshPromise;
};

// ─── Request interceptor ─────────────────────────────────────────────────────
// Attaches the in-memory access token to every request.

api.interceptors.request.use((config) => {
  const token = _accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
// On 401:
//   1. If not already refreshing, call refreshAccessToken() — the shared mutex
//      ensures only one POST /auth/refresh is ever in-flight globally.
//   2. On success: token is already updated by refreshAccessToken(); retry request.
//   3. On failure: refreshAccessToken() already called _handleAuthFailure().
// The _retry flag prevents infinite loops — a request is only retried once.

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    // (avoids infinite loop when the refresh token itself is invalid)
    if (originalRequest.url?.includes('/auth/refresh')) {
      _handleAuthFailure();
      return Promise.reject(error);
    }

    // Don't retry the logout endpoint
    if (originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (_isRefreshing) {
      // refreshAccessToken() is already in-flight — queue this request.
      // It will be resolved/rejected when the shared promise settles.
      return new Promise((resolve, reject) => {
        subscribeToRefresh(
          (newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            resolve(api(originalRequest));
          },
          (err) => reject(err),
        );
      });
    }

    try {
      // Kick off (or join) the single shared refresh
      const result = await refreshAccessToken();
      const newToken = result.access_token;

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // refreshAccessToken() already handled failure — just propagate
      return Promise.reject(refreshError);
    }
  },
);

// ─── Auth failure handler ─────────────────────────────────────────────────────
// Called when a refresh attempt fails mid-session (token expired, revoked, etc.)
// Only redirects to login if there was an active session to lose (_accessToken
// was set). On initial app mount with no cookie, _accessToken is already null
// so we skip the redirect — AuthContext handles that case via loading=false.

function _handleAuthFailure(): void {
  const hadSession = _accessToken !== null;
  _accessToken = null;
  // Clear legacy storage keys (migration safety)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  // Notify AuthContext to clear React state
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  // Only hard-redirect if the user had an active session — avoids spurious
  // redirects when the initial silent refresh finds no cookie on first visit.
  if (hadSession) {
    window.location.href = '/auth/login';
  }
}

// ─── DTO interfaces ───────────────────────────────────────────────────────────

export interface CreateSelfWorkDto {
  projectId:    string;
  title:        string;
  description:  string;
  priority?:    string;
  dueDate?:     string;
  estimatedHrs?: number;
}

export interface RejectSelfWorkDto {
  reason: string;
}

export interface TaskFilterParams {
  projectId?:    string;
  status?:       string;
  priority?:     string;
  assignedToId?: string;
  type?:         TaskType;
  page?:         number;
  limit?:        number;
}

// ─── Self-Work API methods ────────────────────────────────────────────────────

export const createSelfWork = async (dto: CreateSelfWorkDto): Promise<Task> => {
  const response = await api.post<Task>('/tasks/self-work', dto);
  return response.data;
};

export const approveSelfWork = async (taskId: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/pending-approvals/${taskId}/approve`);
  return response.data;
};

export const rejectSelfWork = async (taskId: string, reason: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/pending-approvals/${taskId}/reject`, { reason });
  return response.data;
};

export const getPendingApprovals = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks/pending-approvals');
  return response.data;
};

export const getSelfWorkMetrics = async (projectId?: string): Promise<SelfWorkMetrics> => {
  const params = projectId ? { projectId } : {};
  const response = await api.get<SelfWorkMetrics>('/tasks/self-work-metrics', { params });
  return response.data;
};

export const getTasks = async (filters?: TaskFilterParams): Promise<Task[]> => {
  const response = await api.get<Task[]>('/tasks', { params: filters });
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

export default api;
