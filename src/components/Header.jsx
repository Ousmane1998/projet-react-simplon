import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import logo from "../assets/logoBanque.png";
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';

const Header = ({ sidebarWidth }) => {
  const [userPhoto, setUserPhoto] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserPhoto(user.photo || "https://i.pravatar.cc/150?u=default");
    }
  }, []);

  const handleLogoClick = () => {
    navigate("/dashboard"); // ✅ redirection vers dashboard
  };

  return (
    <AppBar
      position="fixed"
      color="primary"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: '64px',
        left: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo cliquable */}
        <Box onClick={handleLogoClick} sx={{ cursor: 'pointer' }}>
          <img
            src={logo}
            alt="Logo"
            className="logo-rotate"
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </Box>

        {/* Titre */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "primary.main",
            textTransform: "uppercase",
          }}
        >
          Mon Application
        </Typography>

        {/* Notifications + Avatar utilisateur */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <ProfileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
