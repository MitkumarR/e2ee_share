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
// Make sure you have a useAuth hook or context defined in App.jsx or a separate file
// For now, we'll write directly to localStorage.
// import { useAuth } from '../App';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const { login } = useAuth(); // This would be ideal
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5001/auth/login', {
        email,
        password,
      });

      // The backend now sends a token directly on success
      if (response.data.access_token) {
        toast.success('Login successful! Redirecting to the dashboard...');
        
        // Save the token to localStorage
        localStorage.setItem('access_token', response.data.access_token);
        
        // If you were using a context: login(response.data.access_token);
        
        setTimeout(() => {
          navigate('/'); // Navigate to the protected dashboard route
        }, 1000);
      } else {
        // This case might not be reached if the backend returns proper error codes
        toast.error(response.data.msg || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.msg || 'Error logging in. Please try again.'
      );
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      style={{
        height: '98vh',
        overflow: 'hidden',
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
              Please enter your credentials to continue.
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
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleLogin}
              >
                Login
              </Button>
              <Box textAlign="center" mt={2}>
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/register')}
                  >
                    Register
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

export default Login;