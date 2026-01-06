import React, { useState, useEffect } from 'react';
import './AdminRateVerification.css';

const AdminRateVerification = () => {
  const [rateData, setRateData] = useState({
    company: '₹0.00',
    market: '₹0.00',
    date: new Date().toLocaleDateString('en-GB'),
    source: 'https://rubberboard.gov.in',
    asOn: new Date().toLocaleDateString('en-GB'),
    fetches: 50,
    status: 'Active'
  });

  const [pendingProposals, setPendingProposals] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshLive = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setRateData(prev => ({
        ...prev,
        date: new Date().toLocaleDateString('en-GB'),
        asOn: new Date().toLocaleDateString('en-GB')
      }));
    } catch (error) {
      console.error('Error refreshing rates:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshPending = () => {
    // Refresh pending proposals
    console.log('Refreshing pending proposals...');
  };

  return (
    <div className="admin-rate-verification">
      <div className="page-header">
        <h1>Administration</h1>
      </div>

      <div className="rate-section">
        <div className="section-header">
          <h2>Admin Rate Verification</h2>
          <div className="action-buttons">
            <button 
              className="btn-refresh-live"
              onClick={handleRefreshLive}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'REFRESH LIVE'}
            </button>
            <button 
              className="btn-refresh-pending"
              onClick={handleRefreshPending}
            >
              Refresh Pending
            </button>
          </div>
        </div>

        <div className="rate-content">
          <div className="rate-info">
            <div className="rate-title">
              <strong>Combined View (Admin latest + Rubber Board)</strong>
            </div>
            <div className="rate-details">
              <div className="rate-item">
                <span className="label">Admin Latest:</span>
              </div>
              <div className="rate-item">
                <span className="label">Company:</span>
                <span className="value">{rateData.company}</span>
              </div>
              <div className="rate-item">
                <span className="label">Market:</span>
                <span className="value">{rateData.market}</span>
              </div>
              <div className="rate-item">
                <span className="label">Date:</span>
                <span className="value">{rateData.date}</span>
              </div>
            </div>
          </div>

          <div className="rubber-board-info">
            <div className="board-title">
              <strong>Rubber Board:</strong>
            </div>
            <div className="board-details">
              <div className="board-item">
                <span className="label">Source:</span>
                <span className="value link">{rateData.source}</span>
              </div>
              <div className="board-item">
                <span className="label">As on:</span>
                <span className="value">{rateData.asOn}</span>
              </div>
              <div className="board-item">
                <span className="label">Fetches:</span>
                <span className="value">{rateData.fetches}</span>
              </div>
              <div className="board-item">
                <span className="label">Status:</span>
                <span className="value status">{rateData.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pending-section">
        <h3>Pending Proposals</h3>
        <div className="pending-content">
          {pendingProposals.length === 0 ? (
            <div className="no-proposals">
              <em>No pending proposals</em>
            </div>
          ) : (
            <div className="proposals-list">
              {pendingProposals.map((proposal, index) => (
                <div key={index} className="proposal-item">
                  {proposal.title}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRateVerification;