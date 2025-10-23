import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all staff records
export const getAllStaffRecords = (params = {}) => 
  axios.get(`${API}/api/staff-records`, { 
    params, 
    withCredentials: true, 
    headers: authHeaders() 
  }).then(r => r.data);

// Get single staff record
export const getStaffRecord = (id) => 
  axios.get(`${API}/api/staff-records/${id}`, { 
    withCredentials: true, 
    headers: authHeaders() 
  }).then(r => r.data);

// Get staff record by staff ID
export const getStaffRecordByStaffId = (staffId) => 
  axios.get(`${API}/api/staff-records/staff-id/${staffId}`, { 
    withCredentials: true, 
    headers: authHeaders() 
  }).then(r => r.data);

// Soft delete staff record (preserves login credentials)
export const deleteStaffRecord = (id, reason = '') => 
  axios.delete(`${API}/api/staff-records/${id}`, { 
    data: { reason },
    withCredentials: true, 
    headers: { ...authHeaders(), 'Content-Type': 'application/json' }
  }).then(r => r.data);

// Restore deleted staff record
export const restoreStaffRecord = (id) => 
  axios.put(`${API}/api/staff-records/${id}/restore`, {}, { 
    withCredentials: true, 
    headers: { ...authHeaders(), 'Content-Type': 'application/json' }
  }).then(r => r.data);

// Permanently delete staff record (admin only)
export const permanentlyDeleteStaffRecord = (id) => 
  axios.delete(`${API}/api/staff-records/${id}/permanent`, { 
    data: { confirm: true },
    withCredentials: true, 
    headers: { ...authHeaders(), 'Content-Type': 'application/json' }
  }).then(r => r.data);

// Update staff record status
export const updateStaffRecordStatus = (id, isActive, reason = '') => 
  axios.put(`${API}/api/staff-records/${id}/status`, { 
    isActive, 
    reason 
  }, { 
    withCredentials: true, 
    headers: { ...authHeaders(), 'Content-Type': 'application/json' }
  }).then(r => r.data);



















