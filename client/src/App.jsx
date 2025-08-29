import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Import the AuthProvider and useAuth hook
import { AuthProvider, useAuth } from "./context/AuthContext";

// Import your page components
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Verify from "./pages/Verify";
import SetPassword from "./pages/SetPassword";
import DownloadPage from "./pages/DownloadPage";

// A new PrivateRoute that uses our context
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* Wrap everything in the AuthProvider */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="/download/:shareId" element={<DownloadPage />} />
          {/* Protected Route for the Dashboard */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
