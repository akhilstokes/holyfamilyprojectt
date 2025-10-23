// client/src/services/rateService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const auth = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Manager/Admin
export const proposeRate = async ({ companyRate, marketRate, effectiveDate, product = 'latex60', notes }) => {
  const { data } = await axios.post(`${API}/api/rates/propose`, { companyRate, marketRate, effectiveDate, product, notes }, { headers: auth() });
  return data;
};

export const editRate = async (id, payload) => {
  const { data } = await axios.put(`${API}/api/rates/${id}`, payload, { headers: auth() });
  return data;
};

export const listPendingRates = async (product = 'latex60') => {
  const { data } = await axios.get(`${API}/api/rates/pending`, { params: { product }, headers: auth() });
  return data;
};

// Admin only
export const verifyRate = async (id) => {
  const { data } = await axios.post(`${API}/api/rates/${id}/verify`, {}, { headers: auth() });
  return data;
};

// Public/user
export const getPublishedLatest = async (product = 'latex60') => {
  const { data } = await axios.get(`${API}/api/rates/published/latest`, { params: { product } });
  return data;
};
