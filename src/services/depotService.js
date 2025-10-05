import axios from 'axios';


export const effectuerDepot = async ({ numeroCompte, montant }) => {
  const res = await axios.post('http://localhost:5000/api/comptes/depot', {
    numeroCompte,
    montant: parseFloat(montant)
  });
  return res.data;
};

export const fetchHistorique = async () => {
  const res = await axios.get('http://localhost:5000/api/historique');
  return res.data;
};
