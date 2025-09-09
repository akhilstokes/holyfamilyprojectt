import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const EnquiryService = {
  async create(payload) {
    const { data } = await axios.post(`${API_BASE}/api/enquiries`, payload);
    return data;
  },
  async my() {
    const { data } = await axios.get(`${API_BASE}/api/enquiries/my`);
    return data;
  },
  async adminList() {
    const { data } = await axios.get(`${API_BASE}/api/enquiries`);
    return data;
  },
  async approve(id, adminNotes = '') {
    const { data } = await axios.put(`${API_BASE}/api/enquiries/${id}/approve`, { adminNotes });
    return data;
  },
  async reject(id, adminNotes = '') {
    const { data } = await axios.put(`${API_BASE}/api/enquiries/${id}/reject`, { adminNotes });
    return data;
  },
};