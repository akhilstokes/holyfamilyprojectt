// client/src/services/accountantService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Latex billing admin endpoints
export async function fetchLatexRequests(params = {}) {
  const res = await axios.get(`${API}/api/latex/admin/requests`, { params, headers: authHeaders() });
  // backend returns {records, total, ...}
  const data = res.data;
  return Array.isArray(data) ? data : (data.records || []);
}

export async function updateLatexRequestAdmin(id, payload) {
  const res = await axios.put(`${API}/api/latex/admin/requests/${id}`, payload, { headers: authHeaders() });
  return res.data;
}

// Wages calc endpoints
export async function calcMonthlySalary(workerId, { year, month }) {
  const res = await axios.get(`${API}/api/daily-wage/calculate/${workerId}`, { params: { year, month }, headers: authHeaders() });
  return res.data?.data;
}

export async function calcEnhancedSalary(workerId, { year, month, overtimeHours = 0, pieceWorkUnits = 0 }) {
  const res = await axios.get(`${API}/api/daily-wage/calculate-enhanced/${workerId}`, {
    params: { year, month, overtimeHours, pieceWorkUnits },
    headers: authHeaders(),
  });
  return res.data?.data;
}

export async function getSalarySummary(workerId, { year, month }) {
  const res = await axios.get(`${API}/api/daily-wage/summary/${workerId}`, { params: { year, month }, headers: authHeaders() });
  return res.data?.data;
}

export async function listDailyWageWorkers(params = {}) {
  const res = await axios.get(`${API}/api/daily-wage/workers`, { params, headers: authHeaders() });
  return res.data?.data || [];
}

// Stock endpoints
export async function getStockSummary() {
  const res = await axios.get(`${API}/api/stock/summary`, { headers: authHeaders() });
  return res.data;
}

export async function listStockItems() {
  const res = await axios.get(`${API}/api/stock/items`, { headers: authHeaders() });
  return res.data || [];
}

export async function updateStockItem(id, payload) {
  const res = await axios.put(`${API}/api/stock/items/${id}`, payload, { headers: authHeaders() });
  return res.data;
}

// Workflow helpers
export async function accountantCalculate(id, marketRate) {
  const res = await axios.put(`${API}/api/latex/admin/calc/${id}`, { marketRate }, { headers: authHeaders() });
  return res.data;
}

export async function managerVerifyReq(id) {
  const res = await axios.put(`${API}/api/latex/admin/verify/${id}`, {}, { headers: authHeaders() });
  return res.data;
}

export async function getInvoice(id) {
  const res = await axios.get(`${API}/api/latex/invoice/${id}`, { headers: authHeaders() });
  return res.data?.invoice;
}
