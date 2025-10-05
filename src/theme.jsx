// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // bleu
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800', // couleur secondaire (orange ici)
    },
    background: {
      default: '#ffffff',
    },
  },
});

export default theme;
