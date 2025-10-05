import React, { useEffect, useState, useMemo } from "react";
import { archiveUser, blockUser, updateUser, unblockUser } from '../services/userService';

import { Checkbox } from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';

import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableFooter,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import ArchiveIcon from "@mui/icons-material/Archive";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BadgeIcon from "@mui/icons-material/Badge";
import { Snackbar, Alert } from '@mui/material';

import { fetchUtilisateurs, deleteUser, } from "../services/userService";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    email: "",
    role: "",
    photo: "",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);
const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('success');
const [searchTerm, setSearchTerm] = useState('');

const getStatut = (user) => {
  if (user.is_archived && user.is_blocking) return "Archivé & Bloqué";
  if (user.is_archived) return "Archivé";
  if (user.is_blocking) return "Bloqué";
  return "Actif";
};
const [confirmDialog, setConfirmDialog] = useState({
  open: false,
  type: "",
  userId: null,
});



useEffect(() => {
  const loadUsers = async () => {
    try {
      setLoading(true); // indique que le chargement commence
      const data = await fetchUtilisateurs();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      setUsers([]);
    } finally {
      setLoading(false); // fin du chargement
    }
  };

  loadUsers();
}, []);


 const stats = useMemo(() => {
    if (loading) {
      return [
        { label: "Clients", value: "...", icon: <PeopleIcon fontSize="large" /> },
        { label: "Distributeurs", value: "...", icon: <StorefrontIcon fontSize="large" /> },
        { label: "Agents", value: "...", icon: <BadgeIcon fontSize="large" /> },
      ];
    }

    return [
      {
        label: "Clients",
        value: users.filter((u) => u.role === "Client").length,
        icon: <PeopleIcon fontSize="large" />,
      },
      {
        label: "Distributeurs",
        value: users.filter((u) => u.role === "Distributeur").length,
        icon: <StorefrontIcon fontSize="large" />,
      },
      {
        label: "Agents",
        value: users.filter((u) => u.role === "Agent").length,
        icon: <BadgeIcon fontSize="large" />,
      },
    ];
  }, [users, loading]);
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setOpenEdit(true);
  };

 const handleSaveEdit = async () => {
  try {
    await updateUser(selectedUser._id, formData);
    setUsers(users.map((u) => (u._id === selectedUser._id ? formData : u)));
    setOpenEdit(false);
    showAlert(' Mise à jour réussie !', 'success');
  } catch (err) {
    console.error("❌ Erreur modification :", err);
  }
};

const showAlert = (message, severity = 'success') => {
  setAlertMessage(message);
  setAlertSeverity(severity);
  setAlertOpen(true);
};


  const handleConfirm = (user, type) => {
    setSelectedUser(user);
    setActionType(type);
    setOpenConfirm(true);
  };


 const handleConfirmAction = async () => {
  const { type, userId } = confirmDialog;

  if (!selectedUser || !selectedUser._id) {
    console.error("❌ Aucun utilisateur sélectionné");
    showAlert("Aucun utilisateur sélectionné", "error");
    return;
  }

  try {
    if (actionType=== "delete") {
      await deleteUser(selectedUser._id);
      setUsers(users.filter((u) => u._id !== selectedUser._id));
      showAlert("✅ Utilisateur supprimé", "success");
    }

    if (actionType=== "archive") {
      await archiveUser(selectedUser._id);
      setUsers(users.map((u) =>
        u._id === selectedUser._id ? { ...u, is_archived: true } : u
      ));
      showAlert("✅ Utilisateur archivé", "success");
    }
    if (actionType === "unarchive") {
  await archiveUser(selectedUser._id); // même route, mais avec is_archived: false
  setUsers(users.map((u) =>
    u._id === selectedUser._id ? { ...u, is_archived: false } : u
  ));
  showAlert("✅ Utilisateur désarchivé", "success");
}


    if (actionType=== "block") {
      await blockUser(selectedUser._id);
      setUsers(users.map((u) =>
        u._id === selectedUser._id ? { ...u, is_blocking: true } : u
      ));
      showAlert("✅ Utilisateur bloqué", "success");
    }

    if (actionType=== "unblock") {
      await unblockUser(selectedUser._id);
      setUsers(users.map((u) =>
        u._id === selectedUser._id ? { ...u, is_blocking: false } : u
      ));
      showAlert("✅ Utilisateur débloqué", "success");
    }

    setConfirmDialog({ open: false, type: "", userId: null });
    setSelectedUser(null);
  } catch (err) {
  console.error("❌ Erreur action :", err);

  if (err.response) {
    console.error("🧾 Réponse serveur :", err.response.data);
    showAlert(`Erreur serveur : ${err.response.data.error || err.response.statusText}`, "error");
  } else if (err.request) {
    console.error("📡 Requête envoyée mais pas de réponse :", err.request);
    showAlert("Aucune réponse du serveur", "error");
  } else {
    console.error("⚠️ Erreur inconnue :", err.message);
    showAlert(`Erreur : ${err.message}`, "error");
  }
}
};



