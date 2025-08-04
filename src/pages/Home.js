import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import BranchDropdown from '../components/BranchDropdown';
import FileUploader from '../components/FileUploader';
import api from '../services/api';
import Layout from '../components/Layout';

import {
  Typography,
  Button,
  Stack,
  Paper,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LogoutIcon from '@mui/icons-material/Logout';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [salesPath, setSalesPath] = useState(null);
  const [warehousePath, setWarehousePath] = useState(null);
  const [removedPath, setRemovedPath] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const checkAuth = () => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const handleGenerate = async () => {
    if (!branchId || !salesPath || !warehousePath || !removedPath) {
      showMessage('Please complete all fields including removed items.', 'error');
      return;
    }

    setGenerating(true);

    try {
      const response = await api.post(
        '/api/generate',
        {
          branch_id: branchId,
          salesFilePath: salesPath,
          warehouseFilePath: warehousePath,
          removedFilePath: removedPath,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      if (response.data.downloadUrl) {
        showMessage(response.data.message || 'Generated successfully!', 'success');
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setBranchId('');
        setSalesPath(null);
        setWarehousePath(null);
        setRemovedPath(null);
      } else {
        showMessage(response.data.error || 'Error generating file', 'error');
      }
    } catch (error) {
      console.error('Generate failed:', error);
      showMessage('An error occurred', 'error');
    } finally {
      setGenerating(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <AuthForm onAuthSuccess={checkAuth} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload & Generate Report
        </Typography>

        <Stack spacing={3} mt={2}>
          <BranchDropdown onSelect={setBranchId} />
          <FileUploader label="Upload Sales Report *" onUploaded={setSalesPath} clearTrigger={generating} />
          <FileUploader label="Upload Warehouse Report *" onUploaded={setWarehousePath} clearTrigger={generating} />
          <FileUploader label="Upload Removed Items *" onUploaded={setRemovedPath} clearTrigger={generating} />

          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={handleGenerate} startIcon={<PlayArrowIcon />}>
              Generate
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Logout
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        open={generating}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Layout>
  );
}

export default Home;
