import React, { useState, useEffect, useRef } from "react";
import { archiveUser, blockUser, updateUser } from '../services/userService';
import axios from "axios";
import { Checkbox } from '@mui/material';


import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Popover,
} from "@mui/material";
import { Edit, Delete, Archive, Lock, LockOpen} from "@mui/icons-material";
import { fetchUtilisateurs, createUtilisateur, unblockUser, deleteUser} from "../services/userService";
import { Snackbar, Alert } from '@mui/material';
import DialogContentText from '@mui/material/DialogContentText';

const Utilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});



  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    date_naissance: "",
    carte_identite: "",
    telephone: "",
    adresse: "",
    email: "",
    role: "",
    photo: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: "", userId: null });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
const [alertMessage, setAlertMessage] = useState('');
const [alertSeverity, setAlertSeverity] = useState('success'); 






  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUtilisateurs();
      setUsers(data);
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.nom} ${user.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  const nextStep = () => {
  if (validateStep()) {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }
};

  const previousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  


const handleFileSelected = (e) => {
  const file = e.target.files[0];
  setSelectedFile(file); // ✅ fichier réel à envoyer
  setPreviewUrl(URL.createObjectURL(file)); // ✅ pour l’aperçu uniquement
};

 const handleSubmit = async () => {
  const formData = new FormData();
  formData.append("nom", newUser.nom);
  formData.append("prenom", newUser.prenom);
  formData.append("email", newUser.email);
  formData.append("adresse", newUser.adresse);
  formData.append("telephone", newUser.telephone);
  formData.append("role", newUser.role);
  formData.append("date_naissance", newUser.date_naissance);
  formData.append("photo", selectedFile); // ✅ fichier réel

  try {
  const res = await axios.post("http://localhost:5000/api/utilisateurs", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  console.log(" Réponse backend :", res.data); // ← ajoute ce log
  setMessage("Compte créé avec succès");
  setOpenDialog(false);
} catch (err) {
  console.error("❌ Erreur frontend :", err.message);
  setMessage("❌ Erreur lors de la création du compte");
}

};

const handleBatchArchive = async () => {
  try {
    await Promise.all(selectedUsers.map((id) => archiveUser(id)));
    setUsers(users.filter((u) => !selectedUsers.includes(u._id)));
    setSelectedUsers([]);
    showAlert("✅ Utilisateurs supprimés !", "success");
  } catch (err) {
    console.error("❌ Erreur suppression multiple :", err);
  }
};

const handleBatchBlock = async () => {
  try {
    await Promise.all(selectedUsers.map((id) => blockUser(id)));
    setUsers(users.map((u) =>
      selectedUsers.includes(u._id) ? { ...u, is_blocking: true } : u
    ));
    setSelectedUsers([]);
    showAlert("✅ Utilisateurs bloqués !", "success");
  } catch (err) {
    console.error("❌ Erreur blocage multiple :", err);
  }
};

  const handleEditClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setEditingUser({ ...user });
  };

  const handleEditClose = () => {
    setAnchorEl(null);
    setEditingUser(null);
  };

const handleEditSave = async () => {
  try {
    await updateUser(editingUser._id, editingUser);
    setUsers(users.map((u) => (u._id === editingUser._id ? editingUser : u)));
    handleEditClose();
    showAlert("✅ Utilisateur modifié !", "success");
  } catch (err) {
    console.error("❌ Erreur modification :", err);
  }
};


  const handleConfirmOpen = (type, userId) => {
    setConfirmDialog({ open: true, type, userId });
  };

  const handleConfirmClose = () => {
    setConfirmDialog({ open: false, type: "", userId: null });
  };
  

 const handleConfirmAction = async () => {
  const { type, userId } = confirmDialog;
  try {
    if (type === "delete") {
  await deleteUser(userId); // si tu as une fonction deleteUser
  setUsers(users.filter((u) => u._id !== userId));
}

if (type === "archive") {
  await archiveUser(userId); // met is_archived: true dans MongoDB
  setUsers(users.map((u) =>
    u._id === userId ? { ...u, is_archived: true } : u
  ));
}


    if (type === "block") {
  await blockUser(userId);
  setUsers(users.map((u) =>
    u._id === userId ? { ...u, is_blocking: true } : u
  ));
}

if (type === "unblock") {
  await unblockUser(userId);
  setUsers(users.map((u) =>
    u._id === userId ? { ...u, is_blocking: false } : u
  ));
}
    showAlert(`✅ Action ${type} réussie !`, "success");
    handleConfirmClose();
  }  catch (err) {
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

const validateStep = () => {
  const newErrors = {};

  if (currentStep === 1) {
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(newUser.nom)) {
      newErrors.nom = "❌ Le nom doit contenir uniquement des lettres.";
    }
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(newUser.prenom)) {
      newErrors.prenom = "❌ Le prénom doit contenir uniquement des lettres.";
    }
  }

  if (currentStep === 2) {
    if (!newUser.email.includes("@gmail.com")) {
      newErrors.email = "❌ L'email doit se terminer par @gmail.com.";
    }
    if (!/^\d{9}$/.test(newUser.telephone)) {
      newErrors.telephone = "❌ Le téléphone doit contenir exactement 9 chiffres.";
    }

    if (!newUser.date_naissance) {
  newErrors.date_naissance = "❌ La date de naissance est obligatoire.";
} else {
  const selectedDate = new Date(newUser.date_naissance);
  const today = new Date();
  if (selectedDate > today) {
    newErrors.date_naissance = "❌ La date ne peut pas être dans le futur.";
  }
}

  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

const showAlert = (message, severity = 'success') => {
  setAlertMessage(message);
  setAlertSeverity(severity);
  setAlertOpen(true);
};

const getStatut = (user) => {
  if (user.is_archived && user.is_blocking) return "Archivé & Bloqué";
  if (user.is_archived) return "Archivé";
  if (user.is_blocking) return "Bloqué";
  return "Actif";
};


  return (
    <>
    <Box sx={{ padding: 4, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
        Liste des utilisateurs
      </Typography>

      {/* Barre de recherche + bouton */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <TextField
          label="Rechercher un utilisateur..."
          variant="outlined"
          size="small"
          fullWidth
          sx={{ backgroundColor: "white" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Ajouter un utilisateur
        </Button>
      </Box>

      {/* Tableau */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>

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

          <TableContainer>
            <Table>
              <TableHead>
  <TableRow sx={{ backgroundColor: "#1976d2" }}>
    <TableCell padding="checkbox">
      <Checkbox
        sx={{ color: "white" }}
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
    <TableCell sx={{ color: "white" }}>Photo</TableCell>
    <TableCell sx={{ color: "white" }}>Nom</TableCell>
    <TableCell sx={{ color: "white" }}>Prénom</TableCell>
    <TableCell sx={{ color: "white" }}>Email</TableCell>
    <TableCell sx={{ color: "white" }}>Adresse</TableCell>
    <TableCell sx={{ color: "white" }}>Rôle</TableCell>
    <TableCell sx={{ color: "white" }}>N° Compte</TableCell>
    <TableCell sx={{ color: "white" }}>Solde</TableCell>
    <TableCell sx={{ color: "white" }}>Statut</TableCell>
    <TableCell sx={{ color: "white" }}>Actions</TableCell>
  </TableRow>
</TableHead>

              <TableBody>
  {paginatedUsers.map((user) => (
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
          <Avatar src={`http://localhost:5000/images/${user.photo}`} />
        </TableCell>
        <TableCell>{user.nom}</TableCell>
        <TableCell>{user.prenom}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.adresse}</TableCell>
        <TableCell>{user.role}</TableCell>
        <TableCell>{user.numeroCompte || "—"}</TableCell>
        <TableCell>{user.solde?.toLocaleString()} FCFA</TableCell>
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

        <TableCell>
          <IconButton color="primary" onClick={(e) => handleEditClick(e, user)}>
            <Edit />
          </IconButton>
          <IconButton color="error" onClick={() => handleConfirmOpen("delete", user._id)}>
            <Delete />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleConfirmOpen("archive", user._id)}>
            <Archive />
          </IconButton>
            {user.is_blocking ? (
    <IconButton color="warning" onClick={() => handleConfirmOpen("unblock", user._id)}>
      <LockOpen />
    </IconButton>
  ) : (
    <IconButton color="warning" onClick={() => handleConfirmOpen("block", user._id)}>
      <Lock />
    </IconButton>
  )}
          
        </TableCell>

       
      </TableRow>
    ))}
</TableBody>

            </Table>
          </TableContainer>
          <Snackbar
  open={alertOpen}
  autoHideDuration={3000}
  onClose={() => setAlertOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert severity={alertSeverity} sx={{ width: '100%' }} onClose={() => setAlertOpen(false)}>
    {alertMessage}
  </Alert>
</Snackbar>

          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Lignes par page"
          />
        </CardContent>
      </Card>

      

      {/* Formulaire multi-étapes */}
<Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Créer un compte</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Indicateur d’étapes */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            {[1, 2, 3].map((step) => (
              <Box
                key={step}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: currentStep === step ? "primary.main" : "grey.400",
                }}
              />
            ))}
          </Box>

          {message && (
            <Typography sx={{ color: message.includes("❌") ? "red" : "green", mb: 2 }}>
              {message}
            </Typography>
          )}

          {/* Étape 1 */}
          {currentStep === 1 && (
            <>
              <TextField name="nom" label="Nom" fullWidth margin="normal" error={!!errors.nom}
  helperText={errors.nom} value={newUser.nom} onChange={handleChange} />
              <TextField name="prenom" label="Prénom" fullWidth margin="normal" error={!!errors.prenom}
  helperText={errors.prenom} value={newUser.prenom} onChange={handleChange} />
              <TextField
                name="date_naissance"
                label="Date de naissance"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={newUser.date_naissance}
                onChange={handleChange}
                error={!!errors.date_naissance}
                helperText={errors.date_naissance}
                inputProps={{
    max: new Date().toISOString().split("T")[0], //  bloque les dates futures
  }}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button variant="contained" onClick={nextStep}>Suivant</Button>
              </Box>
            </>
          )}

          {/* Étape 2 */}
          {currentStep === 2 && (
            <>
              <TextField name="email" label="Email" fullWidth margin="normal" error={!!errors.email}
  helperText={errors.email}  value={newUser.email} onChange={handleChange} />
              <TextField name="telephone" label="Téléphone" fullWidth margin="normal"  error={!!errors.telephone}
  helperText={errors.telephone} value={newUser.telephone} onChange={handleChange} />
              <TextField name="adresse" label="Adresse" fullWidth margin="normal"  value={newUser.adresse} onChange={handleChange} />

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button onClick={previousStep}>Précédent</Button>
                <Button variant="contained" onClick={nextStep}>Suivant</Button>
              </Box>
            </>
          )}

          {/* Étape 3 */}
          {currentStep === 3 && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Rôle</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                {["Client", "Distributeur", "Agent"].map((r) => (
                  <label key={r}>
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={newUser.role === r}
                      onChange={handleChange}
                    />
                    {r}
                  </label>
                ))}
              </Box>

            <Box sx={{ mt: 2 }}>
  <Button variant="outlined" component="label">
    Télécharger Photo
    <input type="file" hidden ref={fileInputRef} onChange={handleFileSelected} />
  </Button>

  {previewUrl && (
    <Avatar src={previewUrl} sx={{ mt: 2, width: 64, height: 64 }} />
  )}
</Box>


              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                <Button onClick={previousStep}>Précédent</Button>
                <Button variant="contained" onClick={handleSubmit}>Créer Compte</Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>      

      {/* Popover modification */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleEditClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box sx={{ p: 2, width: 250 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Modifier utilisateur
          </Typography>
          <TextField
            label="Nom"
            fullWidth
            margin="dense"
            value={editingUser?.nom || ""}
            onChange={(e) => setEditingUser({ ...editingUser, nom: e.target.value })}
          />
          <TextField
            label="Prénom"
            fullWidth
            margin="dense"
            value={editingUser?.prenom || ""}
            onChange={(e) => setEditingUser({ ...editingUser, prenom: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={editingUser?.email || ""}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
          />
          <TextField
            label="Adresse"
            fullWidth
            margin="dense"
            value={editingUser?.adresse || ""}
            onChange={(e) => setEditingUser({ ...editingUser, adresse: e.target.value })}
          />
          <TextField
            label="Rôle"
            select
            fullWidth
            margin="dense"
            value={editingUser?.role || ""}
            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
          >
            <MenuItem value="Client">Client</MenuItem>
            <MenuItem value="Distributeur">Distributeur</MenuItem>
            <MenuItem value="Agent">Agent</MenuItem>
          </TextField>
          <Button variant="contained" size="small" fullWidth sx={{ mt: 1 }} onClick={handleEditSave}>
            Sauvegarder
          </Button>
        </Box>
      </Popover>

      {/* Dialog confirmation */}
     <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false })}>
  <DialogTitle>Confirmer l'action</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Voulez-vous vraiment {confirmDialog.type === "archive" ? "archiver" : "supprimer"} cet utilisateur ?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmDialog({ open: false })}>Annuler</Button>
    <Button onClick={handleConfirmAction} color="primary">Confirmer</Button>
  </DialogActions>
</Dialog>

    </Box>

    
</>

  );
};

export default Utilisateurs;
