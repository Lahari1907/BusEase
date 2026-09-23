import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('busease_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('busease_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ id: Date.now(), message, type });
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await apiGetProfile();
          if (profile) {
            setUser(profile);
            localStorage.setItem('busease_user', JSON.stringify(profile));
          }
        } catch (err) {
          console.error('Session validation error:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    const jwtToken = data.token || data.jwt || data.accessToken;
    const userData = data.user || {
      id: 1,
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER'
    };

    if (jwtToken) {
      localStorage.setItem('busease_token', jwtToken);
      localStorage.setItem('busease_user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
    }
    return { token: jwtToken, user: userData };
  };

  const register = async (name, email, password, role = 'ROLE_USER') => {
    const data = await apiRegister({ name, email, password, role });
    const jwtToken = data.token || `mock-jwt-${Date.now()}`;
    const userData = data.user || { id: Date.now(), name, email, role };

    localStorage.setItem('busease_token', jwtToken);
    localStorage.setItem('busease_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    showToast('Registration successful! Account created.', 'success');
    return { token: jwtToken, user: userData };
  };

  const logout = () => {
    localStorage.removeItem('busease_token');
    localStorage.removeItem('busease_user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        toastMessage,
        showToast,
        hideToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
