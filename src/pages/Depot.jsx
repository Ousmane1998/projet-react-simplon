import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper,
  InputAdornment, Snackbar, Alert
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { effectuerDepot } from '../services/depotService';

const Depot = () => {
  const [compte, setCompte] = useState('');
  const [montant, setMontant] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const montantMin = 1000;
  const montantMax = 1000000;

  const handleDepot = async () => {
    const valeur = parseFloat(montant);
    if (isNaN(valeur) || valeur < montantMin || valeur > montantMax) {
      setValidationError(`❌ Le montant doit être entre ${montantMin} et ${montantMax} FCFA.`);
      return;
    }

    try {
      await effectuerDepot({ numeroCompte: compte, montant: valeur });
      setSuccess(true);
      setCompte('');
      setMontant('');
      setValidationError('');
    } catch (err) {
      setError("❌ Échec du dépôt");
      console.error(err);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper elevation={4} sx={{ width: '100%', maxWidth: 400, p: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Dépôt d'argent
        </Typography>

        <TextField
          label="Numéro de compte"
          fullWidth
          margin="normal"
          value={compte}
          onChange={(e) => setCompte(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountBalanceIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Montant"
          fullWidth
          margin="normal"
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon />
              </InputAdornment>
            ),
          }}
        />
        {validationError && (
          <Typography sx={{ color: 'red', mt: 1 }}>{validationError}</Typography>
        )}

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleDepot}
          disabled={!compte || !montant}
        >
          Valider le dépôt
        </Button>

        <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
          <Alert severity="success" sx={{ width: '100%' }}>
            ✅ Dépôt enregistré avec succès !
          </Alert>
        </Snackbar>

        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Depot;
