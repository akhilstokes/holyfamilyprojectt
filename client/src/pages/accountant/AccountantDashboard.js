import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiDollarSign, FiTrendingUp, FiFileText, FiUsers, FiCheckCircle, 
  FiClock, FiAlertCircle, FiBarChart2, FiCreditCard, FiPlus,
  FiArrowUp, FiArrowDown, FiRefreshCw, FiSend, FiEye
} from 'react-icons/fi';
import './AccountantDashboard.css';

const AccountantDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock data for DRC results from lab staff
  const pendingDrcResults = [
    {
      barrelId: 'BRL001',
      userId: 'USR123',
      userName: 'John Smith',
      testDate: '2025-01-02',
      drcValue: 92.5,
      testNotes: 'Good quality, meets standards',
      labStaff: 'Lab Tech 1',
      status: 'PENDING_BILLING'
    },
    {
      barrelId: 'BRL002',
      userId: 'USR124',
      userName: 'Sarah Wilson',
      testDate: '2025-01-02',
      drcValue: 88.3,
      testNotes: 'Acceptable quality',
      labStaff: 'Lab Tech 1',
      status: 'PENDING_BILLING'
    },
    {
      barrelId: 'BRL003',
      userId: 'USR125',
      userName: 'David Brown',
      testDate: '2025-01-01',
      drcValue: 95.2,
      testNotes: 'Excellent quality',
      labStaff: 'Lab Tech 2',
      status: 'PENDING_BILLING'
    }
  ];

  // Mock data for generated bills
  const generatedBills = [
    {
      billId: 'BILL001',
      barrelId: 'BRL004',
      userId: 'USR126',
      userName: 'Emma Taylor',
      drcValue: 90.0,
      basePrice: 4500,
      gst: 810,
      totalAmount: 5310,
      billDate: '2025-01-01',
      status: 'SENT_TO_MANAGER',
      managerApproved: false
    },
    {
      billId: 'BILL002',
      barrelId: 'BRL005',
      userId: 'USR127',
      userName: 'Robert Lee',
      drcValue: 87.5,
      basePrice: 4375,
      gst: 787.5,
      totalAmount: 5162.5,
      billDate: '2025-01-01',
      status: 'MANAGER_APPROVED',
      managerApproved: true,
      paymentStatus: 'PENDING'
    }
  ];

  // Mock data for completed payments
  const completedPayments = [
    {
      billId: 'BILL003',
      barrelId: 'BRL006',
      userId: 'USR128',
      userName: 'Michael Johnson',
      totalAmount: 4950,
      paymentDate: '2024-12-31',
      paymentMethod: 'UPI',
      transactionId: 'TXN123456',
      status: 'COMPLETED'
    }
  ];

  const calculateBill = (drcValue) => {
    // Base price calculation based on DRC value
    const basePrice = drcValue * 50; // ₹50 per DRC percentage point
    const gst = basePrice * 0.18; // 18% GST
    const totalAmount = basePrice + gst;
    
    return {
      basePrice: Math.round(basePrice),
      gst: Math.round(gst),
      totalAmount: Math.round(totalAmount)
    };
  };

  const handleGenerateBill = (drcResult) => {
    const billing = calculateBill(drcResult.drcValue);
    
    setSelectedBill({
      ...drcResult,
      ...billing,
      billId: `BILL${Date.now()}`,
      billDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmitBill = () => {
    if (!selectedBill) return;
    
    // Here you would typically send the bill to your backend
    console.log('Submitting bill to manager:', selectedBill);
    
    alert(`Bill generated successfully!\nBill ID: ${selectedBill.billId}\nTotal Amount: ₹${selectedBill.totalAmount}\nSent to Manager for approval.`);
    setSelectedBill(null);
  };

  const handleConfirmPayment = (bill) => {
    // Here you would typically process the payment confirmation
    console.log('Confirming payment for bill:', bill.billId);
    
    alert(`Payment confirmed for Bill ${bill.billId}\nAmount: ₹${bill.totalAmount}\nMoney will be transferred to user via UPI/Bank transfer.`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Dashboard statistics
  const dashboardStats = {
    pendingBills: pendingDrcResults.length,
    awaitingApproval: generatedBills.filter(b => !b.managerApproved).length,
    pendingPayments: generatedBills.filter(b => b.managerApproved && b.paymentStatus === 'PENDING').length,
    completedToday: completedPayments.filter(p => p.paymentDate === '2025-01-02').length,
    totalRevenue: completedPayments.reduce((sum, p) => sum + p.totalAmount, 0) + 
                  generatedBills.filter(b => b.managerApproved).reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <div className="accountant-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>💰 Accountant Dashboard - Barrel Billing</h1>
          <p>Manage DRC billing, payments, and financial transactions</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{dashboardStats.totalRevenue}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper orange-theme">
              <FiClock />
            </div>
          </div>
          <h3 className="kpi-title">Pending Bills</h3>
          <p className="kpi-value">{dashboardStats.pendingBills}</p>
          <p className="kpi-subtitle">DRC results awaiting billing</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper blue-theme">
              <FiFileText />
            </div>
          </div>
          <h3 className="kpi-title">Awaiting Approval</h3>
          <p className="kpi-value">{dashboardStats.awaitingApproval}</p>
          <p className="kpi-subtitle">Bills sent to manager</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper purple-theme">
              <FiCreditCard />
            </div>
          </div>
          <h3 className="kpi-title">Pending Payments</h3>
          <p className="kpi-value">{dashboardStats.pendingPayments}</p>
          <p className="kpi-subtitle">Approved bills awaiting payment</p>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper green-theme">
              <FiCheckCircle />
            </div>
          </div>
          <h3 className="kpi-title">Completed Today</h3>
          <p className="kpi-value">{dashboardStats.completedToday}</p>
          <p className="kpi-subtitle">Payments processed</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Pending DRC Results ({pendingDrcResults.length})
        </button>
        <button 
          className={activeTab === 'bills' ? 'active' : ''}
          onClick={() => setActiveTab('bills')}
        >
          Generated Bills ({generatedBills.length})
        </button>
        <button 
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => setActiveTab('payments')}
        >
          Payment Processing
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <div className="pending-section">
            <div className="section-header">
              <h2>DRC Results from Lab Staff</h2>
              <p className="section-subtitle">Generate bills based on DRC test results</p>
            </div>
            
            <div className="drc-results-grid">
              {pendingDrcResults.map((result) => (
                <div key={result.barrelId} className="drc-result-card">
                  <div className="card-header">
                    <h3>Barrel {result.barrelId}</h3>
                    <span className="status pending">PENDING BILLING</span>
                  </div>
                  
                  <div className="card-details">
                    <div className="detail-row">
                      <span className="label">User:</span>
                      <span className="value">{result.userName} ({result.userId})</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Test Date:</span>
                      <span className="value">{result.testDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">DRC Value:</span>
                      <span className="value drc-highlight">{result.drcValue}%</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Lab Staff:</span>
                      <span className="value">{result.labStaff}</span>
                    </div>
                    {result.testNotes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{result.testNotes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="billing-preview">
                    <h4>Billing Preview</h4>
                    <div className="billing-calc">
                      <div className="calc-row">
                        <span>Base Price (DRC × ₹50):</span>
                        <span>₹{calculateBill(result.drcValue).basePrice}</span>
                      </div>
                      <div className="calc-row">
                        <span>GST (18%):</span>
                        <span>₹{calculateBill(result.drcValue).gst}</span>
                      </div>
                      <div className="calc-row total">
                        <span>Total Amount:</span>
                        <span>₹{calculateBill(result.drcValue).totalAmount}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn-primary"
                    onClick={() => handleGenerateBill(result)}
                  >
                    <FiPlus /> Generate Bill
                  </button>
                </div>
              ))}
              
              {pendingDrcResults.length === 0 && (
                <div className="no-data">
                  <div className="no-data-icon">📊</div>
                  <p>No pending DRC results from lab staff</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bills' && (
          <div className="bills-section">
            <div className="section-header">
              <h2>Generated Bills</h2>
              <p className="section-subtitle">Bills sent to manager for approval</p>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Barrel ID</th>
                    <th>User</th>
                    <th>DRC Value</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedBills.map((bill) => (
                    <tr key={bill.billId}>
                      <td><strong>{bill.billId}</strong></td>
                      <td>{bill.barrelId}</td>
                      <td>{bill.userName}</td>
                      <td>
                        <span className="drc-value">{bill.drcValue}%</span>
                      </td>
                      <td>
                        <span className="amount-highlight">₹{bill.totalAmount}</span>
                      </td>
                      <td>
                        <span className={`status ${bill.managerApproved ? 'approved' : 'pending'}`}>
                          {bill.managerApproved ? 'MANAGER APPROVED' : 'AWAITING APPROVAL'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-small">
                          <FiEye /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-section">
            <div className="section-header">
              <h2>Payment Processing</h2>
              <p className="section-subtitle">Process approved bills and transfer money to users</p>
            </div>
            
            <div className="payment-cards">
              {generatedBills.filter(bill => bill.managerApproved && bill.paymentStatus === 'PENDING').map((bill) => (
                <div key={bill.billId} className="payment-card">
                  <div className="payment-header">
                    <h3>Bill {bill.billId}</h3>
                    <span className="status approved">APPROVED FOR PAYMENT</span>
                  </div>
                  
                  <div className="payment-details">
                    <div className="detail-row">
                      <span className="label">User:</span>
                      <span className="value">{bill.userName}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Barrel ID:</span>
                      <span className="value">{bill.barrelId}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Amount to Transfer:</span>
                      <span className="value amount-highlight">₹{bill.totalAmount}</span>
                    </div>
                  </div>
                  
                  <div className="payment-actions">
                    <button 
                      className="btn-primary"
                      onClick={() => handleConfirmPayment(bill)}
                    >
                      <FiSend /> Confirm Payment & Transfer
                    </button>
                  </div>
                </div>
              ))}
              
              {generatedBills.filter(bill => bill.managerApproved && bill.paymentStatus === 'PENDING').length === 0 && (
                <div className="no-data">
                  <div className="no-data-icon">💳</div>
                  <p>No approved bills awaiting payment</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="section-header">
              <h2>Payment History</h2>
              <p className="section-subtitle">Completed transactions and billing history</p>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Bill ID</th>
                    <th>Barrel ID</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Payment Date</th>
                    <th>Method</th>
                    <th>Transaction ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedPayments.map((payment) => (
                    <tr key={payment.billId}>
                      <td><strong>{payment.billId}</strong></td>
                      <td>{payment.barrelId}</td>
                      <td>{payment.userName}</td>
                      <td>
                        <span className="amount-highlight">₹{payment.totalAmount}</span>
                      </td>
                      <td>{payment.paymentDate}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.transactionId}</td>
                      <td>
                        <span className="status completed">COMPLETED</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bill Generation Modal */}
      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Generate Bill - Barrel {selectedBill.barrelId}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedBill(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="bill-details">
                <h3>Bill Details</h3>
                <div className="bill-info-grid">
                  <div className="info-item">
                    <span className="label">Bill ID:</span>
                    <span className="value">{selectedBill.billId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Barrel ID:</span>
                    <span className="value">{selectedBill.barrelId}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">User:</span>
                    <span className="value">{selectedBill.userName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">DRC Value:</span>
                    <span className="value drc-highlight">{selectedBill.drcValue}%</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Test Date:</span>
                    <span className="value">{selectedBill.testDate}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Bill Date:</span>
                    <span className="value">{selectedBill.billDate}</span>
                  </div>
                </div>
              </div>
              
              <div className="bill-calculation">
                <h3>Bill Calculation</h3>
                <div className="calculation-table">
                  <div className="calc-row">
                    <span>Base Price (DRC {selectedBill.drcValue}% × ₹50):</span>
                    <span>₹{selectedBill.basePrice}</span>
                  </div>
                  <div className="calc-row">
                    <span>GST (18%):</span>
                    <span>₹{selectedBill.gst}</span>
                  </div>
                  <div className="calc-row total">
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>₹{selectedBill.totalAmount}</strong></span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedBill(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSubmitBill}
              >
                <FiSend /> Send to Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountantDashboard;
