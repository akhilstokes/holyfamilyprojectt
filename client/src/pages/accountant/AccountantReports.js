import React, { useState, useEffect } from 'react';
import { FiDownload, FiFileText, FiBarChart2, FiPieChart, FiCalendar, FiDollarSign } from 'react-icons/fi';

import './AccountantReports.css';

const AccountantReports = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const [generating, setGenerating] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const reports = [
    {
      id: 'financial-summary',
      title: 'Financial Summary Report',
      description: 'Complete overview of revenue, expenses, and profit',
      icon: FiBarChart2,
      backgroundClass: 'icon-blue',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'expense-report',
      title: 'Monthly Expense Report',
      description: 'Detailed breakdown of all expenses by category',
      icon: FiDollarSign,
      backgroundClass: 'icon-red',
      formats: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'vendor-ledger',
      title: 'Vendor Ledger Summary',
      description: 'Complete vendor accounts with purchases and payments',
      icon: FiFileText,
      backgroundClass: 'icon-green',
      formats: ['PDF', 'Excel', 'CSV']
    },
    {
      id: 'salary-disbursement',
      title: 'Salary Disbursement Sheet',
      description: 'Monthly salary payments and deductions',
      icon: FiDollarSign,
      backgroundClass: 'icon-purple',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'gst-report',
      title: 'GST Filing Report',
      description: 'GST calculations and compliance data',
      icon: FiFileText,
      backgroundClass: 'icon-orange',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'profitability',
      title: 'Profitability Analysis',
      description: 'Product and batch margin analysis',
      icon: FiPieChart,
      backgroundClass: 'icon-teal',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'audit-trail',
      title: 'Audit Trail Report',
      description: 'Complete transaction history and changes',
      icon: FiFileText,
      backgroundClass: 'icon-indigo',
      formats: ['PDF', 'CSV']
    },
    {
      id: 'bank-reconciliation',
      title: 'Bank Reconciliation Report',
      description: 'Matched and unmatched transactions',
      icon: FiBarChart2,
      backgroundClass: 'icon-pink',
      formats: ['PDF', 'Excel']
    }
  ];

  const generateReport = async (reportId, format) => {
    try {
      setGenerating(`${reportId}-${format}`);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${base}/api/accountant/reports/${reportId}?format=${format.toLowerCase()}&month=${selectedPeriod.month}&year=${selectedPeriod.year}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}_${selectedPeriod.month}_${selectedPeriod.year}.${format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase()}`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="header-content">
          <h1>Export Reports</h1>
          <p>Generate downloadable PDFs and Excel files</p>
        </div>
        <div className="header-actions">
          <select
            className="month-select"
            value={selectedPeriod.month}
            onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
            aria-label="Select month for report"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="year-input"
            value={selectedPeriod.year}
            onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
            aria-label="Select year for report"
          />
        </div>
      </div>

      {/* Reports Grid */}
      <div className="reports-grid">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="report-card">
              <div className={`report-icon-wrapper ${report.backgroundClass}`}>
                <Icon />
              </div>
              <h3 className="report-title">{report.title}</h3>
              <p className="report-description">{report.description}</p>
              <div className="report-actions">
                {report.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => generateReport(report.id, format)}
                    disabled={generating === `${report.id}-${format}`}
                    className="btn-generate"
                  >
                    {generating === `${report.id}-${format}` ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-sky-600"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload />
                        <span>{format}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button
            onClick={() => {
              setSelectedPeriod({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear()
              });
            }}
            className="quick-action-card"
          >
            <div className="action-header">
              <FiCalendar className="action-icon" />
              <span className="action-title">Current Month</span>
            </div>
            <p className="action-desc">Set period to current month</p>
          </button>
          <button
            onClick={() => {
              const lastMonth = new Date();
              lastMonth.setMonth(lastMonth.getMonth() - 1);
              setSelectedPeriod({
                month: lastMonth.getMonth() + 1,
                year: lastMonth.getFullYear()
              });
            }}
            className="quick-action-card"
          >
            <div className="action-header">
              <FiCalendar className="action-icon" />
              <span className="action-title">Last Month</span>
            </div>
            <p className="action-desc">Set period to previous month</p>
          </button>
          <button
            onClick={() => {
              const currentYear = new Date().getFullYear();
              setSelectedPeriod({
                month: 1,
                year: currentYear
              });
            }}
            className="quick-action-card"
          >
            <div className="action-header">
              <FiCalendar className="action-icon" />
              <span className="action-title">Current Year</span>
            </div>
            <p className="action-desc">Set period to current year</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountantReports;
