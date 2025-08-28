import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== password2) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/auth/register', {
        email,
        password,
      });

      if (response.data.message === 'User registered successfully') {
        toast.success('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/'); // Redirect to login page after successful registration
        }, 2000); // 2-second delay for better user experience
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.error || 'Error during registration. Please try again.'
      );
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{
        minHeight: '98vh',
        background: 'linear-gradient(135deg, #6A11CB 0%, #2575FC 100%)',
        color: '#fff',
      }}
    >
      <ToastContainer />
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Card
          elevation={10}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <CardContent
            sx={{
              background: '#fff',
              textAlign: 'center',
              py: 5,
              px: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              color="primary"
              gutterBottom
              fontWeight="bold"
            >
              E2EE Share
            </Typography>
            <Typography variant="body1" color="textSecondary" mb={4}>
              Create an account to get started.
            </Typography>
            <Box>
              
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                label="Confirm password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleRegister}
              >
                Register
              </Button>
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/')}
                  >
                    Login
                  </Button>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default Register;