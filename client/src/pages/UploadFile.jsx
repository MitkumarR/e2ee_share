import React, { useState } from 'react';
import { Box, Button, Typography, Dialog, DialogContent, DialogTitle, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { storeFileKey } from '../utils/db';

function UploadFile({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error('Authentication error. Please log in again.');
      return;
    }

    setIsEncrypting(true);
    toast.info('Encrypting your file... Please wait.');

    try {
      // 1. Generate a random AES-GCM key client-side
      const aesKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true, // Allow the key to be extractable
        ['encrypt', 'decrypt']
      );

      // 2. Read file content as an ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // 3. Encrypt the file content
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization Vector
      const encryptedFileBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        aesKey,
        fileBuffer
      );

      
      // NOTE: This is where you would wrap the AES key.
      // For now, we are skipping the RSA/ECIES wrapping part.
      // In a real system, you would get the recipient's public key,
      // encrypt `aesKey` with it, and send the wrapped key instead.
      
      const encryptedFileBlob = new Blob([iv, new Uint8Array(encryptedFileBuffer)], { type: 'application/octet-stream' });

      // 4. Prepare metadata and upload
      const formData = new FormData();
      formData.append('file', encryptedFileBlob);
      formData.append('filename', file.name);
      formData.append('contentType', file.type);
      formData.append('size', encryptedFileBlob.size);
      
      const response = await axios.post('http://localhost:5002/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      // 5. Securely store the new file key in IndexedDB
      const newFile = response.data.file;
      await storeFileKey(newFile.id, aesKey)
      
      setShowSuccessDialog(true);
      
      toast.success('File encrypted and uploaded successfully!');
      
      onUploadComplete({ file: response.data.file, key: aesKey });

    } catch (error) {
      console.error('E2EE Upload Error:', error);
      toast.error(error.response?.data?.msg || 'An error occurred during the upload.');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <Box textAlign="center">
      <ToastContainer />
      <Box display="flex" justifyContent="center" alignItems="center" mb={3} sx={{ height: '56px' }}>
        {isEncrypting ? (
          <CircularProgress />
        ) : (
          <>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={isEncrypting}
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" disabled={isEncrypting}>
                Select File
              </Button>
            </label>
            <Typography sx={{ ml: 2 }}>{fileName || 'No file selected'}</Typography>
          </>
        )}
      </Box>
      <Button variant="contained" color="primary" onClick={handleUpload} disabled={!file || isEncrypting}>
        Encrypt & Upload
      </Button>

      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload Complete!</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Your encrypted file has been securely uploaded.
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            sx={{ mt: 2 }}
            onClick={() => {
                setShowSuccessDialog(false);
                setFile(null);
                setFileName('');
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default UploadFile;