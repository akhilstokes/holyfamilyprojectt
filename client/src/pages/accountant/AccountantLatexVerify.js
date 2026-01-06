import React, { useEffect, useState, useMemo } from 'react';

import {
  fetchLatexRequests,
  updateLatexRequestAdmin,
  accountantCalculateWithCompanyRate,
  getCompanyRate,
  updateCompanyRate
} from '../../services/accountantService';
import { formatTableDateTime } from '../../utils/dateUtils';
import { useConfirm } from '../../components/common/ConfirmDialog';
import { validators } from '../../utils/validation';
import ValidatedInput from '../../components/common/ValidatedInput';
import DateRangeInput from '../../components/common/DateRangeInput';
import './AccountantLatexVerify.css'; // Import new CSS

import { 
  fetchLatexRequests, 
  updateLatexRequestAdmin, 
  accountantCalculate, 
  accountantCalculateWithCompanyRate,
  getCompanyRate,
  validateLatexRequest,
  managerVerifyReq
} from '../../services/accountantService';
import { useConfirm } from '../../components/common/ConfirmDialog';
import { validators, validateField, commonValidationRules } from '../../utils/validation';
import ValidatedInput from '../../components/common/ValidatedInput';
import DateRangeInput from '../../components/common/DateRangeInput';


const statusColors = { pending: '#aa8800', approved: '#0b6e4f', rejected: '#b00020', paid: '#2a5bd7', TEST_COMPLETED: '#2563eb', ACCOUNT_CALCULATED: '#7c3aed' };

