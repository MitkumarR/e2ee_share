// In pages/Register.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/auth/send-otp', { email });
      toast.success(response.data.msg);
      toast.info('Please check your email for the OTP.');
      // Navigate to the verification page and pass the email
      navigate('/verify', { state: { email: email } });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'An error occurred.');
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '98vh' }}>
      <ToastContainer />
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card elevation={10} sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
            <Typography variant="h4" component="h1" color="primary" gutterBottom fontWeight="bold">
              Create an Account
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Step 1: Enter your email to get a verification code.
            </Typography>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleSendOtp}>
              Send OTP
            </Button>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Button variant="text" color="primary" onClick={() => navigate('/')}>
                  Login
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Register;