import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const startChat = (name = '', email = '') =>
  api.post('/chat/start', { name, email }).then(r => r.data);

export const sendMessage = (session_id, message) =>
  api.post('/chat/message', { session_id, message }).then(r => r.data);

export const getBiasReport = (userId) =>
  api.get(`/audit/${userId}`).then(r => r.data);
