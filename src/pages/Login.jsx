import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Snackbar,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { loginAgent } from '../services/authService';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [errors, setErrors] = useState({ email: '', motDePasse: '' });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = { email: '', motDePasse: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = "L'email est requis.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide.";
      isValid = false;
    }

    if (!motDePasse) {
      newErrors.motDePasse = "Le mot de passe est requis.";
      isValid = false;
    } else if (motDePasse.length < 6) {
      newErrors.motDePasse = "Minimum 6 caractères.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const user = await loginAgent(email, motDePasse);
      console.log("✅ Utilisateur reçu après login :", user);

      if (user.role === 'Agent') {
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        alert("⛔ Accès réservé à l'agent.");
      }
    } catch (err) {
      setErrors({ ...errors, motDePasse: "❌ Email ou mot de passe incorrect." });
    }
  };


  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography variant="h6">Connexion Agent</Typography>
        </Box>

       <TextField
  label="Email"
  fullWidth
  margin="normal"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!errors.email}
  helperText={errors.email}
/>

<TextField
  label="Mot de passe"
  fullWidth
  margin="normal"
  type="password"
  value={motDePasse}
  onChange={(e) => setMotDePasse(e.target.value)}
  error={!!errors.motDePasse}
  helperText={errors.motDePasse}
/>


        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleLogin}
          disabled={!email || !motDePasse}
        >
          Se connecter
        </Button>

        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
          <Alert severity="success" sx={{ width: '100%' }}>
            Connexion réussie !
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Login;
