import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize immediately from localStorage so there is ZERO initial buffering spinner
  const [token, setToken] = useState(() => localStorage.getItem('cfm_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cfm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // If user is already in localStorage, loading is false instantly!
  const [loading, setLoading] = useState(() => {
    const savedToken = localStorage.getItem('cfm_token');
    const savedUser = localStorage.getItem('cfm_user');
    // If we have token & user, don't block with loading spinner
    return Boolean(savedToken && !savedUser);
  });

  useEffect(() => {
    // Non-blocking background sync
    const syncAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      // If it's a demo token, we already have the user in localStorage or state
      if (token.startsWith('demo-')) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('cfm_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        // Only log out if it's explicitly 401 Unauthorized
        if (err.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, [token]);

  const login = (userData, tokenStr) => {
    localStorage.setItem('cfm_token', tokenStr);
    localStorage.setItem('cfm_user', JSON.stringify(userData));
    setToken(tokenStr);
    setUser(userData);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('cfm_token');
    localStorage.removeItem('cfm_user');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
