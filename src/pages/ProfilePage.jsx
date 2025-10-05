import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
} from "@mui/material";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  // ✅ Charger l'utilisateur connecté depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  // ✅ Gérer les changements de champ
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // ✅ Gérer l'upload de photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, photo: reader.result }); // base64 temporaire
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/utilisateurs/${user._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    const result = await response.json();

    if (response.ok) {
      alert("✅ Profil mis à jour avec succès");
      localStorage.setItem("user", JSON.stringify(result.utilisateur));
      setUser(result.utilisateur);
    } else {
      alert("❌ Erreur lors de la mise à jour");
      console.error(result.error);
    }
  } catch (err) {
    console.error("❌ Erreur réseau :", err);
    alert("❌ Erreur réseau");
  }
};


  if (!user)
    return (
      <Typography sx={{ mt: 5, textAlign: "center" }}>
        Chargement du profil...
      </Typography>
    );

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          textAlign="center"
          sx={{ fontWeight: "bold" }}
        >
          Mon Profil
        </Typography>

        <Grid container spacing={3}>
          {/* ✅ Photo de profil */}
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            {user.photo && (
              <img
                src={
                  user.photo.startsWith("data:")
                    ? user.photo
                    : `http://localhost:5000/images/${user.photo}`
                }
                alt="Photo de profil"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 16,
                }}
              />
            )}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
          </Grid>

          {["nom", "prenom", "email", "telephone", "adresse"].map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                fullWidth
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                name={key}
                value={user[key] || ""}
                onChange={handleChange}
              />
            </Grid>
          ))}
        </Grid>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, display: "block", mx: "auto", px: 4 }}
          onClick={handleSave}
        >
          Enregistrer les modifications
        </Button>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
