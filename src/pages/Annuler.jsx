import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import { fetchTransactions, annulerTransaction } from '../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState('');
  const [motif, setMotif] = useState('');
const [loading, setLoading] = useState(true);



  useEffect(() => {
    const load = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement transactions:", err);
    } finally {
      setLoading(false);
    }
  };
  load();
  }, []);

  const today = dayjs().format('YYYY-MM-DD');
  const annulToday = transactions.filter(
    (tx) => tx.statut === 'Annulée' && dayjs(tx.date).format('YYYY-MM-DD') === today
  ).length;
  const annulMonth = transactions.filter(
    (tx) => tx.statut === 'Annulée' && dayjs(tx.date).month() === dayjs().month()
  ).length;

  const filtered = transactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.beneficiaire?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnnuler = (id) => {
    setSelectedTx(id);
    setOpenDialog(true);
  };

  const handleSubmitAnnulation = async () => {
    try {
      const agent = 'Ousmane'; // ou récupéré dynamiquement
      await annulerTransaction(selectedTx, motif, agent);
      alert('✅ Transaction annulée !');
      setOpenDialog(false);
      setMotif('');
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      alert('❌ Erreur lors de l’annulation');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Liste des transactions
      </Typography>

     {/* ✅ Afficher les stats uniquement quand les données sont prêtes */}
{loading ? (
  <Box textAlign="center" sx={{ my: 5 }}>
    <Typography variant="body1">Chargement des statistiques...</Typography>
  </Box>
) : (
  <Grid container spacing={5} justifyContent="center" alignItems="center" sx={{ mb: 5 }}>
    <Grid item xs={12} sm={4} display="flex" justifyContent="center">
      <StatCard
        icon={<ReceiptIcon sx={{ fontSize: 45, mb: 1, color: 'blue' }} />}
        label="Total"
        value={transactions.length}
      />
    </Grid>
    <Grid item xs={12} sm={4} display="flex" justifyContent="center">
      <StatCard
        icon={<CancelScheduleSendIcon sx={{ fontSize: 45, mb: 1, color: 'blue' }} />}
        label="Annulées aujourd’hui"
        value={annulToday}
      />
    </Grid>
    <Grid item xs={12} sm={4} display="flex" justifyContent="center">
      <StatCard
        icon={<CalendarMonthIcon sx={{ fontSize: 45, mb: 1, color: 'blue' }} />}
        label="Ce mois"
        value={annulMonth}
      />
    </Grid>
  </Grid>
)}


      {/* Barre de recherche */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          label="Rechercher"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Faire une annulation
        </Button>
      </Box>

      {/* Tableau */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Numéro</TableCell>
              <TableCell>Bénéficiaire</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.id}</TableCell>
                  <TableCell>{tx.beneficiaire}</TableCell>
                  <TableCell>{tx.montant} FCFA</TableCell>
                  <TableCell>{dayjs(tx.date).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{tx.statut}</TableCell>
                  <TableCell>
                    {tx.statut !== 'Annulée' && (
                      <Button variant="outlined" color="error" onClick={() => handleAnnuler(tx.id)}>
                        Annuler
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5]}
        />
      </Paper>

      {/* Dialog d’annulation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🛑 Annuler une transaction</DialogTitle>
        <DialogContent>
          <TextField
            label="Numéro de transaction"
            fullWidth
            margin="normal"
            value={selectedTx}
            onChange={(e) => setSelectedTx(e.target.value)}
          />
          <TextField
            label="Motif d’annulation"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
          <Button variant="contained" color="error" onClick={handleSubmitAnnulation}>
            Confirmer l’annulation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ✅ Composant pour les cartes statistiques
const StatCard = ({ icon, label, value }) => (
  <Box
    sx={{
      width: 200,
      height: 200,
      borderRadius: '50%',
      bgcolor: 'white',
      color: 'black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      textAlign: 'center',
      transition: 'transform 0.3s ease',
      '&:hover': { transform: 'scale(1.08)' },
    }}
  >
    <Box>{icon}</Box>
    <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight="bold">
      {value}
    </Typography>
  </Box>
);

export default Transactions;
