import React, { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import BranchDropdown from '../components/BranchDropdown';
import FileUploader from '../components/FileUploader';
import api from '../services/api';
import { DataGrid } from '@mui/x-data-grid';
import {
  Typography,
  Button,
  Stack,
  Paper,
  Snackbar,
  Alert,
  Box,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LogoutIcon from '@mui/icons-material/Logout';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [branch, setBranch] = useState({ id: '', name: '' });
  const [salesPath, setSalesPath] = useState(null);
  const [warehousePath, setWarehousePath] = useState(null);
  const [removedPath, setRemovedPath] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showGrid, setShowGrid] = useState(false);
  const [previewData, setPreviewData] = useState([]);

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
    if (!branch.id || !salesPath || !warehousePath || !removedPath) {
      showMessage('Please complete all fields including removed items.', 'error');
      return;
    }

    setGenerating(true);

    try {
      const response = await api.post(
        '/api/generate',
        {
          branch_id: branch.id,
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
        setPreviewData(response.data.outputData || []);
        setShowGrid(true);

        // Auto-download file
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset form
        setBranch({ id: '', name: '' });
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

  // If not logged in
  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={checkAuth} />;
  }

  return (
    <>
      {!showGrid ? (
        // ---------------- BEFORE GENERATE (upload mode) ----------------
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Upload & Generate Report
          </Typography>

          <Stack spacing={3} mt={2}>
            <BranchDropdown onSelect={setBranch} selected={branch.id} />
            <FileUploader
              label="Upload Sales Report *"
              onUploaded={setSalesPath}
              clearTrigger={generating}
            />
            <FileUploader
              label="Upload Warehouse Report *"
              onUploaded={setWarehousePath}
              clearTrigger={generating}
            />
            <FileUploader
              label="Upload Removed Items *"
              onUploaded={setRemovedPath}
              clearTrigger={generating}
            />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleGenerate} startIcon={<PlayArrowIcon />}>
                Generate
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ) : (
        // ---------------- AFTER GENERATE (grid mode) ----------------
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Branch: {branch.name}</Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setShowGrid(false);
                setPreviewData([]);
                setBranch({ id: '', name: '' });
                setSalesPath(null);
                setWarehousePath(null);
                setRemovedPath(null);
              }}
            >
              Upload Files Again
            </Button>
          </Stack>

          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={previewData.map((row, index) => ({ id: index, ...row }))}
              columns={Object.keys(previewData[0] || {}).map((key) => ({
                field: key,
                headerName: key,
                flex: 1,
              }))}
              pageSize={10}
              rowsPerPageOptions={[10, 20, 50]}
            />
          </div>
        </Box>
      )}

      {/* Snackbar */}
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

      {/* Loader */}
      <Backdrop
        open={generating}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

export default Home;
