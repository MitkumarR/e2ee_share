import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [secretKey, setSecretKey] = useState('');
  const [downloadFileId, setDownloadFileId] = useState('');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (token) {
      fetchFiles();
    } else {
      toast.error('You are not logged in. Please log in again.');
    }
  }, [token]);

  const fetchFiles = async () => {
    try {
      // NOTE: Your backend doesn't have a '/files' GET endpoint yet.
      // This is a placeholder for when you create it.
      const response = await axios.get('http://localhost:5002/files/my-files', { // Assuming this will be the endpoint
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFiles(response.data);
      if (response.data.length === 0) {
        toast.info('You haven\'t uploaded any files yet.');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error(
        error.response?.data?.error || 'Could not fetch your files.'
      );
    }
  };

  const handleDownload = async (fileId) => {
    // This function will need a corresponding backend endpoint that serves the file.
    // For now, this is a placeholder.
    toast.info("Download functionality is not yet implemented on the backend.");
  };

  const handleDelete = async (fileId) => {
     // This function will need a corresponding backend endpoint.
    toast.info("Delete functionality is not yet implemented on the backend.");
  };

  return (
    <Box sx={{ mt: 2, padding: 2 }}>
      <ToastContainer />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
        Your Files
      </Typography>
      <Grid container spacing={3}>
        {files.map((file) => (
          <Grid item xs={12} key={file.id}>
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: 2,
                borderRadius: 4,
                boxShadow: 2,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {file.filename}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    Size: {file.size} bytes
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => setDownloadFileId(file.id)}
                >
                  Download
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(file.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!downloadFileId} onClose={() => setDownloadFileId('')} fullWidth maxWidth="sm">
        <DialogTitle>Enter Secret Key to Download</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter your secret key"
            variant="outlined"
            margin="normal"
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleDownload(downloadFileId)}
            sx={{ mt: 2 }}
          >
            Confirm & Download
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default MyFiles;