import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// POST /api/staff/trips
export async function createTrip(plan) {
  const { data } = await axios.post(`${API}/api/staff/trips`, plan, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return data; // { trip }
}

// GET /api/staff/trips?date=YYYY-MM-DD
export async function getTrips(params = {}) {
  const { data } = await axios.get(`${API}/api/staff/trips`, {
    params,
    headers: authHeaders(),
  });
  return data; // { trips: [] }
}

// GET /api/staff/trips/:id
export async function getTrip(tripId) {
  const { data } = await axios.get(`${API}/api/staff/trips/${tripId}`, {
    headers: authHeaders(),
  });
  return data; // { trip }
}

// PATCH /api/staff/trips/:id/stops/:stopId/status
export async function updateStopStatus(tripId, stopId, payload) {
  const { data } = await axios.patch(`${API}/api/staff/trips/${tripId}/stops/${stopId}/status`, payload, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return data; // { stop }
}

// Optional: notify users (server should handle side effects)
export async function notifyTripEvent(payload) {
  const { data } = await axios.post(`${API}/api/notifications/staff-trip-event`, payload, {
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  return data;
}

// Upload proof image/file and return URL
export async function uploadProof(file) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axios.post(`${API}/api/uploads`, form, {
    headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
  });
  // support { url } or { path }
  const url = data?.url || data?.path || data?.fileUrl;
  return { url };
}
