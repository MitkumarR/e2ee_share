import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, TextField, Button, Typography, Box } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Verify() {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      toast.error("Email not provided. Please start again.");
      navigate('/register');
    }
  }, [email, navigate]);

  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:5001/auth/verify-otp', { email, otp });
      toast.success(response.data.msg);
      
      // <-- CHANGE: Navigate to set password page, passing the EMAIL
      navigate('/set-password', { state: { email: email } });
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
              Verify Your Email
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Step 2: Enter the OTP sent to {email}.
            </Typography>
            <TextField
              label="OTP"
              variant="outlined"
              fullWidth
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleVerifyOtp}>
              Verify & Proceed
            </Button>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Verify;