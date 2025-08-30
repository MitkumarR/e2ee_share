import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, TextField, Button, Typography, Box, LinearProgress, } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; //  Get email from state

  useEffect(() => {
    if (!email) { //  Check for email
      toast.error("Verification session not found. Please start the registration process again.");
      navigate('/register');
    }
  }, [email, navigate]); //  Depend on email

  const checkPasswordStrength = (value) => {
    let score = 0;
    const feedback = [];

    if (value.length >= 6) score += 1;
    else feedback.push("At least 6 characters");

    if (/[0-9]/.test(value)) score += 1;
    else feedback.push("Add at least one number");

    if (/[A-Z]/.test(value)) score += 1;
    else feedback.push("Add an uppercase letter");

    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    else feedback.push("Add a special character");

    setPasswordStrength(score);
    setPasswordFeedback(feedback);
  };

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
      //  Send email and password in the body, no token header
      const response = await axios.post(
        'http://localhost:5001/auth/set-password',
        { email, password }
      );
      toast.success(response.data.msg);
      setTimeout(() => navigate('/login'), 1000); //  Redirect to login page
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
              onChange={(e) => {
                setPassword(e.target.value);
                checkPasswordStrength(e.target.value);
              }}
            />

            {/* Password strength indicator */}
            {password && (
              <Box mt={1} textAlign="left">
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength / 4) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    mb: 1,
                    backgroundColor: '#eee',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor:
                        passwordStrength < 2 ? 'red' : passwordStrength < 3 ? 'orange' : 'green',
                    },
                  }}
                />
                {passwordFeedback.length > 0 ? (
                  <Typography variant="caption" color="error">
                    Suggestions: {passwordFeedback.join(', ')}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="success.main">
                    Strong password!
                  </Typography>
                )}
              </Box>
            )}
            
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