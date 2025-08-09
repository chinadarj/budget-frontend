import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import PreviewGrid from '../components/PreviewGrid';
import api from '../services/api';
import { Button, Stack, Typography } from '@mui/material';

export default function UploadPriority() {
  const [tempFilePath, setTempFilePath] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUploaded = (path) => {
    setTempFilePath(path);
    setPreviewData(null);
  };

  const handlePreview = async () => {
    if (!tempFilePath) {
      alert('Please upload a file first');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/preview/priority', { tempFilePath });
      setPreviewData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!tempFilePath) {
      alert('Please upload a file first');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/upload/priority', { tempFilePath });
      alert('Priority data uploaded successfully!');
      setTempFilePath('');
      setPreviewData(null);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Priority Upload</Typography>
      <FileUploader label="Upload Priority File" onUploaded={handleFileUploaded} />

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handlePreview} disabled={loading}>
          Preview
        </Button>
        <Button variant="outlined" onClick={handleConfirmUpload} disabled={loading}>
          Confirm Upload
        </Button>
      </Stack>

      {previewData && <PreviewGrid rows={previewData} />}
    </Stack>
  );
}
