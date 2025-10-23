const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export async function getBarrels(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/api/barrels${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch barrels (${res.status})`);
  return res.json();
}

export async function updateBarrel(id, payload) {
  const res = await fetch(`${API}/api/barrels/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update barrel (${res.status})`);
  return res.json();
}

export async function markInUse(id) {
  const res = await fetch(`${API}/api/barrels/${id}/mark-in-use`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to mark in use (${res.status})`);
  return res.json();
}

export async function getFefoNext() {
  const res = await fetch(`${API}/api/barrels/fefo/next`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch FEFO next (${res.status})`);
  return res.json();
}

export async function getFefoQueue() {
  const res = await fetch(`${API}/api/barrels/fefo/queue`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch FEFO queue (${res.status})`);
  return res.json();
}

export const BARREL_STATUSES = [
  'available',
  'assigned',
  'picked',
  'in_transit',
  'dropped',
  'returned',
  'scrapped',
];
