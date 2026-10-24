import { createContext, useContext, useState } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const TOKEN_KEY = 'eatfreely_admin_token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { role: null, token: null, restaurantId: null };
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { role: payload.role, token, restaurantId: payload.restaurantId };
    } catch {
      return { role: null, token: null, restaurantId: null };
    }
  });

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setAuth({ role: data.role, token: data.token, restaurantId: data.restaurantId });
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setAuth({ role: null, token: null, restaurantId: null });
  };

  return (
    <AuthContext.Provider value={{ role: auth.role, token: auth.token, restaurantId: auth.restaurantId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
