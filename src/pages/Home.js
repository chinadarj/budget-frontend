import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import BranchDropdown from '../components/BranchDropdown';
import FileUploader from '../components/FileUploader';
import api from '../services/api';
import { CircularProgress, Backdrop, Snackbar, Alert } from '@mui/material';

import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
} from '@mui/material';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [salesPath, setSalesPath] = useState(null);
  const [warehousePath, setWarehousePath] = useState(null);
  const [removedPath, setRemovedPath] = useState(null);
  const [errors, setErrors] = useState({});
  const [resetKey, setResetKey] = useState(Date.now());
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'error' | 'success' | 'warning' | 'info'
});
  
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
    const newErrors = {};
    if (!branchId) newErrors.branch = 'Please select a branch';
    if (!salesPath) newErrors.sales = 'Please upload sales report';
    if (!warehousePath) newErrors.warehouse = 'Please upload warehouse report';
    if (!removedPath) newErrors.removed = 'Please upload removed items';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({}); // Clear errors if all valid
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
        showMessage(response.data.message || 'Generated successfully!');
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = ''; // Let browser decide filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clear form fields
        setBranchId('');
        setSalesPath(null);
        setWarehousePath(null);
        setRemovedPath(null);
        setResetKey(Date.now()); // trigger file inputs to clear
      } else {
        showMessage(response.data.error || 'Error generating file');
      }
    } catch (error) {
      console.error('Generate failed:', error);
      showMessage('An error occurred');
      }finally {
      setGenerating(false); // ⬅️ stop loader
    }
  };

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <AuthForm onAuthSuccess={checkAuth} />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Upload & Generate Report
        </Typography>

        <Box mb={2}>
          <BranchDropdown
            selected={branchId}
            onSelect={setBranchId}
            error={errors.branch}
          />
        </Box>

        <Box mb={2}>
          <FileUploader
            label="Upload Sales Report"
            onUploaded={setSalesPath}
            required
            resetKey={resetKey}
          />
          {errors.sales && (
            <Typography color="error" variant="caption">
              {errors.sales}
            </Typography>
          )}
        </Box>

        <Box mb={2}>
          <FileUploader
            label="Upload Warehouse Report"
            onUploaded={setWarehousePath}
            required
            resetKey={resetKey}
          />
          {errors.warehouse && (
            <Typography color="error" variant="caption">
              {errors.warehouse}
            </Typography>
          )}
        </Box>

        <Box mb={3}>
          <FileUploader
            label="Upload Removed Items"
            onUploaded={setRemovedPath}
            required
            resetKey={resetKey}
          />
          {errors.removed && (
            <Typography color="error" variant="caption">
              {errors.removed}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleGenerate} disabled={generating}>
            Generate
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Paper>
      <Backdrop
        open={generating}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(3px)',
        }}
      >
          <CircularProgress color="inherit" />
      </Backdrop>
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
    </Container>
  );
}

export default Home;
