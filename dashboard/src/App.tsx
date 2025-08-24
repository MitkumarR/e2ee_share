import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import your page components
import Dashboard from './pages/index';
import Login from './pages/login';
import Register from './pages/register';

// A simple mock for authentication status
// In a real app, this would be managed by a context, state management library, or hooks.
const isAuthenticated = () => {
  // For demonstration, we'll assume the user is authenticated.
  // Replace this with your actual authentication check (e.g., checking for a token).
  return true; 
};

// A wrapper for protected routes
const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route for the Dashboard */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Fallback route - redirects to dashboard if logged in, otherwise to login */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated() ? "/" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
