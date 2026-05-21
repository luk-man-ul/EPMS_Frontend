import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { Task, SelfWorkMetrics } from '../types/task';
import { TaskType } from '../types/enums';

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
// Prevents multiple concurrent refresh calls when several requests 401 at once.
// All queued requests wait for the single refresh to complete, then retry.
//
// Each subscriber holds both resolve and reject so the promise can be settled
// in either direction — no dangling promises, no artificial timeouts needed.

interface RefreshSubscriber {
  resolve: (token: string) => void;
  reject:  (error: unknown) => void;
}

let _isRefreshing = false;
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
//   1. If not already refreshing, call POST /auth/refresh (uses httpOnly cookie).
//   2. On success: update in-memory token, retry all queued requests once.
//   3. On failure: clear auth state and redirect to login.
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
      // Another request is already refreshing — queue this one.
      // The promise is settled by resolveRefreshSubscribers / rejectRefreshSubscribers,
      // so it never hangs regardless of whether the refresh succeeds or fails.
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

    _isRefreshing = true;

    try {
      // Call refresh endpoint — httpOnly cookie is sent automatically
      const refreshRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken: string = refreshRes.data.access_token;
      const newUser           = refreshRes.data.user;

      // Update in-memory token
      _accessToken = newToken;

      // Notify AuthContext so React state stays in sync
      // We dispatch a custom event — AuthContext listens for it
      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', { detail: { accessToken: newToken, user: newUser } }),
      );

      // Retry all queued requests with the new token
      resolveRefreshSubscribers(newToken);

      // Retry the original request
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — reject all queued subscribers immediately so their
      // promises settle right now instead of hanging until a timeout.
      rejectRefreshSubscribers(refreshError);
      _handleAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  },
);

// ─── Auth failure handler ─────────────────────────────────────────────────────

function _handleAuthFailure(): void {
  _accessToken = null;
  // Clear legacy storage keys (migration safety)
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  // Notify AuthContext to clear React state
  window.dispatchEvent(new CustomEvent('auth:session-expired'));
  window.location.href = '/auth/login';
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
