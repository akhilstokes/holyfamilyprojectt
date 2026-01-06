import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { listAttendance } from '../../services/adminService';

const iso = (d) => new Date(d).toISOString().slice(0, 10);

const LiveCheckins = () => {
  const today = useMemo(() => iso(new Date()), []);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, on-time, late
  const [viewMode, setViewMode] = useState('table'); // table, grid
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0); // For live duration updates



  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await listAttendance({ from: today, to: today, limit: 500 });
      const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data) ? data : []);
      const live = list.filter((r) => r.checkInAt && !r.checkOutAt);
      setRows(live);
    } catch (e) {
      setError(e?.message || 'Failed to load');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [today]);


  // Auto-refresh every 30 seconds
  useEffect(() => {
    load();
    if (autoRefresh) {
      const interval = setInterval(load, 30000);
      return () => clearInterval(interval);
    }
  }, [load, autoRefresh]);

  // Update duration every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter and search logic
  const filteredRows = useMemo(() => {
    let filtered = [...rows];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        (r.staffName || '').toLowerCase().includes(query) ||
        (r.staff || '').toLowerCase().includes(query) ||
        (r.role || '').toLowerCase().includes(query) ||
        (r.department || '').toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterStatus === 'on-time') {
      filtered = filtered.filter(r => !r.isLate);
    } else if (filterStatus === 'late') {
      filtered = filtered.filter(r => r.isLate);
    }
    
    return filtered;
  }, [rows, searchQuery, filterStatus]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = rows.length;
    const onTime = rows.filter(r => !r.isLate).length;
    const late = rows.filter(r => r.isLate).length;
    const avgDuration = rows.length > 0
      ? rows.reduce((sum, r) => {
              const checkInAt = r.checkInAt ? new Date(r.checkInAt) : null;
          return sum + (checkInAt ? (Date.now() - checkInAt.getTime()) : 0);
        }, 0) / rows.length
      : 0;
    
    return { total, onTime, late, avgDuration };
  }, [rows, tick]); // Include tick for live updates

  // Duration formatter
  const formatDuration = (ms) => {

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Live Check-ins</h2>
        <button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color: 'tomato', marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 640 }}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Staff ID</th>
              <th>Check In</th>
              <th>Late</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const checkInAt = r.checkInAt ? new Date(r.checkInAt) : null;
              const duration = checkInAt ? (Date.now() - checkInAt.getTime()) : 0;
              const fmt = (ms) => {

                const total = Math.floor(ms / 1000);
                const h = String(Math.floor(total / 3600)).padStart(2, '0');
                const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
                const s = String(total % 60).padStart(2, '0');
                return `${h}:${m}:${s}`;
              };


  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    const roleColors = {
      'manager': '#8b5cf6',
      'delivery_staff': '#3b82f6',
      'lab': '#10b981',
      'accountant': '#f59e0b',
      'admin': '#ef4444',
      'field_staff': '#06b6d4',
      'staff': '#6b7280'
    };
    return roleColors[role] || '#6b7280';
  };

              return (
    <div style={{ padding: 16, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, color: '#1e293b' }}>
            🔴 Live Check-ins
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
            Real-time staff attendance monitoring • Updates every 30 seconds
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#475569' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto-refresh
          </label>
          <button 
            className="btn" 
            onClick={load} 
            disabled={loading}
            style={{ background: '#10b981', borderColor: '#10b981', minWidth: 100 }}
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          border: '1px solid #ef4444', 
          color: '#dc2626', 
          padding: 12, 
          borderRadius: 8,
          marginBottom: 16 
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16,
        marginBottom: 24 
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>👥 Currently Active</div>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.total}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Staff checked in</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>✅ On Time</div>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.onTime}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {stats.total > 0 ? Math.round((stats.onTime / stats.total) * 100) : 0}% punctuality
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>⏰ Late Arrivals</div>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>{stats.late}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% late today
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: 20,
          borderRadius: 12,
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>⏱️ Avg Duration</div>
          <div style={{ fontSize: 36, fontWeight: 'bold' }}>
            {stats.avgDuration > 0 ? formatDuration(stats.avgDuration).split(':')[0] : '0'}h
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {formatDuration(stats.avgDuration)} average
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div style={{
        background: 'white',
        padding: 16,
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search staff by name, ID, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: 250,
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14
          }}
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          <option value="all">📋 All ({rows.length})</option>
          <option value="on-time">✅ On Time ({stats.onTime})</option>
          <option value="late">⏰ Late ({stats.late})</option>
        </select>

        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: 4 }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              background: viewMode === 'table' ? 'white' : 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: viewMode === 'table' ? 'bold' : 'normal'
            }}
          >
            📊 Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              background: viewMode === 'grid' ? 'white' : 'transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: viewMode === 'grid' ? 'bold' : 'normal'
            }}
          >
            🎴 Cards
          </button>
        </div>

        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: 13 }}>
          Showing {filteredRows.length} of {rows.length}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        // Table View
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ minWidth: 800, margin: 0 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '14px 16px' }}>Staff</th>
                  <th style={{ padding: '14px 16px' }}>Staff ID</th>
                  <th style={{ padding: '14px 16px' }}>Role</th>
                  <th style={{ padding: '14px 16px' }}>Check In</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                  <th style={{ padding: '14px 16px' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => {
                  const checkInAt = r.checkInAt ? new Date(r.checkInAt) : null;
                  const duration = checkInAt ? (Date.now() - checkInAt.getTime()) : 0;
                  const roleColor = getRoleBadgeColor(r.role);
                  
                  return (
                    <tr key={`${r.staff}-${r.date}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            fontSize: 14
                          }}>
                            {getInitials(r.staffName)}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{r.staffName || '-'}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{r.department || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>{r.staff || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: roleColor,
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: '500'
                        }}>
                          {r.role || 'Staff'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        {checkInAt ? checkInAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {r.isLate ? (
                          <span style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: '500'
                          }}>
                            ⏰ Late
                          </span>
                        ) : (
                          <span style={{
                            background: '#d1fae5',
                            color: '#059669',
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: '500'
                          }}>
                            ✅ On Time
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: '#eff6ff',
                          color: '#2563eb',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: '600',
                          fontFamily: 'monospace'
                        }}>
                          {checkInAt ? formatDuration(duration) : '-'}
                        </span>
                      </td>
                </tr>
              );
            })}
                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 48, textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>
                        {searchQuery || filterStatus !== 'all' ? '🔍' : '😴'}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: '#64748b', marginBottom: 4 }}>
                        {searchQuery || filterStatus !== 'all' 
                          ? 'No matching staff found' 
                          : 'No one is currently checked in'}
                      </div>
                      <div style={{ fontSize: 14, color: '#94a3b8' }}>
                        {searchQuery || filterStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Staff will appear here when they check in'}
                      </div>
                    </td>
                  </tr>

              return (
                <tr key={`${r.staff}-${r.date}`}>
                  <td>{r.staffName || '-'}</td>
                  <td>{r.staff || '-'}</td>
                  <td>{checkInAt ? checkInAt.toLocaleTimeString() : '-'}</td>
                  <td>{r.isLate ? 'Yes' : 'No'}</td>
                  <td>{checkInAt ? fmt(duration) : '-'}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9aa'}}>
                No one is currently checked in.
              </td></tr>

            )}
          </tbody>
        </table>
      </div>

        </div>
      ) : (
        // Grid/Card View
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: 16 
        }}>
          {filteredRows.map((r) => {
            const checkInAt = r.checkInAt ? new Date(r.checkInAt) : null;
            const duration = checkInAt ? (Date.now() - checkInAt.getTime()) : 0;
            const roleColor = getRoleBadgeColor(r.role);
            
            return (
              <div
                key={`${r.staff}-${r.date}`}
                style={{
                  background: 'white',
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: r.isLate ? '2px solid #fecaca' : '2px solid #d1fae5',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 20
                  }}>
                    {getInitials(r.staffName)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 16, color: '#1e293b', marginBottom: 2 }}>
                      {r.staffName || 'Unknown'}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>ID: {r.staff || '-'}</div>
                  </div>
                  {r.isLate ? (
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#ef4444',
                      animation: 'pulse 2s infinite'
                    }} />
                  ) : (
                    <div style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: '#10b981'
                    }} />
                  )}
                </div>

                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Role</span>
                    <span style={{
                      background: roleColor,
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: '600'
                    }}>
                      {r.role || 'Staff'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Check In</span>
                    <span style={{ fontSize: 13, fontWeight: '600', color: '#1e293b' }}>
                      {checkInAt ? checkInAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Status</span>
                    <span style={{
                      background: r.isLate ? '#fee2e2' : '#d1fae5',
                      color: r.isLate ? '#dc2626' : '#059669',
                      padding: '3px 8px',
                      borderRadius: 10,
                      fontSize: 11,
                      fontWeight: '600'
                    }}>
                      {r.isLate ? '⏰ Late' : '✅ On Time'}
                    </span>
                  </div>

                  <div style={{
                    marginTop: 8,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: 8,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Duration</div>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: '#2563eb',
                      fontFamily: 'monospace'
                    }}>
                      {checkInAt ? formatDuration(duration) : '--:--:--'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && filteredRows.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: 48,
              textAlign: 'center',
              background: 'white',
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>
                {searchQuery || filterStatus !== 'all' ? '🔍' : '😴'}
              </div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#64748b', marginBottom: 8 }}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'No matching staff found' 
                  : 'No one is currently checked in'}
              </div>
              <div style={{ fontSize: 14, color: '#94a3b8' }}>
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Staff will appear here when they check in'}
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default LiveCheckins;
