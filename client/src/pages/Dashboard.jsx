import React from 'react';
import {
  AppBar,
  Typography,
  Button,
  Box,
  Container,
  Toolbar,
  Paper,
} from '@mui/material';
import UploadFile from './UploadFile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { logout } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ToastContainer />
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          }}
        >
          <AppBar
            position="static"
            color="primary"
            elevation={0}
            sx={{
              backgroundColor: '#1976D2',
            }}
          >
            <Toolbar>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1 }}
              >
                E2EE File Share
              </Typography>
              <Button
                color="inherit"
                onClick={logout}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: '#ffffff',
                  },
                }}
              >
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          {/* Main Content Area */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: '#1565C0',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Upload Your Secure File
            </Typography>
            <UploadFile />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard;