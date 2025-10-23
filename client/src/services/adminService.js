import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Attach token for protected routes
const authHeaders = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

// Helpers
const get = (url, params) => axios.get(url, { withCredentials: true, headers: authHeaders(), params }).then(r => r.data);
const post = (url, body) => axios.post(url, body, { withCredentials: true, headers: authHeaders() }).then(r => r.data);
const put = (url, body) => axios.put(url, body, { withCredentials: true, headers: authHeaders() }).then(r => r.data);

// Attendance
export const listAttendance = ({ from, to, staffId, page = 1, limit = 50 } = {}) =>
  get(`${API}/api/workers/attendance`, { from, to, staffId, page, limit });

export const adminMarkAttendance = ({ staffId, date, checkInAt, checkOutAt, isLate = false }) => {
  if (!staffId || !date) throw new Error('staffId and date are required');
  return post(`${API}/api/workers/attendance/admin-mark`, { staffId, date, checkInAt, checkOutAt, isLate });
};

// Weekly Schedules (admin)
export const listSchedules = ({ from, to } = {}) => get(`${API}/api/schedules`, { from, to });
export const getScheduleByWeek = (weekStart) => get(`${API}/api/schedules/by-week`, { weekStart });
export const upsertSchedule = (payload) => {
  const required = ['weekStart','morningStart','morningEnd','eveningStart','eveningEnd'];
  for (const k of required) if (!payload?.[k]) throw new Error(`${k} is required`);
  return post(`${API}/api/schedules`, payload);
};
export const updateScheduleAssignments = (id, assignments) => {
  if (!id) throw new Error('schedule id is required');
  return put(`${API}/api/schedules/${id}/assignments`, { assignments });
};

// Hanger Spaces (admin + staff)
export const listHangerSpaces = () => get(`${API}/api/hanger-spaces`);
export const seedHangerGrid = () => post(`${API}/api/hanger-spaces/seed-grid`);
export const upsertHangerSpace = (payload) => post(`${API}/api/hanger-spaces`, payload);
export const setHangerSpaceStatus = (id, status, product = '') => put(`${API}/api/hanger-spaces/${id}/status`, { status, product });
export const bulkSetHangerSpaceStatus = (ids, status) => post(`${API}/api/hanger-spaces/bulk/status`, { ids, status });
export const deleteHangerSpace = (id) => axios.delete(`${API}/api/hanger-spaces/${id}`, { withCredentials: true, headers: authHeaders() }).then(r => r.data);
export const listVacantHangerSpaces = () => get(`${API}/api/hanger-spaces/vacant`);
export const staffAssignHangerSpace = (id, action, product = '') => post(`${API}/api/hanger-spaces/${id}/assign`, { action, product });

// Barrel assignments / logistics admin approvals
export const approveBarrelPurchase = (barrelId) => post(`${API}/api/barrel-logistics/approve/purchase`, { barrelId });
export const approveBarrelDisposal = (barrelId) => post(`${API}/api/barrel-logistics/approve/disposal`, { barrelId });
export const requestBarrelDisposal = (barrelId) => post(`${API}/api/barrel-logistics/request/disposal`, { barrelId });

// Stock summaries
export const getStockSummary = () => get(`${API}/api/stock/summary`);
export const getStockLevel = () => get(`${API}/api/stock`);

// Chemicals
export const listChemicals = () => get(`${API}/api/chemicals`);
export const addOrUpdateChemical = (payload) => post(`${API}/api/chemicals`, payload);
export const addChemicalLot = (name, payload) => post(`${API}/api/chemicals/${encodeURIComponent(name)}/lots`, payload);
export const issueChemical = (name, quantity) => post(`${API}/api/chemicals/${encodeURIComponent(name)}/issue`, { quantity });
export const chemicalAlerts = () => get(`${API}/api/chemicals/alerts/all`);

// Worker documents
export const uploadDocument = async (file) => {
  const form = new FormData();
  form.append('file', file);
  const res = await axios.post(`${API}/api/uploads/document`, form, { withCredentials: true, headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

export const addSelfWorkerDocument = ({ label, url }) => post(`${API}/api/workers/me/documents`, { label, url });