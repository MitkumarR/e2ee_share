import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// You would put these crypto functions in a separate utility file, e.g., 'src/utils/crypto.js'
const base64ToBytes = (base64) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

const deriveKey = async (secret) => {
  const secretBuffer = new TextEncoder().encode(secret);
  return await window.crypto.subtle.digest('SHA-256', secretBuffer);
};

const unwrapFileKey = async (wrappedKeyB64, linkSecret) => {
  try {
    const wrappingKeyBuffer = await deriveKey(linkSecret);
    const wrappingKey = await window.crypto.subtle.importKey('raw', wrappingKeyBuffer, { name: 'AES-GCM' }, true, ['decrypt']);
    const wrappedKeyBytes = base64ToBytes(wrappedKeyB64);
    const iv = wrappedKeyBytes.slice(0, 12);
    const ciphertext = wrappedKeyBytes.slice(12);

    const fileKeyBuffer = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, wrappingKey, ciphertext);
    return await window.crypto.subtle.importKey('raw', fileKeyBuffer, { name: 'AES-GCM' }, true, ['decrypt']);
  } catch (e) {
    console.error("Key unwrap failed:", e);
    return null;
  }
};

const decryptFile = async (encryptedBlob, fileKey) => {
    const encryptedBuffer = await encryptedBlob.arrayBuffer();
    const iv = new Uint8Array(encryptedBuffer.slice(0, 12));
    const ciphertext = new Uint8Array(encryptedBuffer.slice(12));
    const decryptedBuffer = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, fileKey, ciphertext);
    return new Blob([decryptedBuffer]);
};

function DownloadPage() {
  const { shareId } = useParams();
  const [linkSecret, setLinkSecret] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, downloading, error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Extract the secret from the URL fragment
    const secret = window.location.hash.substring(1);
    if (!secret) {
      setStatus('error');
      setErrorMsg('No secret found in URL. This link is invalid.');
      return;
    }
    setLinkSecret(secret);

    const fetchLinkDetails = async () => {
      try {
        // Step 1: Get the wrapped key and file_id from the access control service
        const detailsRes = await axios.get(`http://localhost:5003/access/link/details/${shareId}`);
        const { file_id, wrapped_key } = detailsRes.data;

        // Step 2: Get the public file metadata from the file service
        // NOTE: This endpoint needs to be created in your file_service
        // For now, we'll just use a placeholder name
        const metaRes = await axios.get(`http://localhost:5002/files/public-meta/${file_id}`);

        setFileInfo({
          file_id,
          wrapped_key,
          filename: metaRes.data.filename,
          size: metaRes.data.size,
        });
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.msg || 'This link is invalid or has expired.');
      }
    };

    fetchLinkDetails();
  }, [shareId]);

  const handleDownloadAndDecrypt = async () => {
    setStatus('downloading');
    toast.info('Downloading and decrypting file...');
    try {
        // Step 1: Unwrap the file key
        const fileKey = await unwrapFileKey(fileInfo.wrapped_key, linkSecret);
        if (!fileKey) throw new Error("Decryption key is invalid. The link secret may be wrong.");

        // Step 2: Download the encrypted file blob
        // NOTE: This endpoint needs to be created in your file_service
        const fileRes = await axios.get(`http://localhost:5002/files/download/${fileInfo.file_id}`, {
            responseType: 'blob',
        });
        const encryptedBlob = fileRes.data;

        // Step 3: Decrypt the blob
        const decryptedBlob = await decryptFile(encryptedBlob, fileKey);

        // Step 4: Trigger browser download
        const url = window.URL.createObjectURL(decryptedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileInfo.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('File successfully decrypted and downloaded!');
        setStatus('done');
    } catch (error) {
        setStatus('error');
        setErrorMsg('Failed to download or decrypt the file.');
        toast.error('Failed to download or decrypt the file.');
        console.error(error);
    }
  };

  const renderContent = () => {
    switch(status) {
        case 'loading':
            return <CircularProgress />;
        case 'ready':
            return (
                <>
                    <Typography variant="h5" gutterBottom>Ready to Download</Typography>
                    <Typography>Filename: {fileInfo.filename}</Typography>
                    <Button variant="contained" sx={{mt: 2}} onClick={handleDownloadAndDecrypt}>
                        Download & Decrypt File
                    </Button>
                </>
            );
        case 'downloading':
            return (
                <>
                    <CircularProgress />
                    <Typography sx={{mt: 2}}>Downloading and decrypting...</Typography>
                </>
            );
        case 'done':
            return <Typography variant="h5">Download complete!</Typography>;
        case 'error':
            return <Typography color="error">{errorMsg}</Typography>;
        default:
            return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ToastContainer />
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {renderContent()}
      </Paper>
    </Box>
  );
}

export default DownloadPage;