const handleBatchArchive = async () => {
  try {
    await Promise.all(selectedUsers.map((id) => archiveUser(id)));
    setUsers(users.filter((u) => !selectedUsers.includes(u._id)));
    setSelectedUsers([]);
  } catch (err) {
    console.error("❌ Erreur suppression multiple :", err);
  }
    showAlert(' Utilisateurs supprimés !', 'success');
};

const handleBatchBlock = async () => {
  try {
    await Promise.all(selectedUsers.map((id) => blockUser(id)));
    setUsers(users.map((u) =>
      selectedUsers.includes(u._id) ? { ...u, is_blocking: true } : u
    ));
    setSelectedUsers([]);
    showAlert(' Utilisateurs bloqués !', 'success');
  } catch (err) {
    console.error("❌ Erreur blocage multiple :", err);
  }
};



// juste avant le return ou en haut du composant
const filteredUsers = users.filter((user) =>
  (user.nom?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (user.numeroCompte?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);

const paginatedUsers = filteredUsers.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);

  return (
    <>
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
      {/* --- Stats --- */}
      {loading ? (
        <Typography textAlign="center" sx={{ mt: 3 }}>
          Chargement des statistiques...
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center" alignItems="center" sx={{ mb: 5, p: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index} display="flex" justifyContent="center">
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  bgcolor: "white",
                  color: "black",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  textAlign: "center",
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.08)" },
                }}
              >
                <Box sx={{ color: "blue", mb: 1 }}>{stat.icon}</Box>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* --- Liste utilisateurs --- */}
     <Paper elevation={2}>

<Box sx={{ mb: 2 }}>
  <TextField
    label="Rechercher par nom ou numéro de compte"
    variant="outlined"
    fullWidth
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</Box>

         <Box sx={{ mb: 2 }}>
  <Button
    variant="contained"
    color="error"
    disabled={selectedUsers.length === 0}
    onClick={handleBatchArchive}
  >
    Supprimer sélection
  </Button>
  <Button
    variant="contained"
    color="warning"
    disabled={selectedUsers.length === 0}
    onClick={handleBatchBlock}
    sx={{ ml: 2 }}
  >
    Bloquer sélection
  </Button>
</Box>

  <Table>

   

    <TableHead>
      
        <TableCell padding="checkbox">
         <Checkbox
  checked={
    paginatedUsers.length > 0 &&
    paginatedUsers.every((u) => selectedUsers.includes(u._id))
  }
  indeterminate={
    paginatedUsers.some((u) => selectedUsers.includes(u._id)) &&
    !paginatedUsers.every((u) => selectedUsers.includes(u._id))
  }
  onChange={(e) => {
    if (e.target.checked) {
      const newSelected = [
        ...selectedUsers,
        ...paginatedUsers
          .filter((u) => !selectedUsers.includes(u._id))
          .map((u) => u._id),
      ];
      setSelectedUsers(newSelected);
    } else {
      const newSelected = selectedUsers.filter(
        (id) => !paginatedUsers.some((u) => u._id === id)
      );
      setSelectedUsers(newSelected);
    }
  }}
