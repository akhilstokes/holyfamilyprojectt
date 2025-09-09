import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const listProducts = async (params = {}) => {
  const res = await axios.get(`${API}/api/products`, { params });
  return res.data.products;
};

export const getProduct = async (id) => {
  const res = await axios.get(`${API}/api/products/${id}`);
  return res.data.product;
};

export const createProduct = async (data) => {
  const res = await axios.post(`${API}/api/products`, data);
  return res.data.product;
};

export const updateProduct = async (id, data) => {
  const res = await axios.put(`${API}/api/products/${id}`, data);
  return res.data.product;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API}/api/products/${id}`);
  return res.data;
};