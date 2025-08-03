import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import BranchDropdown from '../components/BranchDropdown';
import FileUploader from '../components/FileUploader';
import api from '../services/api';

import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  FormHelperText,
} from '@mui/material';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branchId, setBranchId] = useState('');
  const [salesPath, setSalesPath] = useState(null);
  const [warehousePath, setWarehousePath] = useState(null);
  const [removedPath, setRemovedPath] = useState(null);
  const [resetKey, setResetKey] = useState(Date.now());

  const [errors, setErrors] = useState({
    branch: '',
    sales: '',
    warehouse: '',
    removed: '',
  });

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
    const newErrors = {
      branch: !branchId ? 'Please select a branch' : '',
      sales: !salesPath ? 'Please upload sales report' : '',
      warehouse: !warehousePath ? 'Please upload warehouse report' : '',
      removed: !removedPath ? 'Please upload removed items file' : '',
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error !== '')) return;

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
        alert(response.data.message || 'Generated successfully!');
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // ✅ Clear all fields
        setBranchId('');
        setSalesPath(null);
        setWarehousePath(null);
        setRemovedPath(null);
        setResetKey(Date.now());
        setErrors({});
      } else {
        alert(response.data.error || 'Error generating file');
      }
    } catch (error) {
      console.error('Generate failed:', error);
      alert('An error occurred');
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
            onSelect={setBranchId}
            selected={branchId}
            key={`branch-${resetKey}`}
          />
          {errors.branch && <FormHelperText error>{errors.branch}</FormHelperText>}
        </Box>

        <Box mb={2}>
          <FileUploader
            key={`sales-${resetKey}`}
            label="Upload Sales Report"
            onUploaded={setSalesPath}
          />
          {errors.sales && <FormHelperText error>{errors.sales}</FormHelperText>}
        </Box>

        <Box mb={2}>
          <FileUploader
            key={`warehouse-${resetKey}`}
            label="Upload Warehouse Report"
            onUploaded={setWarehousePath}
          />
          {errors.warehouse && <FormHelperText error>{errors.warehouse}</FormHelperText>}
        </Box>

        <Box mb={3}>
          <FileUploader
            key={`removed-${resetKey}`}
            label="Upload Removed Items"
            onUploaded={setRemovedPath}
          />
          {errors.removed && <FormHelperText error>{errors.removed}</FormHelperText>}
        </Box>

        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleGenerate}>
            Generate
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default Home;
