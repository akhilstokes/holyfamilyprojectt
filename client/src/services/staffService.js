// client/src/services/staffService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const get = async (url, params) => {
  const maxRetries = 3;
  let attempt = 0;
  let delay = 500; // ms
  for (;;) {
    try {
      const res = await axios.get(url, { withCredentials: true, headers: authHeaders(), params });
      return res.data;
    } catch (e) {
      const status = e?.response?.status;
      if (status === 429 && attempt < maxRetries) {
        await sleep(delay);
        attempt += 1;
        delay *= 2; // exponential backoff: 0.5s -> 1s -> 2s
        continue;
      }
      throw e;
    }
  }
};
const post = (url, body) => axios.post(url, body, { withCredentials: true, headers: { ...authHeaders(), 'Content-Type': 'application/json' } }).then(r => r.data);

// Admin actions
// Accepts: { email, name, address?, phone?, photoUrl?, passwordInit? }
export const inviteStaff = (payload) => post(`${API}/api/staff-invite/invite`, payload);
export const listStaff = ({ page = 1, limit = 50 } = {}) => get(`${API}/api/staff-invite/invites`, { page, limit });
export const resendInvite = (inviteId) => post(`${API}/api/staff-invite/invites/${inviteId}/resend`, {});

// Public/Verification actions
// Get invite details for form pre-population
export const getInviteDetails = (token) => 
  get(`${API}/api/staff-invite/invite/${token}`);

// Accepts: { token, name, address, phone, photoUrl? }
export const verifyStaffInvite = (payload) =>
  post(`${API}/api/staff-invite/verify-invite`, payload);

// Admin: activate/deactivate staff
export const setStaffActive = (userId, active) => post(`${API}/api/staff-invite/${userId}/active`, { active: !!active });

// Optional: backend CSV export if available
export const exportStaffCsv = () => axios.get(`${API}/api/staff/export`, { headers: authHeaders(), responseType: 'blob' });

// Admin approve a verified staff account
export const approveStaff = (inviteId) => post(`${API}/api/staff-invite/invites/${inviteId}/approve`, {});

// Admin: CRUD for actual staff users
// Fetch staff users; params can include role(s), status, pagination, etc.
export const listStaffUsers = (params = {}) => get(`${API}/api/user-management/staff`, { ...params });
export const updateStaffUser = (id, body) => axios.put(`${API}/api/user-management/${id}/status`, body, { withCredentials: true, headers: { ...authHeaders(), 'Content-Type': 'application/json' } }).then(r=>r.data);
export const deleteStaffUser = (id) => axios.delete(`${API}/api/user-management/${id}`, { withCredentials: true, headers: authHeaders() }).then(r=>r.data);
