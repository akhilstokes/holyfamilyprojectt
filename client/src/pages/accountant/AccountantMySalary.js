import React, { useState, useEffect } from 'react';
import { formatDateTime } from '../../utils/dateUtils';
import SalaryNotificationBadge from '../../components/common/SalaryNotificationBadge';

const AccountantMySalary = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salaryData, setSalaryData] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState(null);

  // Get user info from token or stored user data
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not logged in. Please login again.');
          return;
        }
        
        // Try to get user info from various sources
        const userId = localStorage.getItem('userId') || localStorage.getItem('user_id');
        const userData = localStorage.getItem('user');
        
        if (userId) {
          setUserInfo({ userId, _id: userId });
          setError('');
          return;
        }
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUserInfo(parsedUser);
          setError('');
          return;
        }
        
        // Try to decode JWT token as fallback
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonPayload);
        setUserInfo(decoded);
        setError('');
      } catch (e) {
        console.error('Error getting user info:', e);
        // Don't set error, just try to continue
        console.log('Continuing without user info...');
      }
    };
    getUserInfo();
  }, []);

  const loadMySalary = async () => {
    // Don't block if user info not available - API will use token
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${base}/api/unified-salary/unified?year=${selectedYear}&month=${selectedMonth}`, { headers });
      if (!res.ok) {
        console.error('Salary API response:', res.status, res.statusText);
        // Don't show error for 404, just return
        return;
      }
      const data = await res.json();
      setSalaryData(data);
    } catch (e) {
      console.error('Error loading salary:', e);
      // Don't show error to user
    } finally {
      setLoading(false);
    }
  };

  const loadSalaryHistory = async () => {
    try {
      // Use the unified salary history endpoint
      const res = await fetch(`${base}/api/unified-salary/unified/history?limit=12`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSalaryHistory(data.history || data.data || []);
      }
    } catch (e) {
      console.error('Error loading salary history:', e);
      // Don't set error, just log it
    }
  };

  const loadSalaryNotifications = async () => {
    try {
      const res = await fetch(`${base}/api/salary-notifications`, { headers });
      if (res.ok) {
        const data = await res.json();
        const notifs = data.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
      }
    } catch (e) {
      console.error('Error loading salary notifications:', e);
    }
  };

  useEffect(() => {
    loadMySalary();
    loadSalaryHistory();
    loadSalaryNotifications();
  }, [selectedYear, selectedMonth]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getMonthName = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month - 1] || '';
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0 }}>My Salary</h2>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>View your monthly salary details and history</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {unreadCount > 0 && userInfo && (
            <SalaryNotificationBadge userId={userInfo.userId || userInfo._id} />
          )}
          <button 
            className="btn" 
            onClick={() => {
              loadMySalary();
              loadSalaryNotifications();
            }} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 16, padding: 12, backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 4 }}>
          {error}
        </div>
      )}

      {/* Salary Notifications from Manager */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: 24, backgroundColor: '#e3f2fd', padding: 16, borderRadius: 8, border: '1px solid #90caf9' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12, color: '#1565c0' }}>
            📬 Salary Notifications from Manager
          </h3>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {notifications.slice(0, 5).map((notification, index) => (
              <div 
                key={notification._id || index}
                style={{
                  padding: 12,
                  marginBottom: 8,
                  backgroundColor: notification.isRead ? '#f5f5f5' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  borderLeft: notification.isRead ? '4px solid #4caf50' : '4px solid #ff9800'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {notification.title || 'Salary Calculated'}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                  {notification.message}
                </div>
                {notification.data && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                    {notification.data.grossSalary && (
                      <div>Gross: ₹{notification.data.grossSalary.toFixed(2)} | Net: ₹{notification.data.netSalary?.toFixed(2)}</div>
                    )}
                  </div>
                )}
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                  {formatDateTime(notification.createdAt)}
                  {!notification.isRead && (
                    <span style={{ marginLeft: 8, color: '#ff9800' }}>● Unread</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {notifications.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#666' }}>
              Showing 5 of {notifications.length} notifications
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Year</label>
          <input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold' }}>Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', minWidth: 150 }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Salary Details */}
      {salaryData && salaryData.salary && (
        <div style={{ backgroundColor: '#f8f9fa', padding: 24, borderRadius: 8, marginBottom: 24, border: '1px solid #dee2e6' }}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>
            Salary for {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          
          {salaryData.salary.paymentDate && (
            <div style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
              Payment Date: {formatDateTime(salaryData.salary.paymentDate)}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Gross Salary</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>
                {formatCurrency(salaryData.salary.grossSalary)}
              </div>
            </div>
            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Deductions</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dc3545' }}>
                {formatCurrency(salaryData.salary.totalDeductions || salaryData.salary.deductions)}
              </div>
            </div>
            <div style={{ backgroundColor: 'white', padding: 16, borderRadius: 4 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Net Salary</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>
                {formatCurrency(salaryData.salary.netSalary)}
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Salary Breakdown</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: '#666' }}>Base Salary</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(salaryData.salary.basicSalary || salaryData.salary.baseSalary)}
                  </td>
                </tr>
                {salaryData.salary.overtimePay > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Overtime Pay</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(salaryData.salary.overtimePay)}
                    </td>
                  </tr>
                )}
                {salaryData.salary.allowances > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Allowances</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(salaryData.salary.allowances)}
                    </td>
                  </tr>
                )}
                {salaryData.salary.bonuses > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Bonuses</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                      {formatCurrency(salaryData.salary.bonuses)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!salaryData && !loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          No salary data found for {getMonthName(selectedMonth)} {selectedYear}
        </div>
      )}

      {/* Salary History */}
      {salaryHistory.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>Salary History</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: 8 }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Month</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Gross Salary</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Deductions</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Net Salary</th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryHistory.map((record, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: 12 }}>
                      {getMonthName(record.month)} {record.year}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {formatCurrency(record.grossSalary)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {formatCurrency(record.deductions || record.totalDeductions)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCurrency(record.netSalary)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: 12,
                        backgroundColor: record.status === 'paid' ? '#d4edda' : '#fff3cd',
                        color: record.status === 'paid' ? '#155724' : '#856404'
                      }}>
                        {record.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantMySalary;
