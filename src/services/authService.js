import axios from 'axios';



export const loginAgent = async (email, motDePasse) => {
  try {
    const res = await axios.post('http://localhost:5000/api/login', {
      email,
      motDePasse,
    });

    console.log("🔍 Données reçues du backend :", res.data); // 👈 Ajoute cette ligne

    return res.data;
  } catch (error) {
    console.error("❌ Erreur lors du login :", error.response?.data || error.message);
    throw error;
  }
};

