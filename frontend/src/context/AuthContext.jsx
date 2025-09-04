import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [token]);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  // --- NEW REGISTER FUNCTION ---
  const register = async (username, password) => {
    // We don't need to handle the response other than to see if it succeeded.
    // The user will be redirected to log in after successful registration.
    await api.post('/auth/register', { username, password });
  };
  // -------------------------

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    // --- ADD register TO THE CONTEXT VALUE ---
    <AuthContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};