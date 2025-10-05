import React, { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Depot from './pages/Depot';
import Utilisateurs from './pages/Utilisateurs';
import Annuler from './pages/Annuler';
import Historique from './pages/Historique';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import SettingsMenu from './pages/SettingsMenu';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error("Erreur de parsing user:", err);
      localStorage.removeItem('user');
    }
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const LoginWrapper = (props) => <Login {...props} />;

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginWrapper onLogin={setUser} />} />
          {user ? (
            <Route element={<Layout darkMode={darkMode} setDarkMode={setDarkMode} />}>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/depot" element={<Depot />} />
              <Route path="/utilisateurs" element={< Utilisateurs />} />
              <Route path="/historique" element={<Historique />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/parametres" element={<SettingsMenu darkMode={darkMode} setDarkMode={setDarkMode} />} />
              <Route path="*" element={<Annuler />} />
            </Route>
          ) : (
            <>
             <Route path="*" element={<Navigate to="/login" />} />

            </>
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
