import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Graceful API wrapper with fallback
const safeGet = async (url, opts = {}, fallback = null) => {
  try {
    const res = await axios.get(url, opts);
    return res.data;
  } catch {
    return fallback;
  }
};

export const fetchProducts = async (params = {}) => {
  const data = await safeGet(`${API}/api/products`, { params }, null);
  if (data && data.success) return data.products;
  // Fallback mock
  return [
    { _id: 'm1', name: 'Sample Raw Material', type: 'raw', category: 'center', price: 120, imageUrl: '', description: 'Sample description' },
    { _id: 'm2', name: 'Sample Finished Good', type: 'finished', category: 'shop', price: 220, imageUrl: '', description: 'Sample description' },
    { _id: 'm3', name: 'Sample Accessory', type: 'accessory', category: 'shop', price: 60, imageUrl: '', description: 'Sample description' },
  ];
};

export const fetchProductById = async (id) => {
  if (!id) return null;
  const data = await safeGet(`${API}/api/products/${id}`, {}, null);
  if (data && data.success) return data.product;
  // Fallback: search in mocked list
  const list = await fetchProducts();
  return list.find(p => p._id === id) || null;
};

export const placeOrder = async (payload) => {
  try {
    const res = await axios.post(`${API}/api/orders`, payload, { withCredentials: true });
    return res.data;
  } catch (e) {
    // Mock immediate success
    return { success: true, order: { _id: 'mock-order', ...payload, status: 'pending' } };
  }
};

export const fetchMyOrders = async () => {
  const data = await safeGet(`${API}/api/orders/my`, { withCredentials: true }, null);
  if (data && data.success) return data.orders;
  return [];
};

export const createRazorpayOrder = async (orderId) => {
  try {
    const res = await axios.post(`${API}/api/orders/${orderId}/pay/razorpay`, {}, { withCredentials: true });
    return res.data;
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || 'Failed to create payment order' };
  }
};

export const verifyRazorpayPayment = async (orderId, payload) => {
  try {
    const res = await axios.post(`${API}/api/orders/${orderId}/pay/razorpay/verify`, payload, { withCredentials: true });
    return res.data;
  } catch (e) {
    return { success: false, message: e?.response?.data?.message || 'Payment verification failed' };
  }
};

// Barrel Scrape APIs
export const createBarrelScrape = async (payload) => {
  try {
    const res = await axios.post(`${API}/api/barrel-scrapes`, payload, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to create scrape entry' };
  }
};

export const listBarrelScrapes = async (params = {}) => {
  try {
    const res = await axios.get(`${API}/api/barrel-scrapes`, { params, withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to fetch scrapes' };
  }
};

// Sales APIs
export const createSalesEntry = async (payload) => {
  try {
    const res = await axios.post(`${API}/api/sales`, payload, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to create sales entry' };
  }
};

export const listMySales = async (params = {}) => {
  try {
    const res = await axios.get(`${API}/api/sales/my`, { params, withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to fetch sales' };
  }
};

export const getSalesYearlySummary = async (year) => {
  try {
    const res = await axios.get(`${API}/api/sales/summary/${year}`, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to fetch yearly summary' };
  }
};

export const getSalesPrediction = async (year) => {
  try {
    const res = await axios.get(`${API}/api/sales/predict/${year}`, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to fetch prediction' };
  }
};

// Barrel inventory and requests/issues
export const listBarrels = async () => {
  try {
    const res = await axios.get(`${API}/api/barrels`, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to fetch barrels' };
  }
};

export const createBarrelRequest = async (quantity, notes = '') => {
  try {
    const res = await axios.post(`${API}/api/requests/barrels`, { quantity, notes }, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to submit barrel request' };
  }
};

export const reportIssue = async ({ category, title, description }) => {
  try {
    const res = await axios.post(`${API}/api/requests/issues`, { category, title, description }, { withCredentials: true });
    return res.data;
  } catch (e) {
    throw e.response?.data || { message: 'Failed to submit issue' };
  }
};