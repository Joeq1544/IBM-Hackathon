import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export const analyzeCredit = (userSubmission) =>
  api.post('/credit/analyze', userSubmission).then((r) => r.data);

export const getUser = (userId) =>
  api.get(`/user/${userId}`).then((r) => r.data);

export const getBiasReport = (userId) =>
  api.get(`/audit/${userId}`).then((r) => r.data);
