import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const safeGet = async (url, opts = {}, fallback = null) => {
  try {
    const res = await axios.get(url, opts);
    return res.data;
  } catch {
    return fallback;
  }
};

const safePost = async (url, payload = {}, opts = {}, fallback = null) => {
  try {
    const res = await axios.post(url, payload, opts);
    return res.data;
  } catch {
    return fallback;
  }
};

export const saveBuyerProfile = async (profile) => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await safePost(`${API}/api/buyers/profile`, profile, { headers }, { success: true });
  // Maintain a local cache for admin view fallback
  try {
    const list = JSON.parse(localStorage.getItem('buyer_profiles_all') || '[]');
    const next = [...list.filter((x) => x.email !== profile.email), { ...profile, updatedAt: new Date().toISOString() }];
    localStorage.setItem('buyer_profiles_all', JSON.stringify(next));
  } catch {}
  return res;
};

export const fetchBuyerProfiles = async () => {
  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await safeGet(`${API}/api/buyers/profiles`, { headers }, null);
  if (res?.success && Array.isArray(res.profiles)) return res.profiles;
  // Fallback to local cache
  try {
    return JSON.parse(localStorage.getItem('buyer_profiles_all') || '[]');
  } catch {
    return [];
  }
};


