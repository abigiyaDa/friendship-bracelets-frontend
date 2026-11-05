import axios from 'axios';

export const ACCESS_TOKEN_KEY = 'admin_access_token';
export const REFRESH_TOKEN_KEY = 'admin_refresh_token';

const AUTH_ENDPOINTS = ['/auth/login/', '/auth/refresh/'];

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export function setTokens({ access, refresh }) {
  if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

// ==============================|| ADMIN API CLIENT ||============================== //

const adminApi = axios.create({
  baseURL: '/api/admin',
  headers: { 'Content-Type': 'application/json' }
});

adminApi.interceptors.request.use((config) => {
  const access = getAccessToken();

  // Never send a stale access token to login/refresh: it would be rejected before the view runs.
  if (access && !isAuthEndpoint(config.url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const { data } = await axios.post('/api/admin/auth/refresh/', { refresh });

  if (!data?.access) {
    throw new Error('Refresh response did not include an access token');
  }

  setTokens({ access: data.access, refresh: data.refresh });
  return data.access;
}

function redirectToLogin() {
  clearTokens();

  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
    window.location.assign('/admin/login');
  }
}

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      // Share one refresh request between concurrent 401 responses.
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const access = await refreshPromise;
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${access}`;

      return adminApi(originalRequest);
    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

export default adminApi;
