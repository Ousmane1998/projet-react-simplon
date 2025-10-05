import axios from 'axios';

export const fetchUtilisateurs = async () => {
  const res = await axios.get('http://localhost:5000/api/utilisateurs');
  return res.data;
};

export const createUtilisateur = async (data) => {
  const res = await axios.post('http://localhost:5000/api/utilisateurs', data);
  return res.data;
};


export const updateUser = (id, data) =>
  axios.put(`http://localhost:5000/api/utilisateurs/${id}`, data);

export const archiveUser = (id) =>
  axios.patch(`http://localhost:5000/api/utilisateurs/${id}/archive`);

export const blockUser = (id) =>
  axios.patch(`http://localhost:5000/api/utilisateurs/${id}/block`);
export const unblockUser = (id) =>
  axios.put(`http://localhost:5000/api/utilisateurs/${id}`, { is_blocking: false });
export const unarchiveUser = (id) =>
  axios.put(`http://localhost:5000/api/utilisateurs/${id}`, { is_archived: false });
export const deleteUser = (id) =>
  axios.delete(`http://localhost:5000/api/utilisateurs/${id}`);



