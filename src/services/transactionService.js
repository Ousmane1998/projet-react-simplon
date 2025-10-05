import axios from 'axios';

export const annulerTransaction = async (numero_transaction, motif, agent) => {
  const res = await axios.put(`http://localhost:5000/api/transactions/annuler/${numero_transaction}`, {
    motif,
    agent
  });
  return res.data;
};

export const fetchTransactions = async () => {
  const res = await axios.get('http://localhost:5000/api/transactions');
  return res.data;
};
