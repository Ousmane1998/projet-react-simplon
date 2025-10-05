import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper,
  Table, TableHead, TableRow, TableCell, TableBody,
  TableFooter, TablePagination
} from '@mui/material';
import { fetchHistorique } from '../services/depotService';

const Historique = () => {
  const [activeTab, setActiveTab] = useState('tout');
  const [search, setSearch] = useState('');
  const [historiqueData, setHistoriqueData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const loadHistorique = async () => {
      const data = await fetchHistorique();
      setHistoriqueData(data);
    };
    loadHistorique();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(0);
  };

  const normalize = (str) =>
  str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

  const filteredData = historiqueData
    .filter((item) =>
    activeTab === "tout"
      ? true
      : normalize(item.type) === normalize(activeTab)
  )
  .filter((item) =>
    item.texte.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Historique des transactions
        </Typography>
        <TextField
          label="Rechercher"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {['tout', 'depot', 'retrait', 'transfert'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'contained' : 'outlined'}
            color={activeTab === tab ? 'primary' : 'inherit'}
            onClick={() => handleTabChange(tab)}
          >
            {tab === 'tout' ? 'Tout' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </Box>

      <Paper elevation={2}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Texte</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Date/Heure</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Solde avant</TableCell>
              <TableCell>Solde après</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Expéditeur</TableCell>
              <TableCell>Destinataire</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.texte}</TableCell>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.dateHeure}</TableCell>
                <TableCell>{item.montant}</TableCell>
                <TableCell>{item.solde_avant}</TableCell>
                <TableCell>{item.solde_apres}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.expediteur}</TableCell>
                <TableCell>{item.destinataire}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={9}>
                <Typography variant="body2">
                  Total : {filteredData.length} transaction(s)
                </Typography>
              </TableCell>
              <TablePagination
                count={filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 5));
                  setPage(0);
                }}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    </Box>
  );
};

export default Historique;
