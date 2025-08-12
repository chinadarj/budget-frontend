import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Button,
} from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarsIcon from '@mui/icons-material/Stars';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import LogoutIcon from '@mui/icons-material/Logout';
import { Navigate } from 'react-router-dom';


const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem('authToken'));

  const menuItems = [
    { text: 'Generate Report', icon: <AssessmentIcon />, path: '/' },
    { text: 'High Value Upload', icon: <StarsIcon />, path: '/upload-high-value' },
    { text: 'Priority Upload', icon: <PriorityHighIcon />, path: '/upload-priority' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  if (!isLoggedIn) {
  return <Navigate to="/login" replace />;
}

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Branch Report Generator
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem disablePadding key={item.text}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                    },
                    '&.Mui-selected:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: 'auto',
          backgroundColor: '#fafafa',
        }}
      >
        <Toolbar />
        {/* This renders the nested route component */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
