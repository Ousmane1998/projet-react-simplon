import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import useAutoLogout from '../pages/useAutoLogout';

const Layout = ({ darkMode, setDarkMode }) => {
    useAutoLogout(); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = sidebarOpen ? 240 : 72;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        open={sidebarOpen}
        toggle={() => setSidebarOpen(!sidebarOpen)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
        }}
      >
        <Header sidebarWidth={sidebarWidth} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            mt: '64px',
            p: 2,
            bgcolor: darkMode ? 'background.default' : '#f9f9f9',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
