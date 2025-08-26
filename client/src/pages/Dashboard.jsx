import React, { useState } from 'react';
import {
  AppBar,
  Tabs,
  Tab,
  Typography,
  Button,
  Box,
  Container,
  Toolbar,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ListIcon from '@mui/icons-material/List';
import KeyIcon from '@mui/icons-material/VpnKey'; // Icon for Unlocking Files
import UploadFile from './UploadFile';
import MyFiles from './MyFiles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App'; 
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Dashboard() {
  const [tab, setTab] = useState(0); // Manage active tab
  const { logout } = useAuth(); // Logout function from Auth Context
  const navigate = useNavigate();

  // State for Unlock File Dialog
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [fileDetails, setFileDetails] = useState(null);

  const handleLogout = () => {
    logout(); // Clear authentication state
    navigate('/'); // Redirect to login page
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue); // Update active tab
  };

  // Open Unlock File Dialog
  const handleOpenUnlockDialog = () => {
    setUnlockDialogOpen(true);
    setSecretKey('');
    setFileDetails(null);
  };

  // Close Unlock File Dialog
  const handleCloseUnlockDialog = () => {
    setUnlockDialogOpen(false);
    setSecretKey('');
    setFileDetails(null);
  };

  // Verify secret key
  const handleVerifyKey = async () => {
    try {
      const response = await axios.post('http://localhost:5000/verify-key', { secretKey });
      setFileDetails(response.data); // Store file details
      toast.success('File unlocked successfully! You can now download it.');
    } catch (error) {
      toast.error(
        error.response?.data?.error || 'Invalid secret key or file not found.'
      );
    }
  };

  // Download unlocked file
  const handleDownloadUnlockedFile = async () => {
    if (!fileDetails) return;

    try {
        const response = await axios.post(
            `http://localhost:5000/download/${fileDetails.filename}`,
            { secretKey, iv: fileDetails.iv },
            { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileDetails.originalName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('File downloaded successfully!');
    } catch (error) {
        console.error('Error downloading file:', error.message, error.response);
        toast.error('Failed to download file. Please check your input.');
    }
};


  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 5,
        py: 4,
        px: 3,
        backgroundColor: '#f5f5f5', // Light gray background
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <ToastContainer />
      {/* AppBar */}
      <AppBar
        position="static"
        color="primary"
        sx={{
          backgroundColor: '#1565C0',
          borderRadius: '8px 8px 0 0',
        }}
        elevation={2}
      >
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              textAlign: 'left',
              color: '#ffffff',
            }}
          >
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
            sx={{
              borderColor: '#ffffff',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Tabs for navigation */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Tab icon={<FileUploadIcon />} label="Upload File" />
        <Tab icon={<ListIcon />} label="My Files" />
        <Tab icon={<KeyIcon />} label="Unlock File" />
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ mt: 4 }}>
        {tab === 0 && (
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: '#1565C0',
                fontWeight: 'bold',
              }}
            >
              Upload Your Files
            </Typography>
            <UploadFile />
          </Box>
        )}
        {tab === 1 && (
          <Box>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: '#1565C0',
                fontWeight: 'bold',
              }}
            >
              Your Files
            </Typography>
            <MyFiles />
          </Box>
        )}
        {tab === 2 && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenUnlockDialog}
            >
              Unlock a File
            </Button>
          </Box>
        )}
      </Box>

      {/* Unlock File Dialog */}
      <Dialog open={unlockDialogOpen} onClose={handleCloseUnlockDialog} fullWidth maxWidth="sm">
        <DialogTitle>Enter Secret Key</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter the secret key"
            variant="outlined"
            margin="normal"
          />
          {fileDetails && (
            <Typography sx={{ mt: 2 }}>
              File Found: <strong>{fileDetails.originalName}</strong>
            </Typography>
          )}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={!fileDetails ? handleVerifyKey : handleDownloadUnlockedFile}
            >
              {!fileDetails ? 'Verify Key' : 'Download File'}
            </Button>
            {fileDetails && (
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={handleCloseUnlockDialog}
                sx={{ mt: 1 }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
