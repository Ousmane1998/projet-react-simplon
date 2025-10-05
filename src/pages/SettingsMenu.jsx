import React from 'react';
import {
  Box,
  Typography,
  Switch,
  Divider,
  Drawer,
  IconButton,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const SettingsMenu = ({ darkMode, setDarkMode }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)} sx={{ ml: 1 }}>
        <SettingsIcon />
      </IconButton>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Paramètres
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography>Mode {darkMode ? 'sombre' : 'clair'}</Typography>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </Box>

          {/* Tu peux ajouter d'autres réglages ici */}
        </Box>
      </Drawer>
    </>
  );
};

export default SettingsMenu;
