import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

function BranchDropdown({ onSelect, selected = '', error }) {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get('/api/branches', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setBranches(response.data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const branchId = e.target.value;
    const branchName = branches.find(b => b._id === branchId)?.name || '';
    onSelect({ id: branchId, name: branchName }); // send both
  };

  return (
    <FormControl fullWidth error={Boolean(error)}>
      <InputLabel>
        Select Branch <span style={{ color: 'red' }}>*</span>
      </InputLabel>
      <Select
        value={selected || ''} // controlled
        onChange={handleChange}
        label="Select Branch"
      >
        <MenuItem value="">-- Select --</MenuItem>
        {branches.map(branch => (
          <MenuItem key={branch._id} value={branch._id}>
            {branch.name}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

export default BranchDropdown;