/>

        </TableCell>
        <TableCell>Photo</TableCell>
        <TableCell>Nom</TableCell>
        <TableCell>Prénom</TableCell>
        <TableCell>Adresse</TableCell>
        <TableCell>Email</TableCell>
        <TableCell>Rôle</TableCell>
        <TableCell>Statut</TableCell>

        <TableCell align="right">Actions</TableCell>
      
    </TableHead>
    <TableBody>
      {
    paginatedUsers.map((user) => (
        <TableRow key={user._id} hover selected={selectedUsers.includes(user._id)}>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedUsers.includes(user._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers([...selectedUsers, user._id]);
                } else {
                  setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Avatar src={`http://localhost:5000/images/${user.photo}`} alt={user.nom} />
          </TableCell>
          <TableCell>{user.nom}</TableCell>
          <TableCell>{user.prenom}</TableCell>
          <TableCell>{user.adresse}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>{user.role}</TableCell>
          <TableCell>
  <Typography
    variant="body2"
    sx={{
      fontWeight: "bold",
      color:
        user.is_archived && user.is_blocking
          ? "gray"
          : user.is_archived
          ? "orange"
          : user.is_blocking
          ? "red"
          : "green",
    }}
  >
    {getStatut(user)}
  </Typography>
</TableCell>

          <TableCell align="right">
            <IconButton color="primary" onClick={() => handleEdit(user)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleConfirm(user, "delete")}>
              <DeleteIcon />
            </IconButton>
            <IconButton
  color={user.is_blocking ? "success" : "warning"}
  
  onClick={() => handleConfirm(user, user.is_blocking ? "unblock" : "block")}
  title={user.is_blocking ? "Débloquer" : "Bloquer"}
>
  {user.is_blocking ? <LockOpenIcon /> : <BlockIcon />}
</IconButton>


            <IconButton
  color="secondary"
  onClick={() => handleConfirm(user, user.is_archived ? "unarchive" : "archive")}
  title={user.is_archived ? "Désarchiver" : "Archiver"}
>
  <ArchiveIcon />
</IconButton>

          </TableCell>
        </TableRow>
      ))}
    </TableBody>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={2}>
          <Typography variant="body2">Nombre total d’utilisateurs : {users.length}</Typography>
        </TableCell>
        <TablePagination
  component="div"
  count={users.length}
  page={page}
  rowsPerPage={rowsPerPage}
  onPageChange={(event, newPage) => setPage(newPage)}
  onRowsPerPageChange={(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // reset à la première page
  }}
  rowsPerPageOptions={[5, 10, 25]}
  labelRowsPerPage="Lignes par page"
/>

      </TableRow>
    </TableFooter>
  </Table>
</Paper>


      {/* --- Dialog Edition --- */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l’utilisateur</DialogTitle>
        <DialogContent dividers>
          <TextField
            margin="dense"
            label="Nom"
            fullWidth
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Prénom"
            fullWidth
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Adresse"
            fullWidth
            value={formData.adresse}
            onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Rôle"
            fullWidth
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Photo (URL)"
            fullWidth
            value={formData.photo}
            onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- Dialog Confirmation --- */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment {actionType} l’utilisateur <b>{selectedUser?.nom}</b> ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleConfirmAction}>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    

     <Snackbar
    open={alertOpen}
    autoHideDuration={3000}
    onClose={() => setAlertOpen(false)}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <Alert severity={alertSeverity} sx={{ width: '100%' }}>
      {alertMessage}
    </Alert>
  </Snackbar>

    </>
  );
}
export default Dashboard;