import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    attendance: {
      today: { present: 0, absent: 0, late: 0, unverified: 0 },
      week: { present: 0, absences: 0 },
      stats: { totalRecords: 0, verifiedRecords: 0, unverifiedRecords: 0 }
    },
    bills: {
      pending: 0,
      totalAmount: 0,
      byCategory: []
    },
    rates: {
      pending: 0,
      latest: []
    },
    stock: {
      summary: null,
      alerts: []
    }
  });

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Load attendance data
      const [attendanceRes, attendanceStatsRes, billsRes, ratesRes, stockRes] = await Promise.all([
        axios.get(`${base}/api/workers/attendance/summary/today`, config),
        axios.get(`${base}/api/workers/attendance/stats`, config),
        axios.get(`${base}/api/bills/manager/pending`, config),
        axios.get(`${base}/api/daily-rates/admin/pending`, config),
        axios.get(`${base}/api/stock/summary`, config)
      ]);

      setDashboardData({
        attendance: {
          today: attendanceRes.data || { present: 0, absent: 0, late: 0 },
          week: { present: 0, absences: 0 }, // Will be loaded separately
          stats: attendanceStatsRes.data || { totalRecords: 0, verifiedRecords: 0, unverifiedRecords: 0 }
        },
        bills: {
          pending: billsRes.data?.total || 0,
          totalAmount: billsRes.data?.bills?.reduce((sum, bill) => sum + bill.requestedAmount, 0) || 0,
          byCategory: billsRes.data?.stats || []
        },
        rates: {
          pending: ratesRes.data?.total || 0,
          latest: ratesRes.data?.rates || []
        },
        stock: {
          summary: stockRes.data || null,
          alerts: [] // Will be implemented based on stock thresholds
        }
      });
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <h2>Manager Dashboard</h2>
        <div>Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Manager Dashboard</h2>
        <button onClick={loadDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'tomato', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 16, 
        marginBottom: 32 
      }}>
        {/* Attendance Card */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, color: '#2563eb' }}>Today's Attendance</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                {dashboardData.attendance.today.present}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Present</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
                {dashboardData.attendance.today.absent}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Absent</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>
                {dashboardData.attendance.today.late}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Late</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7c3aed' }}>
                {dashboardData.attendance.stats.unverifiedRecords}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Unverified</div>
            </div>
          </div>
        </div>

        {/* Bill Requests Card */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, color: '#2563eb' }}>Pending Bill Requests</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
                {dashboardData.bills.pending}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Requests</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                ₹{dashboardData.bills.totalAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Total Amount</div>
            </div>
          </div>
          {dashboardData.bills.byCategory.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>By Category:</div>
              {dashboardData.bills.byCategory.map((cat, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{cat._id}:</span>
                  <span>{cat.count} (₹{cat.totalAmount.toLocaleString()})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rate Updates Card */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, color: '#2563eb' }}>Rate Updates</h4>
          <div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626' }}>
              {dashboardData.rates.pending}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Pending Admin Approval</div>
          </div>
          {dashboardData.rates.latest.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Recent Submissions:</div>
              {dashboardData.rates.latest.slice(0, 3).map((rate, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{rate.category}:</span>
                  <span>₹{rate.inr} / ${rate.usd}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Overview Card */}
        <div className="dash-card">
          <h4 style={{ marginTop: 0, color: '#2563eb' }}>Stock Overview</h4>
          {dashboardData.stock.summary ? (
            <div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>
                {dashboardData.stock.summary.rubberBandUnits || 0}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Rubber Band Units</div>
              {dashboardData.stock.summary.latexLiters !== undefined && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 'bold', color: '#2563eb' }}>
                    {dashboardData.stock.summary.latexLiters}L
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Latex Stock</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#6b7280' }}>No stock data available</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 32 
      }}>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/attendance'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Verify Attendance</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>GPS-based verification</div>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/bills'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Review Bills</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{dashboardData.bills.pending} pending</div>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/rates'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Update Rates</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Submit for admin approval</div>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/shifts'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Manage Shifts</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Create schedules</div>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/stock'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Monitor Stock</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>View-only access</div>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => window.location.href = '/manager/reports'}
          style={{ padding: 16, textAlign: 'center' }}
        >
          <div style={{ fontSize: 18, fontWeight: 'bold' }}>Generate Reports</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>For admin review</div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="dash-card">
        <h4 style={{ marginTop: 0 }}>Quick Actions</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.href = '/manager/attendance/verification'}
          >
            Verify GPS Records
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.href = '/manager/leaves'}
          >
            Review Leave Requests
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.href = '/manager/rates/submit'}
          >
            Submit Rate Update
          </button>
          <button 
            className="btn btn-outline" 
            onClick={() => window.location.href = '/manager/reports/attendance'}
          >
            Attendance Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
