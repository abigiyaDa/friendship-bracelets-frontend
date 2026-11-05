import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// project imports
import adminApi, { clearTokens, getAccessToken, setTokens } from 'services/adminApi';

// ==============================|| ADMIN AUTH CONTEXT ||============================== //

const AuthContext = createContext(undefined);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      if (!getAccessToken()) {
        if (active) setLoading(false);
        return;
      }

      try {
        const { data } = await adminApi.get('/auth/me/');
        if (active) setUser(data);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await adminApi.post('/auth/login/', { username, password });

    setTokens({ access: data.access, refresh: data.refresh });

    const me = await adminApi.get('/auth/me/');
    setUser(me.data);

    return me.data;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, isAuthenticated: Boolean(user), login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AdminAuthProvider.propTypes = { children: PropTypes.node };

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AdminAuthProvider');
  }

  return context;
}

export default AuthContext;
