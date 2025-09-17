// client/src/services/dailyRateService.js
import axios from 'axios';
const API = process.env.REACT_APP_API_BASE || '';

export const addOrUpdateDaily = (data, token) =>
  axios.post(`${API}/api/daily-rates`, data, { headers: { Authorization: `Bearer ${token}` } });

export const updateDailyById = (id, data, token) =>
  axios.put(`${API}/api/daily-rates/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const getLatest = (category = 'LATEX60') =>
  axios.get(`${API}/api/daily-rates/latest`, { params: { category } });

export const getHistory = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/history`, {
    params,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

export const exportCsv = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/export/csv`, {
    params,
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
  });

export const exportPdf = (params = {}, token) =>
  axios.get(`${API}/api/daily-rates/export/pdf`, {
    params,
    responseType: 'blob',
    headers: { Authorization: `Bearer ${token}` },
  });