export default function AccountantLatexVerify() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [viewMode, setViewMode] = useState('current'); // 'current' or 'history'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [companyRate, setCompanyRate] = useState(0);

  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState('');

  const [validationErrors, setValidationErrors] = useState({});

  const confirm = useConfirm();

  const loadCompanyRate = async () => {
    try {
      const rate = await getCompanyRate();
      setCompanyRate(rate);
    } catch (e) {
      console.error('Failed to load company rate:', e);
      setCompanyRate(0);
    }
  };


  const handleUpdateRate = async () => {
    const rateValue = parseFloat(newRate);
    if (!rateValue || rateValue <= 0) {
      alert('Please enter a valid rate greater than 0');
      return;
    }

    const confirmed = await confirm({
      title: 'Update Company Rate',
      message: `Are you sure you want to update the company rate from ₹${companyRate}/kg to ₹${rateValue}/kg?`,
      confirmText: 'Update',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await updateCompanyRate(rateValue);
      await loadCompanyRate();
      setEditingRate(false);
      setNewRate('');
      alert('Company rate updated successfully!');
    } catch (e) {
      console.error('Failed to update company rate:', e);
      alert(e?.response?.data?.message || 'Failed to update company rate');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: viewMode === 'history' ? 50 : 20,
        status: status || undefined
      };


  const load = async () => {
    setLoading(true);
    try {
      const params = { 
        page, 
        limit: viewMode === 'history' ? 50 : 20, 
        status: status || undefined 
      };
      

      // Add date range for history mode
      if (viewMode === 'history') {
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
      }



      

      const list = await fetchLatexRequests(params);
      setRows(list);
    } catch (e) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    load();
    loadCompanyRate();
    /* eslint-disable-next-line */

  useEffect(() => { 
    load(); 
    loadCompanyRate();
    /* eslint-disable-next-line */ 

  }, [page, status, viewMode, dateFrom, dateTo]);

  // Filter rows based on search term
  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;

    return rows.filter(row =>
      (row.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.overrideBuyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||

    return rows.filter(row => 
      (row.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||

      (row._id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rows, searchTerm]);

  // Get status statistics
  const statusStats = useMemo(() => {
    const stats = {};
    rows.forEach(row => {
      stats[row.status] = (stats[row.status] || 0) + 1;
    });
    return stats;
  }, [rows]);

  // Enhanced validation function
  const validateRequest = async (request) => {
    const errors = {};


    // Check if customer name exists (use overrideBuyerName or user.name)
    const customerName = request.overrideBuyerName || request.user?.name;
    if (!customerName || customerName === '-') {
      errors.userName = 'Customer name is required. Please set overrideBuyerName or ensure user has a name.';
    } else {
      const userNameError = validators.name(customerName, 'Customer Name');
      if (userNameError) {
        errors.userName = userNameError;
      }
    }


    
    // Check if user name exists (not delivery staff)
    const userNameError = validators.name(request.user?.name, 'Customer Name');
    if (userNameError) {
      errors.userName = userNameError;
    }
    

    // Check if quantity is valid
    const quantityError = validators.quantity(request.quantity, 'Quantity');
    if (quantityError) {
      errors.quantity = quantityError;
    }



    

    // Check if DRC percentage is valid
    const drcError = validators.drcPercentage(request.drcPercentage);
    if (drcError) {
      errors.drcPercentage = drcError;
    }



    

    // Check if company rate is available
    const rateError = validators.rate(companyRate, 'Company Rate');
    if (rateError) {
      errors.companyRate = rateError;
    }


    // Additional validations
    if (!request.user?._id && !request.overrideBuyerName) {
      errors.userId = 'User ID or override buyer name is required';
    }

    if (!request._id) {
      errors.requestId = 'Request ID is required';
    }


    
    // Additional validations
    if (!request.user?._id) {
      errors.userId = 'User ID is required';
    }
    
    if (!request._id) {
      errors.requestId = 'Request ID is required';
    }
    

    return errors;
  };

  const updateStatus = async (id, nextStatus) => {
    // Validate before updating status
    const request = rows.find(r => r._id === id);
    if (request) {
      const errors = await validateRequest(request);
      if (Object.keys(errors).length > 0) {
        alert(`Validation failed: ${Object.values(errors).join(', ')}`);
        return;
      }
    }

    const ok = await confirm('Confirm action', `Are you sure to set status to ${nextStatus}?`);
    if (!ok) return;
    try {
      await updateLatexRequestAdmin(id, { status: nextStatus });



      

      // Send manager verification notification for approved items
      if (nextStatus === 'approved') {
        await sendManagerVerification(id, request);
      }



      

      await load();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to update status';
      alert(msg);
    }
  };

  // Send manager verification notification
  const sendManagerVerification = async (requestId, request) => {
    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      await fetch(`${API}/api/notifications/staff-trip-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: 'Latex Billing Ready for Manager Verification',
          message: `Sample ${requestId} billing approved by accountant and ready for manager verification`,
          link: '/manager/latex-billing',
          meta: {
            sampleId: String(requestId),
            customerName: request?.user?.name || 'Customer',
            calculatedAmount: request?.calculatedAmount,
            companyRate: companyRate,
            quantity: request?.quantity,
            drcPercentage: request?.drcPercentage,
            requestId: requestId
          },
          targetRole: 'manager'
        })
      });
    } catch (e) {
      console.warn('Failed to notify manager:', e);
    }
  };

  const doCalculate = async (r) => {
    // Validate request before calculation
    const errors = await validateRequest(r);
    if (Object.keys(errors).length > 0) {
      alert(`Validation failed: ${Object.values(errors).join(', ')}`);
      return;
    }

    // Use company rate automatically
    const ok = await confirm('Confirm calculation', `Calculate amount using company rate ₹${companyRate}/kg for request ${r._id}?`);
    if (!ok) return;



    

    try {
      await accountantCalculateWithCompanyRate(r._id);
      await load();

      // Notify manager after successful calculation
      await sendManagerVerification(r._id, r);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to calculate';
      alert(msg);
    }
  };

  return (

    <div className="verify-latex-container">
      <div className="verify-header">
        <h2>Verify Latex Billing</h2>
        <div className="view-mode-toggles">
          <button
            className={viewMode === 'current' ? 'btn' : 'btn-secondary'}

    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Verify Latex Billing</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={viewMode === 'current' ? 'btn' : 'btn-secondary'} 

            onClick={() => { setViewMode('current'); setPage(1); }}
          >
            Current
          </button>

          <button
            className={viewMode === 'history' ? 'btn' : 'btn-secondary'}

          <button 
            className={viewMode === 'history' ? 'btn' : 'btn-secondary'} 

            onClick={() => { setViewMode('history'); setPage(1); }}
          >
            History
          </button>
        </div>
      </div>


      {/* Company Rate Display and Update */}
      <div className="company-rate-section">
        <span className="rate-label">Company Rate:</span>
        <span className="rate-badge">₹{companyRate}/kg</span>

        <div className="rate-actions">
          {!editingRate ? (
            <>
              <button
                className="btn-secondary"
                onClick={loadCompanyRate}
                title="Refresh current rate"
              >
                Refresh Rate
              </button>
              <button
                className="btn"
                onClick={() => {
                  setEditingRate(true);
                  setNewRate(companyRate.toString());
                }}
              >
                Update Rate
              </button>
            </>
          ) : (
            <div className="rate-edit-group">
              <input
                type="number"
                className="rate-input"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Enter new rate"
                min="0"
                step="0.01"
              />
              <button className="btn" onClick={handleUpdateRate}>Save</button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingRate(false);
                  setNewRate('');
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

      {/* Company Rate Display */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        marginBottom: 16, 
        padding: 12, 
        backgroundColor: '#e3f2fd', 
        borderRadius: 8,
        alignItems: 'center'
      }}>
        <strong>Company Rate:</strong>
        <span style={{ 
          padding: '4px 12px', 
          borderRadius: 4, 
          backgroundColor: '#1976d2',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          ₹{companyRate}/kg
        </span>
        <button 
          className="btn-secondary" 
          onClick={loadCompanyRate}
          style={{ fontSize: '12px', padding: '4px 8px' }}
        >
          Refresh Rate
        </button>

      </div>

      {/* Status Statistics */}
      {viewMode === 'history' && Object.keys(statusStats).length > 0 && (

        <div className="stats-section">
          <strong>Status Summary:</strong>
          {Object.entries(statusStats).map(([statusName, count]) => (
            <span key={statusName} className="stat-badge" style={{ backgroundColor: statusColors[statusName] || '#6b7280' }}>

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          marginBottom: 16, 
          padding: 12, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 8,
          flexWrap: 'wrap'
        }}>
          <strong>Status Summary:</strong>
          {Object.entries(statusStats).map(([statusName, count]) => (
            <span key={statusName} style={{ 
              padding: '4px 8px', 
              borderRadius: 4, 
              backgroundColor: statusColors[statusName] || '#6b7280',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500'
            }}>

              {statusName}: {count}
            </span>
          ))}
        </div>
      )}

      {/* Controls */}

      <div className="controls-toolbar">
        <label htmlFor="status-filter" className="sr-only">Filter by status</label>
        <select
          id="status-filter"
          className="filter-select"
          value={status}
          onChange={e => { setPage(1); setStatus(e.target.value); }}
        >

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value); }}>

          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="TEST_COMPLETED">Test Completed</option>
          <option value="ACCOUNT_CALCULATED">Account Calculated</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>



        

        {viewMode === 'history' && (
          <DateRangeInput
            fromDate={dateFrom}
            toDate={dateTo}
            onFromDateChange={e => { setDateFrom(e.target.value); setPage(1); }}
            onToDateChange={e => { setDateTo(e.target.value); setPage(1); }}
            fromDateLabel="From Date"
            toDateLabel="To Date"

            helperText=""
          />
        )}

        <div className="search-container">
          <ValidatedInput
            name="searchTerm"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search customer, ID, or status..."
            validationRules={[]}
            // Removed helperText to prevent overlap
            aria-label="Search latex requests"
          />
        </div>

        <button className="btn refresh-btn" onClick={() => { setPage(1); load(); }}>Refresh</button>

            helperText="Select date range for historical data"
          />
        )}
        
        <ValidatedInput
          name="searchTerm"
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search customer, ID, or status..."
          validationRules={[]}
          helperText="Search by customer name, request ID, or status"
          style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, minWidth: 200 }}
        />
        
        <button className="btn" onClick={() => { setPage(1); load(); }}>Refresh</button>

      </div>

      {loading ? <p>Loading...</p> : (
        filteredRows.length === 0 ? <div className="no-data">No requests found</div> : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Qty (Liters)</th>
                  <th>DRC%</th>
                  <th>Estimated</th>
                  <th>Calc Amount</th>
                  <th>Company Rate (₹/kg)</th>
                  <th>Status</th>
                  {viewMode === 'history' && <th>Last Updated</th>}
                  {viewMode === 'current' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(r => (
                  <tr key={r._id}>

                    <td>{formatTableDateTime(r.submittedAt || r.createdAt)}</td>
                    <td>
                      {(() => {
                        const displayName = r.overrideBuyerName || r.user?.name || r.user?.email || null;
                        const hasName = displayName && displayName !== '-';
                        return (
                          <span style={{
                            color: !hasName ? '#d32f2f' : 'inherit',
                            fontWeight: !hasName ? 'bold' : 'normal'
                          }}>
                            {displayName || '⚠️ User Name Missing'}
                          </span>
                        );
                      })()}

                    <td>{new Date(r.submittedAt || r.createdAt).toLocaleString()}</td>
                    <td>
                      <span style={{ 
                        color: (!r.user?.name || r.user?.name === '-') ? '#d32f2f' : 'inherit',
                        fontWeight: (!r.user?.name || r.user?.name === '-') ? 'bold' : 'normal'
                      }}>
                        {r.user?.name || '⚠️ User Name Missing'}
                      </span>

                    </td>
                    <td>{r.quantity ? `${r.quantity}L` : '-'}</td>
                    <td>{r.drcPercentage ?? '-'}</td>
                    <td>{r.estimatedPayment ?? '-'}</td>
                    <td>{r.calculatedAmount ?? '-'}</td>
                    <td>

                      <span style={{

                      <span style={{ 

                        color: r.marketRate ? 'inherit' : '#1976d2',
                        fontWeight: r.marketRate ? 'normal' : 'bold'
                      }}>
                        {r.marketRate || `₹${companyRate}`}
                      </span>
                    </td>
                    <td>

                      <span style={{

                      <span style={{ 

                        color: statusColors[r.status] || '#333',
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: `${statusColors[r.status] || '#333'}20`,
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {r.status}
                      </span>
                    </td>
                    {viewMode === 'history' && (

                      <td>{formatTableDateTime(r.updatedAt || r.createdAt)}</td>
                    )}
                    {viewMode === 'current' && (
                      <td className="action-buttons">

                      <td>{new Date(r.updatedAt || r.createdAt).toLocaleString()}</td>
                    )}
                    {viewMode === 'current' && (
                      <td style={{ display: 'flex', gap: 8 }}>

                        {r.status === 'TEST_COMPLETED' && (
                          <button className="btn" onClick={() => doCalculate(r)}>Calculate</button>
                        )}
                        {r.status === 'pending' && (
                          <>
                            <button className="btn" onClick={() => updateStatus(r._id, 'approved')}>Approve</button>
                            <button className="btn-secondary" onClick={() => updateStatus(r._id, 'rejected')}>Reject</button>
                          </>
                        )}
                        {r.status === 'approved' && (
                          <button className="btn" onClick={() => updateStatus(r._id, 'paid')}>Mark Paid</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}


      <div className="pagination">
        <div className="pagination-controls">

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          <button className="btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
          <span>Page {page}</span>
          <button className="btn-secondary" onClick={() => setPage(p => p + 1)}>Next</button>
        </div>


        {viewMode === 'history' && (
          <div className="pagination-info">

        
        {viewMode === 'history' && (
          <div style={{ fontSize: '14px', color: '#6b7280' }}>

            Showing {filteredRows.length} records
            {searchTerm && ` (filtered from ${rows.length} total)`}
            {dateFrom && dateTo && ` from ${dateFrom} to ${dateTo}`}
          </div>
        )}
      </div>
    </div>
  );
}
