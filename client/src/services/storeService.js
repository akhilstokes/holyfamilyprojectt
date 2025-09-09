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