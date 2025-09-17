import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const authHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

function UrgencyRow({ item }) {
  const daysLeft = item.expiryDate ? Math.ceil((new Date(item.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  let cls = 'green-row';
  if (daysLeft != null) {
    if (daysLeft < 7) cls = 'red-row';
    else if (daysLeft <= 30) cls = 'yellow-row';
  }
  return (
    <tr className={cls}>
      <td>{item.barrelId}</td>
      <td>{item.materialName || '-'}</td>
      <td>{item.lastKnownLocation || '-'}</td>
      <td>{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
    </tr>
  );
}

const StaffOperationsDashboard = () => {
  const navigate = useNavigate();
  const [nextBarrel, setNextBarrel] = useState(null);
  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState({ latexLiters: 0, rubberBandUnits: 0 });
  const [capacity, setCapacity] = useState(null);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [filters, setFilters] = useState({ q: '', location: 'all', material: 'all', sort: 'expiryDate-asc' });
  const [barrelModal, setBarrelModal] = useState(false);
  const [tripModal, setTripModal] = useState(false);
  const [barrelForm, setBarrelForm] = useState({ farmerUserId: '', weightKg: '', ratePerKg: '', moisturePct: '', barrelId: '', photoUrl: '', gps: { lat: '', lng: '' } });
  const [tripForm, setTripForm] = useState({ vehicleId: '', odometerStart: '', odometerEnd: '', date: '' });
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState({ route: null, barrels: [], trips: [] });
  const [profile, setProfile] = useState({ name: '', email: '', phoneNumber: '', location: '' });
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadMain = async () => {
    try {
      const [nextRes, queueRes, summaryRes, capacityRes] = await Promise.all([
        axios.get('/api/barrels/fefo/next', authHeaders()),
        axios.get('/api/barrels/fefo/queue', authHeaders()),
        axios.get('/api/stock/summary', authHeaders()),
        axios.get('/api/capacity', authHeaders()),
      ]);
      setNextBarrel(nextRes.data || null);
      setQueue(Array.isArray(queueRes.data) ? queueRes.data : []);
      setSummary(summaryRes.data || { latexLiters: 0, rubberBandUnits: 0 });
      setCapacity(capacityRes.data || null);
    } catch (e) {
      // noop basic error handling
    }
  };

  useEffect(() => { loadMain(); }, []);
  useEffect(() => {
    const fetchToday = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${base}/api/workers/field/today`, authHeaders());
        setToday(data);
      } catch {}
    };
    const fetchProfile = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${base}/api/users/profile`, authHeaders());
        setProfile({ name: res.data.name, email: res.data.email, phoneNumber: res.data.phoneNumber || '', location: res.data.location || '' });
      } catch {}
      finally { setLoadingProfile(false); }
    };
    fetchToday();
    fetchProfile();
  }, []);

  const markInUse = async () => {
    if (!nextBarrel?._id) return;
    try {
      await axios.post(`/api/barrels/${nextBarrel._id}/mark-in-use`, {}, authHeaders());
      await loadMain();
    } catch {}
  };

  const startRoute = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${base}/api/workers/field/route/start`, {}, authHeaders());
      setToday({ ...today, route: data });
    } catch {}
  };

  const completeRoute = async () => {
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${base}/api/workers/field/route/complete`, {}, authHeaders());
      setToday({ ...today, route: data });
    } catch {}
  };

  const dryerUsage = useMemo(() => {
    const used = capacity?.dryer?.usedKg || 0;
    const total = capacity?.dryer?.totalKg || 0;
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return { used, total, pct };
  }, [capacity]);

  const godownUsage = useMemo(() => {
    const used = capacity?.godown?.usedPallets || 0;
    const total = capacity?.godown?.totalPallets || 0;
    const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return { used, total, pct };
  }, [capacity]);

  const latexThresholdLow = 1000; // adjustable threshold
  const rubberThresholdLow = 10000; // adjustable threshold
  const latexAlert = summary.latexLiters < latexThresholdLow;
  const rubberAlert = summary.rubberBandUnits < rubberThresholdLow;

  // Inventory modal helpers
  const openInventory = async () => {
    try {
      const { data } = await axios.get('/api/barrels', authHeaders());
      setInventory(Array.isArray(data) ? data : []);
      setInventoryOpen(true);
    } catch {}
  };

  const submitBarrel = async (e) => {
    e?.preventDefault();
    if (!barrelForm.farmerUserId || !barrelForm.weightKg || !barrelForm.ratePerKg) return;
    try {
      setSaving(true);
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${base}/api/workers/field/barrels`, {
        farmerUserId: barrelForm.farmerUserId,
        weightKg: Number(barrelForm.weightKg),
        ratePerKg: Number(barrelForm.ratePerKg),
        moisturePct: Number(barrelForm.moisturePct || 0),
        barrelId: barrelForm.barrelId || '',
        photoUrl: barrelForm.photoUrl || '',
        gps: (barrelForm.gps.lat && barrelForm.gps.lng) ? { lat: Number(barrelForm.gps.lat), lng: Number(barrelForm.gps.lng) } : undefined
      }, authHeaders());
      setBarrelModal(false);
      setBarrelForm({ farmerUserId: '', weightKg: '', ratePerKg: '', moisturePct: '', barrelId: '', photoUrl: '', gps: { lat: '', lng: '' } });
    } catch {}
    finally { setSaving(false); }
  };

  const submitTrip = async (e) => {
    e?.preventDefault();
    if (tripForm.odometerStart === '' || tripForm.odometerEnd === '') return;
    try {
      setSaving(true);
      const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      await axios.post(`${base}/api/workers/field/trips`, {
        vehicleId: tripForm.vehicleId || '',
        odometerStart: Number(tripForm.odometerStart),
        odometerEnd: Number(tripForm.odometerEnd),
        date: tripForm.date || undefined
      }, authHeaders());
      setTripModal(false);
      setTripForm({ vehicleId: '', odometerStart: '', odometerEnd: '', date: '' });
    } catch {}
    finally { setSaving(false); }
  };

  const filteredInventory = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    let list = inventory.filter((b) => {
      const matchesQ = !q ||
        b.barrelId?.toLowerCase().includes(q) ||
        b.materialName?.toLowerCase().includes(q) ||
        b.batchNo?.toLowerCase().includes(q);
      const matchesLoc = filters.location === 'all' || (b.lastKnownLocation || '') === filters.location;
      const matchesMat = filters.material === 'all' || (b.materialName || '') === filters.material;
      return matchesQ && matchesLoc && matchesMat;
    });
    const [field, dir] = filters.sort.split('-');
    list.sort((a, b) => {
      const va = a[field] ? new Date(a[field]).getTime() : 0;
      const vb = b[field] ? new Date(b[field]).getTime() : 0;
      return dir === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [inventory, filters]);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(inventory.map(b => b.lastKnownLocation).filter(Boolean)));
  }, [inventory]);

  const uniqueMaterials = useMemo(() => {
    return Array.from(new Set(inventory.map(b => b.materialName).filter(Boolean)));
  }, [inventory]);

  const daysLeft = nextBarrel?.expiryDate ? Math.ceil((new Date(nextBarrel.expiryDate) - Date.now()) / (1000*60*60*24)) : null;

  return (
    <div className="container" style={{ padding: 16 }}>
      <h2 className="page-title">Staff Operations Dashboard</h2>

      <div className="row">
        <div className="col-lg-8 col-md-7">
          {/* Profile Card */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>My Profile</h4>
                {loadingProfile ? (
                  <div>Loading...</div>
                ) : (
                  <div style={{ fontSize: 14, marginTop: 6 }}>
                    <div><strong>Name:</strong> {profile.name}</div>
                    <div><strong>Email:</strong> {profile.email}</div>
                    <div><strong>Phone:</strong> {profile.phoneNumber || '-'}</div>
                    <div><strong>Location:</strong> {profile.location || '-'}</div>
                  </div>
                )}
              </div>
              <div>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/staff/profile')} style={{ marginRight: 8 }}>View Profile</button>
                <button className="btn btn-primary" onClick={() => navigate('/staff/profile')}>Edit Profile</button>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-body">
              <h4 style={{ marginBottom: 12 }}>What To Do Next</h4>
              <div className="alert alert-primary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>USE NEXT</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>
                    {nextBarrel ? (nextBarrel.barrelId || '-') : 'No eligible barrel'}
                  </div>
                  {nextBarrel && (
                    <div style={{ marginTop: 6 }}>
                      <div>Material: {nextBarrel.materialName || '-'}</div>
                      <div>Location: {nextBarrel.lastKnownLocation || '-'}</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>Expires In: {daysLeft != null ? `${daysLeft} Days` : '-'}</div>
                    </div>
                  )}
                </div>
                <div>
                  <button className="btn btn-success" disabled={!nextBarrel?._id} onClick={markInUse}>Mark as In-Use</button>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <h5>Upcoming Expiry Queue</h5>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Barrel ID</th>
                        <th>Material</th>
                        <th>Location</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((item) => <UrgencyRow key={item._id || item.barrelId} item={item} />)}
                      {queue.length === 0 && (
                        <tr><td colSpan={4} style={{ textAlign: 'center' }}>No items</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-5">
          <div className={`card ${latexAlert ? 'border-danger' : ''}`} style={{ marginBottom: 12 }}>
            <div className="card-body">
              <div style={{ fontWeight: 600 }}>Latex Stock</div>
              <div style={{ fontSize: 22 }}>{summary.latexLiters?.toLocaleString()} kg</div>
              {latexAlert && <div className="text-danger" style={{ fontSize: 12 }}>Low stock</div>}
            </div>
          </div>
          <div className={`card ${rubberAlert ? 'border-danger' : ''}`} style={{ marginBottom: 16 }}>
            <div className="card-body">
              <div style={{ fontWeight: 600 }}>Rubber Band Stock</div>
              <div style={{ fontSize: 22 }}>{summary.rubberBandUnits?.toLocaleString()} units</div>
              {rubberAlert && <div className="text-danger" style={{ fontSize: 12 }}>Low stock</div>}
            </div>
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Dryer Capacity</div>
              <div className="progress" style={{ height: 12 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${dryerUsage.pct}%` }} aria-valuenow={dryerUsage.pct} aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{dryerUsage.pct}% Full - {dryerUsage.used}/{dryerUsage.total} kg</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Godown Capacity</div>
              <div className="progress" style={{ height: 12 }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${godownUsage.pct}%` }} aria-valuenow={godownUsage.pct} aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <div style={{ fontSize: 12, marginTop: 6 }}>{godownUsage.pct}% Full - {godownUsage.used}/{godownUsage.total} Pallets</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn btn-outline-primary" onClick={openInventory} style={{ marginRight: 8 }}>View Full Inventory</button>
        <button className="btn btn-success" onClick={() => setBarrelModal(true)} style={{ marginRight: 8 }}>Add Barrel</button>
        <button className="btn btn-secondary" onClick={() => setTripModal(true)}>Log Trip KM</button>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-body">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h5 style={{ margin: 0 }}>Today Timeline</h5>
            <div>
              {!today.route || today.route.status !== 'in_progress' ? (
                <button className="btn btn-primary" onClick={startRoute} style={{ marginRight: 8 }}>Start Route</button>
              ) : (
                <button className="btn btn-outline-primary" disabled>Route In Progress</button>
              )}
              {today.route && today.route.status !== 'completed' && (
                <button className="btn btn-success" onClick={completeRoute} style={{ marginLeft: 8 }}>Complete Route</button>
              )}
            </div>
          </div>

          <div className="row" style={{ marginTop: 12 }}>
            <div className="col-md-6">
              <h6>Barrel Entries</h6>
              <ul className="list-group">
                {today.barrels.map((b) => (
                  <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{new Date(b.dateTime).toLocaleTimeString()} • {b.weightKg} kg × {b.ratePerKg} = {b.amount}</span>
                    <span className="badge badge-light">{b.barrelId || '-'}</span>
                  </li>
                ))}
                {today.barrels.length === 0 && <li className="list-group-item">No entries</li>}
              </ul>
            </div>
            <div className="col-md-6">
              <h6>Trip Logs</h6>
              <ul className="list-group">
                {today.trips.map((t) => (
                  <li key={t._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <span>{new Date(t.date).toLocaleTimeString()} • {t.km} km</span>
                    <span className="badge badge-light">{t.vehicleId || '-'}</span>
                  </li>
                ))}
                {today.trips.length === 0 && <li className="list-group-item">No trips</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {inventoryOpen && (
        <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setInventoryOpen(false)}>
          <div className="modal-dialog modal-xl" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Warehouse Raw Material Details</h5>
                <button type="button" className="close" onClick={() => setInventoryOpen(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="row" style={{ marginBottom: 12 }}>
                  <div className="col-md-4">
                    <input className="form-control" placeholder="Search" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <select className="form-control" value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
                      <option value="all">All Locations</option>
                      {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select className="form-control" value={filters.material} onChange={(e) => setFilters({ ...filters, material: e.target.value })}>
                      <option value="all">All Materials</option>
                      {uniqueMaterials.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <select className="form-control" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
                      <option value="expiryDate-asc">Expiry Asc</option>
                      <option value="expiryDate-desc">Expiry Desc</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-striped table-sm">
                    <thead>
                      <tr>
                        <th>Material ID</th>
                        <th>Batch No.</th>
                        <th>Material Name</th>
                        <th>Location</th>
                        <th>Quantity</th>
                        <th>Unit</th>
                        <th>Manufacture Date</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((b) => (
                        <tr key={b._id}>
                          <td>{b.barrelId}</td>
                          <td>{b.batchNo || '-'}</td>
                          <td>{b.materialName || '-'}</td>
                          <td>{b.lastKnownLocation || '-'}</td>
                          <td>{b.currentVolume ?? 0}</td>
                          <td>{b.unit || 'L'}</td>
                          <td>{b.manufactureDate ? new Date(b.manufactureDate).toLocaleDateString() : '-'}</td>
                          <td>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : '-'}</td>
                          <td>{b.status}</td>
                        </tr>
                      ))}
                      {filteredInventory.length === 0 && (
                        <tr><td colSpan={9} style={{ textAlign: 'center' }}>No results</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setInventoryOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {barrelModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setBarrelModal(false)}>
          <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Barrel Entry</h5>
                <button type="button" className="close" onClick={() => setBarrelModal(false)}><span>&times;</span></button>
              </div>
              <form onSubmit={submitBarrel}>
                <div className="modal-body">
                  <input className="form-control" placeholder="Farmer User ID" value={barrelForm.farmerUserId} onChange={(e)=>setBarrelForm({...barrelForm, farmerUserId:e.target.value})} style={{ marginBottom: 8 }} />
                  <div className="row">
                    <div className="col-6"><input className="form-control" type="number" step="0.01" placeholder="Weight (kg)" value={barrelForm.weightKg} onChange={(e)=>setBarrelForm({...barrelForm, weightKg:e.target.value})} /></div>
                    <div className="col-6"><input className="form-control" type="number" step="0.01" placeholder="Rate (per kg)" value={barrelForm.ratePerKg} onChange={(e)=>setBarrelForm({...barrelForm, ratePerKg:e.target.value})} /></div>
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <div className="col-6"><input className="form-control" type="number" step="0.01" placeholder="Moisture % (optional)" value={barrelForm.moisturePct} onChange={(e)=>setBarrelForm({...barrelForm, moisturePct:e.target.value})} /></div>
                    <div className="col-6"><input className="form-control" placeholder="Barrel ID (optional)" value={barrelForm.barrelId} onChange={(e)=>setBarrelForm({...barrelForm, barrelId:e.target.value})} /></div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 12, opacity: 0.8 }}>Photo (optional)</label>
                    <input className="form-control" type="file" accept="image/*" onChange={async (e)=>{
                      const file = e.target.files && e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setBarrelForm({ ...barrelForm, photoUrl: String(reader.result) });
                      reader.readAsDataURL(file);
                    }} />
                    {barrelForm.photoUrl && (<div style={{ marginTop: 6 }}><img src={barrelForm.photoUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 6 }} /></div>)}
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <div className="col-5"><input className="form-control" placeholder="GPS Lat (optional)" value={barrelForm.gps.lat} onChange={(e)=>setBarrelForm({...barrelForm, gps:{...barrelForm.gps, lat:e.target.value}})} /></div>
                    <div className="col-5"><input className="form-control" placeholder="GPS Lng (optional)" value={barrelForm.gps.lng} onChange={(e)=>setBarrelForm({...barrelForm, gps:{...barrelForm.gps, lng:e.target.value}})} /></div>
                    <div className="col-2"><button type="button" className="btn btn-outline-secondary btn-block" onClick={()=>{
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition((pos)=>{
                        setBarrelForm({ ...barrelForm, gps: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
                      });
                    }}>Use GPS</button></div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button" onClick={()=>setBarrelModal(false)}>Cancel</button>
                  <button className="btn btn-success" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {tripModal && (
        <div className="modal d-block" tabIndex="-1" role="dialog" onClick={() => setTripModal(false)}>
          <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Log Trip KM</h5>
                <button type="button" className="close" onClick={() => setTripModal(false)}><span>&times;</span></button>
              </div>
              <form onSubmit={submitTrip}>
                <div className="modal-body">
                  <input className="form-control" placeholder="Vehicle (optional)" value={tripForm.vehicleId} onChange={(e)=>setTripForm({...tripForm, vehicleId:e.target.value})} style={{ marginBottom: 8 }} />
                  <div className="row">
                    <div className="col-6"><input className="form-control" type="number" step="0.1" placeholder="Odometer Start" value={tripForm.odometerStart} onChange={(e)=>setTripForm({...tripForm, odometerStart:e.target.value})} /></div>
                    <div className="col-6"><input className="form-control" type="number" step="0.1" placeholder="Odometer End" value={tripForm.odometerEnd} onChange={(e)=>setTripForm({...tripForm, odometerEnd:e.target.value})} /></div>
                  </div>
                  <input className="form-control" type="date" value={tripForm.date} onChange={(e)=>setTripForm({...tripForm, date:e.target.value})} style={{ marginTop: 8 }} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" type="button" onClick={()=>setTripModal(false)}>Cancel</button>
                  <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffOperationsDashboard;






