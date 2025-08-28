import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // <-- CHANGE: Get email from state

  useEffect(() => {
    if (!email) { // <-- CHANGE: Check for email
      toast.error("Verification session not found. Please start the registration process again.");
      navigate('/register');
    }
  }, [email, navigate]); // <-- CHANGE: Depend on email

  const handleSetPassword = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
    }

    try {
      // <-- CHANGE: Send email and password in the body, no token header
      const response = await axios.post(
        'http://localhost:5001/auth/set-password',
        { email, password }
      );
      toast.success(response.data.msg);
      setTimeout(() => navigate('/login'), 1000); // <-- CHANGE: Redirect to login page
    } catch (error) {
      toast.error(error.response?.data?.msg || 'An error occurred. Your session may have expired.');
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '98vh' }}>
      <ToastContainer />
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card elevation={10} sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
            <Typography variant="h4" component="h1" color="primary" gutterBottom fontWeight="bold">
              Set Your Password
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Step 3: Choose a secure password.
            </Typography>
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSetPassword}>
              Complete Registration
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SetPassword;