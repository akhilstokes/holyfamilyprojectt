// client/src/services/dailyRateService.js
import axios from 'axios';

// Use the same base as other services to avoid mixed origins
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = (token) => (token ? { Authorization: `Bearer ${token}` } : {});

export const addOrUpdateDaily = (data, token) =>
  axios.post(`${API}/api/daily-rates`, data, { headers: authHeaders(token) });

export const updateDailyById = (id, data, token) =>
  axios.put(`${API}/api/daily-rates/${id}`, data, { headers: authHeaders(token) });

export const getLatest = (category = 'LATEX60') =>
  axios.get(`${API}/api/daily-rates/latest`, { params: { category } });

export const getHistory = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/history`, {
    params,
    headers: authHeaders(token),
  });

export const exportCsv = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/export/csv`, {
    params,
    responseType: 'blob',
    headers: authHeaders(token),
  });

export const exportPdf = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/export/pdf`, {
    params,
    responseType: 'blob',
    headers: authHeaders(token),
  });