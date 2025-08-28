import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context
const AuthContext = createContext(null);

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const navigate = useNavigate();

  const login = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    navigate('/'); // Navigate to dashboard on login
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    navigate('/login'); // Navigate to login on logout
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};