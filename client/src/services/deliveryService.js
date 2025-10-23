// client/src/services/deliveryService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const auth = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createTask = async (payload) => {
  const { data } = await axios.post(`${API}/api/delivery`, payload, { headers: auth() });
  return data;
};

export const listMyTasks = async (params = {}) => {
  const { data } = await axios.get(`${API}/api/delivery/my`, { params, headers: auth() });
  return data;
};

export const updateStatus = async (id, payload) => {
  const { data } = await axios.put(`${API}/api/delivery/${id}/status`, payload, { headers: auth() });
  return data;
};

// Admin/Manager CRUD helpers
export const listAllTasks = async (params = {}) => {
  const { data } = await axios.get(`${API}/api/delivery`, { params, headers: auth() });
  return data; // { items, total, page, limit }
};

export const getTask = async (id) => {
  const { data } = await axios.get(`${API}/api/delivery/${id}`, { headers: auth() });
  return data;
};

export const updateTaskFields = async (id, payload) => {
  const { data } = await axios.put(`${API}/api/delivery/${id}`, payload, { headers: auth() });
  return data;
};

export const deleteTask = async (id) => {
  const { data } = await axios.delete(`${API}/api/delivery/${id}`, { headers: auth() });
  return data;
};
