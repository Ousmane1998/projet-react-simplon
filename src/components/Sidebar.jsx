import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import ArchiveIcon from '@mui/icons-material/Archive';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import { NavLink } from 'react-router-dom';
import { Box } from '@mui/material';


import SettingsMenu from '../pages/SettingsMenu';

const Sidebar = ({ open, toggle, darkMode, setDarkMode }) => {
  const drawerWidth = open ? 240 : 72;

  const menuItems = [
    { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/utilisateurs' },
    { text: 'Dépôt', icon: <ArchiveIcon />, path: '/depot' },
    { text: 'Annuler', icon: <CancelIcon />, path: '/annuler' },
    { text: 'Historique', icon: <HistoryIcon />, path: '/historique' },
    { text: 'Paramètres', icon: <MenuIcon />, path: '/parametres' },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          transition: 'width 0.3s',
        },
      }}
    >
      <Toolbar>
        <IconButton onClick={toggle}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <NavLink
            to={path}
            key={text}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <ListItem button>
              <ListItemIcon>{icon}</ListItemIcon>
              {open && <ListItemText primary={text} />}
            </ListItem>
          </NavLink>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <SettingsMenu darkMode={darkMode} setDarkMode={setDarkMode} />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
