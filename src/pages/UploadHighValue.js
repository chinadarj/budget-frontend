import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';
import PreviewGrid from '../components/PreviewGrid';
import api from '../services/api';
import { Button, Stack, Typography } from '@mui/material';

export default function UploadHighValue() {
  const [tempFilePath, setTempFilePath] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUploaded = (path) => {
    setTempFilePath(path);
    setPreviewData(null); // reset preview
  };

  const handlePreview = async () => {
    if (!tempFilePath) {
      alert('Please upload a file first');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/preview/highvalue', { tempFilePath });
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
      await api.post('/api/upload/highvalue', { tempFilePath });
      alert('High value data uploaded successfully!');
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
      <Typography variant="h5">High Value Upload</Typography>
      <FileUploader label="Upload High Value File" onUploaded={handleFileUploaded} />

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
