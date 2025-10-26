import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createTask } from '../../services/deliveryService';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const ASSIGN_BASE = process.env.REACT_APP_ASSIGN_BASE || '';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

const ManagerSellRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: 'PENDING' });
  const [typeSeg, setTypeSeg] = useState('ALL'); // ALL | BARRELS | EMPTY | PRODUCTION
  const [assignDeliveryId, setAssignDeliveryId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [approvedRequests, setApprovedRequests] = useState(new Set());
  const [assignedRequests, setAssignedRequests] = useState(new Set());
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [maxRetries] = useState(3);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyRows, setHistoryRows] = useState([]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const url = `${API}/api/sell-requests/admin/all?limit=200`;
      const res = await fetch(url, { headers: authHeaders(), cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const data = await res.json();
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
      const rows = list.map(r => ({
        id: r._id,
        user: r.farmerId?.name || r.farmerId?.email || r.name || r.user?.name || '-',
        staff: r.assignedDeliveryStaffId?.name || r.assignedDeliveryStaffId?.email || '-',
        date: r.updatedAt || r.createdAt,
        status: r.status || '-'
      })).sort((a,b)=> new Date(b.date||0) - new Date(a.date||0));
      setHistoryRows(rows);
    } catch (e) {
      setError(e?.message || 'Failed to load history');
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const statusOptions = useMemo(() => ([
    'PENDING','REQUESTED','FIELD_ASSIGNED','COLLECTED','DELIVER_ASSIGNED','DELIVERED_TO_LAB','TESTED','ACCOUNT_CALCULATED','VERIFIED','INVOICED'
  ]), []);

  const load = async (force = false) => {
    // Prevent multiple concurrent requests
    if (loading && !force) {
      return;
    }

    // Simple rate limiting: prevent requests if last request was less than 10 seconds ago
    const now = Date.now();
    if (!force && now - lastRequestTime < 10000) {
      // Silently ignore rapid clicks without showing a message
      return;
    }

    setLoading(true); 
    setError('');
    setLastRequestTime(now);
    
    try {
      // Try multiple endpoints to get all types of user requests
      const endpoints = [
        '/api/sell-requests/admin/all',
        '/api/latex/admin/requests',
        '/api/barrel-requests/admin/all',
        // '/api/chemical-requests/admin/all', // removed (route not available)
        '/api/delivery/barrels/intake'
      ];
      
      let allRequests = [];
      let lastError = '';
      
      // Add small delays between requests to avoid rate limiting
      for (const endpoint of endpoints) {
        try {
          const url = `${API}${endpoint}`;
          const res = await fetch(url, { 
            headers: authHeaders(),
            cache: 'no-cache'
          });
          
          if (res.status === 429) {
            // Rate limited - wait and retry once
            const retryAfter = res.headers.get('Retry-After') || 5;
            console.warn(`Rate limited on ${endpoint}, waiting ${retryAfter}s...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            
            // Retry the request
            const retryRes = await fetch(url, { 
              headers: authHeaders(),
              cache: 'no-cache'
            });
            
            if (!retryRes.ok) {
              lastError = `Failed to load from ${endpoint} (${retryRes.status})`;
              continue;
            }
            
            const data = await retryRes.json();
            const raw = data?.records || data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
            
            if (raw && raw.length > 0) {
              const typedRequests = raw.map(r => ({
                ...r,
                _source: endpoint,
                _type: endpoint.includes('latex') ? 'LATEX' : 
                       endpoint.includes('delivery/barrels') ? 'SELL_BARRELS' :
                       endpoint.includes('barrel') ? 'BARREL' :
                       endpoint.includes('chemical') ? 'CHEMICAL' : 'SELL'
              }));
              allRequests = allRequests.concat(typedRequests);
            }
            continue;
          }
          
          if (!res.ok) { 
            lastError = `Failed to load from ${endpoint} (${res.status})`;
            continue;
          }
          
          const data = await res.json();
          const raw = data?.records || data?.items || data?.results || data?.data || (Array.isArray(data) ? data : []);
          
          if (raw && raw.length > 0) {
            // Add source type to each request
            const typedRequests = raw.map(r => ({
              ...r,
              _source: endpoint,
              _type: endpoint.includes('latex') ? 'LATEX' : 
                     endpoint.includes('delivery/barrels') ? 'SELL_BARRELS' :
                     endpoint.includes('barrel') ? 'BARREL' :
                     endpoint.includes('chemical') ? 'CHEMICAL' : 'SELL'
            }));
            allRequests = allRequests.concat(typedRequests);
          }
          
          // Add 200ms delay between requests to avoid rate limiting
          if (endpoint !== endpoints[endpoints.length - 1]) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (e) {
          console.log(`Error fetching ${endpoint}:`, e.message);
          continue;
        }
      }
      
      if (allRequests.length === 0) { 
        setError('No user requests found in any category');
        setRows([]);
        return;
      }
      
      // Sort by creation date (newest first)
      allRequests.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.requestedAt || a.submittedAt || 0);
        const dateB = new Date(b.createdAt || b.requestedAt || b.submittedAt || 0);
        return dateB - dateA;
      });
      
      const normalized = allRequests.map(r => {
        const s = r.status ?? r.requestStatus ?? r.state ?? r.currentStatus;
        return {
          ...r,
          _statusUpper: typeof s === 'string' ? s.toUpperCase() : '',
          _createdAt: r.createdAt || r.requestedAt || r.submittedAt || r.created_on || r.date || r.timestamp,
          _type: r._type || r.type || r.requestType || r.category || 'USER REQUEST',
          _notes: r.notes || r.subject || r.description || r.remark || r.message || 
                  (r.barrelCount ? `Sell ${r.barrelCount} barrel(s)` : undefined) ||
                  (r.quantity ? `${r.quantity}kg latex` : undefined) ||
                  (r.chemicalName ? `Chemical: ${r.chemicalName}` : undefined),
          _farmer: r.name || r.contactName || r.farmerName || r.user?.name || r.userName || 
                   r.farmerId?.name || r.farmerId?.email || r.user?.email || r.email ||
                   r.requestedBy?.name || r.createdBy?.name || 'Unknown User',
        };
      });
      
      setRows(normalized);
      setRetryCount(0);
      setIsRetrying(false);
      
    } catch (e) {
      setError(`Failed to load user requests: ${e?.message || 'Network error'}`);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters.status]);
  // No automatic polling - only manual refresh to prevent 429 errors

  // minimized: removed enrichment

  // assignField removed per request

  const openAssignDelivery = async (id) => {
    // Show delivery staff selection modal
    setAssignDeliveryId(id);
    setShowAssignModal(true);
    setError('');
    setInfo('');
    setStaffError('');
    setStaffLoading(true);
    try {
      // Try multiple endpoints to get delivery staff
      let deliveryStaff = [];
      
      // First try the user-management endpoint
      try {
        const res = await fetch(`${API}/api/user-management/staff?role=delivery_staff&status=active&limit=100`, { headers: authHeaders() });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.users) ? data.users : (Array.isArray(data?.records) ? data.records : []);
          deliveryStaff = list.filter(u => (u.role || '').toLowerCase() === 'delivery_staff');
        }
      } catch (e) {
        console.log('User-management endpoint failed, trying shifts endpoint');
      }
      
      // If no results, try the shifts endpoint
      if (deliveryStaff.length === 0) {
        try {
          const res = await fetch(`${API}/api/shifts/staff`, { headers: authHeaders() });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data?.staff) ? data.staff : (Array.isArray(data) ? data : []);
            deliveryStaff = list.filter(u => (u.role || '').toLowerCase() === 'delivery_staff');
          }
        } catch (e) {
          console.log('Shifts endpoint failed, trying fallback');
        }
      }
      
      // Fallback: try the old users endpoint
      if (deliveryStaff.length === 0) {
        try {
          const res = await fetch(`${API}/api/users`, { headers: authHeaders() });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? data : []);
            deliveryStaff = list.filter(u => (u.role || '').toLowerCase() === 'delivery_staff');
          }
        } catch (e) {
          console.log('All endpoints failed');
        }
      }
      
      setStaffList(deliveryStaff);
      if (deliveryStaff.length === 0) {
        setStaffError('No delivery staff found. Please ensure delivery staff are registered in the system.');
      }
    } catch (e) {
      setStaffError('Failed to load delivery staff');
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  const confirmAssignDelivery = async () => {
    if (!selectedStaff) {
      setError('Please select a delivery staff member');
      return;
    }
    
    // Disable button after clicking
    setAssignedRequests(prev => new Set([...prev, assignDeliveryId]));
    
    try {
      const req = rows.find(r => r._id === assignDeliveryId) || {};
      
      // For SELL requests, assign on SellRequest; for SELL_BARRELS (delivery intakes), skip and directly create a task
      if (req._type === 'SELL') {
        const assignResponse = await fetch(`${API}/api/sell-requests/${assignDeliveryId}/assign-delivery`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ deliveryStaffId: selectedStaff })
        });
        if (!assignResponse.ok) {
          throw new Error(`Failed to assign delivery staff: ${assignResponse.status}`);
        }
      }
      
      // Normalize pickup address to a string (backend expects strings)
      const rawPickup = req.pickupAddress || req.address || req.capturedAddress || req.location;
      const pickupAddress = typeof rawPickup === 'string'
        ? rawPickup
        : (rawPickup && typeof rawPickup === 'object' && (rawPickup.label || rawPickup.name || rawPickup.address))
          ? (rawPickup.label || rawPickup.name || rawPickup.address)
          : 'Customer pickup location';

      // Then create a delivery task for the staff to see
      const payload = {
        title: req._type ? `${req._type} Pickup` : 'Pickup Task',
        customerUserId: req.createdBy || req.user?._id || req.userId || undefined,
        assignedTo: selectedStaff,
        pickupAddress,
        dropAddress: 'HFP Lab / Yard',
        scheduledAt: new Date().toISOString(),
        notes: req._notes || undefined,
        meta: {
          barrelCount: req.barrelCount ?? undefined,
          sellRequestId: req._type === 'SELL' ? req._id : undefined,
          intakeId: req._type === 'SELL_BARRELS' ? req._id : undefined
        }
      };
      
      await createTask(payload);
      setInfo('Assigned successfully');
      
      // Optimistic status update in table
      setRows(prev => prev.map(r => (
        r._id === assignDeliveryId ? { ...r, status: 'assigned', _statusUpper: 'ASSIGNED' } : r
      )));
      setAssignedRequests(prev => new Set([...prev, assignDeliveryId]));
      
    } catch (e) {
      setError('Failed to assign delivery staff: ' + (e?.message || 'Unknown error'));
      console.error('Assignment error:', e);
    }
    
    setShowAssignModal(false);
    setSelectedStaff('');
    setAssignDeliveryId(null);
    setError('');
  };


  const [verifyingId, setVerifyingId] = useState('');
  const [approvingId, setApprovingId] = useState('');
  const [info, setInfo] = useState('');
  const [cbEditId, setCbEditId] = useState('');
  const [cbEditValue, setCbEditValue] = useState('');
  const [bcEditId, setBcEditId] = useState('');
  const [bcEditValue, setBcEditValue] = useState('');

  const verify = async (id) => {
    if (verifyingId) return; // prevent duplicate clicks
    if (!window.confirm('Mark this request as verified?')) return;
    try {
      setVerifyingId(id);
      setError(''); setInfo('');
      // Use sell-requests API for verification
      const target = `${API}/api/sell-requests/${id}/verify`;
      const res = await fetch(target, { method: 'PUT', headers: authHeaders() });
      if (!res.ok) throw new Error(`Verify failed ${res.status} @ ${target}`);
      setInfo('Verified successfully.');
      // Optimistically mark status as approved in the table
      setRows(prev => prev.map(r => (
        r._id === id ? { ...r, status: 'approved', _statusUpper: 'APPROVED' } : r
      )));
      await load();
    } catch (e) {
      setError((e?.message || 'Verify failed').replace(/<[^>]*>/g, ''));
    } finally {
      setVerifyingId('');
    }
  };

  const approve = async (id) => {
    // Disable button after clicking
    setApprovedRequests(prev => new Set([...prev, id]));
    setInfo('Approved! ✅');
    setError('');
    try {
      const r = rows.find(x => x._id === id) || {};
      // If this row came from delivery barrel intake list, mark approved via generic update
      // The /approve endpoint requires pricePerBarrel and returns 400 without it.
      if (String(r._source || '').includes('/delivery/barrels/intake')) {
        const target = `${API}/api/delivery/barrels/intake/${id}`;
        await fetch(target, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'approved' }) });
      }
      // Reflect approved status immediately in the table
      setRows(prev => prev.map(x => x._id === id ? { ...x, status: 'approved', _statusUpper: 'APPROVED' } : x));
    } catch (_) { /* non-blocking */ }
    // After approval, proceed to assign delivery
    openAssignDelivery(id);
  };

  const saveCompanyBarrel = async (id, value) => {
    const clean = String(value).trim();
    if (!clean) { setError('Company barrel cannot be empty'); return; }
    try {
      setError(''); setInfo('');
      const res = await fetch(`${API}/api/delivery/barrels/intake/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ companyBarrel: clean })
      });
      if (!res.ok) throw new Error(`Failed to set company barrel (${res.status})`);
      setInfo('Company barrel updated');
      await load(true);
      setCbEditId('');
      setCbEditValue('');
    } catch (e) {
      setError(e?.message || 'Failed to update company barrel');
    }
  };

  const onSaveBarrelCount = async (id, value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 1) { setError('Barrel count must be at least 1'); return; }
    try {
      setError(''); setInfo('');
      const res = await fetch(`${API}/api/delivery/barrels/intake/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ barrelCount: n })
      });
      if (!res.ok) throw new Error(`Failed to update barrel count (${res.status})`);
      setInfo('Barrel count updated');
      await load(true);
      setBcEditId('');
      setBcEditValue('');
    } catch (e) {
      setError(e?.message || 'Failed to update barrel count');
    }
  };

  const setUserAllowance = async (userId, currentLabel = '') => {
    if (!userId) { setError('Missing user id for allowance'); return; }
    const input = window.prompt(`Set user allowance (total barrels). ${currentLabel ? `Current: ${currentLabel}` : ''}`);
    if (input == null) return;
    const n = Number(input);
    if (!Number.isFinite(n) || n < 0) { setError('Allowance must be a number >= 0'); return; }
    try {
      setError(''); setInfo('');
      const res = await fetch(`${API}/api/delivery/barrels/allowance/${userId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ allowance: n })
      });
      if (!res.ok) throw new Error(`Failed to set allowance (${res.status})`);
      const data = await res.json();
      setInfo(`Allowance set. Total: ${data.allowance ?? n}, Remaining: ${Number.isFinite(data.remaining) ? data.remaining : 'Unlimited'}`);
      await load(true);
    } catch (e) {
      setError(e?.message || 'Failed to set allowance');
    }
  };

  const filtered = rows.filter(r => {
    // Type segmentation
    let typeOk = true;
    if (typeSeg === 'BARRELS') typeOk = r._type === 'BARREL';
    else if (typeSeg === 'EMPTY') typeOk = r._type === 'SELL_BARRELS';
    else if (typeSeg === 'PRODUCTION') typeOk = r._type === 'LATEX';

    // Status filter
    if (!filters.status) return typeOk;
    const wanted = filters.status.toUpperCase();
    if (wanted === 'PENDING') {
      return typeOk && (r._statusUpper === 'PENDING' || r._statusUpper === 'REQUESTED');
    }
    return typeOk && (r._statusUpper === wanted);
  });

  const safeDate = (d) => {
    if (!d) return '-';
    try { const dt = new Date(d); return Number.isNaN(dt.getTime()) ? '-' : dt.toLocaleString(); } catch { return '-'; }
  };

  const displayFarmer = (r) => {
    const toStr = (v) => {
      if (v == null) return '';
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (typeof v === 'object') {
        // Try common fields
        const cand = v.name || v.fullName || v.email || v.phone || v.mobile || v._id;
        return cand ? String(cand) : '';
      }
      return '';
    };

    const name = toStr(r._farmer) || toStr(r.farmerName) || toStr(r.userName) || toStr(r.name) || toStr(r.customerName) || toStr(r.contactName) || toStr(r.farmer?.name) || toStr(r.requestedBy?.name) || toStr(r.createdBy?.name) || toStr(r.requester?.name) || toStr(r.ownerName) || toStr(r.profile?.name) || toStr(r.user?.fullName) || toStr(r.user?.name) || toStr(r.customer?.name);
    const phone = toStr(r.phone) || toStr(r.mobile) || toStr(r.contact) || toStr(r.user?.phone) || toStr(r.user?.mobile) || toStr(r.customer?.phone);
    const email = toStr(r.email) || toStr(r.user?.email) || toStr(r.customer?.email) || toStr(r.farmerId?.email);
    if (name && phone) return `${name} (${phone})`;
    if (name) return name;
    if (phone) return phone;
    if (email) return email;
    return '-';
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Sell Requests</h2>
      {error && <div style={{ color:'tomato', marginBottom:8 }}>{error}</div>}
      {info && <div className="alert success" style={{ marginBottom:8 }}>{info}</div>}

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12, flexWrap:'wrap' }}>
        <label>Status</label>
        <select value={filters.status} onChange={e=>setFilters(s=>({ ...s, status:e.target.value }))}>
          <option value="">All</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => load(true)} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button onClick={() => navigate('/manager/live-locations')} style={{ marginLeft: 8 }}>
          Live Staff Map
        </button>
        <button onClick={()=>{ setShowHistory(true); loadHistory(); }} style={{ marginLeft: 8 }}>
          History
        </button>

        <div style={{ display:'flex', gap:6, alignItems:'center', marginLeft: 'auto' }}>
          <span style={{ color:'#64748b', fontSize:12 }}>View:</span>
          {[
            {key:'ALL', label:'All'},
            {key:'BARRELS', label:'Barrels'},
            {key:'EMPTY', label:'Empty Barrels'},
            {key:'PRODUCTION', label:'Production'}
          ].map(seg => (
            <button
              key={seg.key}
              onClick={() => setTypeSeg(seg.key)}
              style={{
                padding:'6px 10px',
                borderRadius:6,
                border: '1px solid ' + (typeSeg===seg.key ? '#2563eb' : '#e2e8f0'),
                background: typeSeg===seg.key ? '#eff6ff' : 'white',
                color: typeSeg===seg.key ? '#2563eb' : '#334155',
                fontSize:12
              }}
            >
              {seg.label}
            </button>
          ))}
        </div>

      {showHistory && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div style={{ background:'#fff', width:'min(980px, 96%)', maxHeight:'84vh', borderRadius:8, overflow:'hidden', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:12, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontWeight:600 }}>Sell Requests History</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={loadHistory} disabled={historyLoading}>{historyLoading ? 'Loading...' : 'Refresh'}</button>
                <button onClick={()=> setShowHistory(false)}>Close</button>
              </div>
            </div>
            <div style={{ padding:12, overflow:'auto' }}>
              <table className="dashboard-table" style={{ minWidth: 720 }}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Delivery Staff</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map(r => (
                    <tr key={r.id}>
                      <td>{r.user}</td>
                      <td>{r.staff}</td>
                      <td>{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                  {historyRows.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign:'center', color:'#6b7280' }}>{historyLoading ? 'Loading...' : 'No history found'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      </div>

      <div style={{ overflowX:'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 700, tableLayout:'fixed', width:'100%' }}>
          <thead>
            <tr>
              <th style={{ width:'28%' }}>User</th>
              <th style={{ width:'10%' }}>Type</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Barrels</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r._id}>
                <td style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{displayFarmer(r)}</td>
                <td style={{ whiteSpace:'nowrap' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: r._type === 'LATEX' ? '#e3f2fd' : 
                                   r._type === 'BARREL' ? '#f3e5f5' :
                                   r._type === 'SELL_BARRELS' ? '#e8f5e8' :
                                   r._type === 'CHEMICAL' ? '#fff3e0' : '#e8f5e8',
                    color: r._type === 'LATEX' ? '#1976d2' :
                           r._type === 'BARREL' ? '#7b1fa2' :
                           r._type === 'SELL_BARRELS' ? '#388e3c' :
                           r._type === 'CHEMICAL' ? '#f57c00' : '#388e3c'
                  }}>
                    {r._type}
                  </span>
                </td>
                <td>{r.status}</td>
                <td>{safeDate(r._createdAt || r.requestedAt || r.createdAt)}</td>
                <td>
                  {r._type === 'SELL_BARRELS' ? (
                    <span>BC: {r.barrelCount ?? '-'}</span>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {r._type === 'SELL' && (
                      <>
                        <button onClick={() => openAssignDelivery(r._id)}>Assign Delivery</button>
                        <button disabled={verifyingId===r._id} onClick={() => verify(r._id)}>{verifyingId===r._id? 'Verifying...' : 'Mark Verified'}</button>
                      </>
                    )}
                    {r._type === 'SELL_BARRELS' && (
                      <>
                        <span style={{ alignSelf:'center', color:'#2563eb' }}>CB: {r.companyBarrel || '-'}</span>
                        <button 
                          disabled={approvingId===r._id || approvedRequests.has(r._id)} 
                          onClick={() => approve(r._id)}
                          style={{
                            backgroundColor: approvedRequests.has(r._id) ? '#ccc' : '#4CAF50',
                            color: approvedRequests.has(r._id) ? '#666' : 'white',
                            cursor: approvedRequests.has(r._id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {approvedRequests.has(r._id) ? 'Approved ✅' : (approvingId===r._id ? 'Approving...' : 'Approve')}
                        </button>
                        <button 
                          disabled={assignedRequests.has(r._id)}
                          onClick={() => openAssignDelivery(r._id)}
                          style={{
                            backgroundColor: assignedRequests.has(r._id) ? '#ccc' : '#4CAF50',
                            color: assignedRequests.has(r._id) ? '#666' : 'white',
                            cursor: assignedRequests.has(r._id) ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {assignedRequests.has(r._id) ? 'Assigned 🚚' : 'Assign Delivery'}
                        </button>
                      </>
                    )}
                    {r._type !== 'SELL' && r._type !== 'SELL_BARRELS' && (
                      <button onClick={() => alert(`View ${r._type} request details`)}>View Details</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign:'center', color:'#6b7280' }}>No user requests found. Use Refresh. If issue persists, check API route permissions.</td></tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Simple Delivery Staff Selection Modal */}
      {showAssignModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '300px',
            maxWidth: '500px'
          }}>
            <h3>Assign Delivery Staff</h3>
            <p>Select a delivery staff member:</p>
            
            <div style={{ marginBottom: '15px' }}>
              <select 
                value={selectedStaff} 
                onChange={(e) => setSelectedStaff(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">Choose delivery staff...</option>
                {staffLoading && <option value="" disabled>Loading...</option>}
                {!staffLoading && staffList.map(s => (
                  <option key={s._id} value={s._id}>{s.name || s.email}</option>
                ))}
                {!staffLoading && !staffList.length && <option value="" disabled>No delivery staff found</option>}
              </select>
              {staffError && (
                <div style={{ color: 'tomato', marginTop: 6 }}>{staffError}</div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedStaff('');
                  setAssignDeliveryId(null);
                }}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAssignDelivery}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerSellRequests;
