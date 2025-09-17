import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const StaffSalaryView = () => {
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [activeTab, setActiveTab] = useState('template');
  const [salaryTemplate, setSalaryTemplate] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [loading] = useState(false);

  useEffect(() => {
    loadSalaryTemplate();
    loadSalaryHistory();
  }, [loadSalaryTemplate, loadSalaryHistory]);

  useEffect(() => {
    loadSalaryHistory();
  }, [loadSalaryHistory, currentYear]);

  const loadSalaryTemplate = useCallback(async () => {
    try {
      const response = await fetch(`${base}/api/salary/template/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalaryTemplate(data.data);
      } else if (response.status === 404) {
        setSalaryTemplate(null);
      }
    } catch (error) {
      console.error('Failed to load salary template:', error);
    }
  }, [base, token, user._id]);

  const loadSalaryHistory = useCallback(async () => {
    try {
      const response = await fetch(`${base}/api/salary/history/${user._id}?year=${currentYear}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalaryHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load salary history:', error);
    }
  }, [base, token, user._id, currentYear]);

  const downloadSalarySlip = async (salary) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text('HOLY FAMILY POLYMERS', 14, 20);
      doc.setFontSize(14);
      doc.text('Salary Slip', 14, 30);
      
      // Employee Details
      doc.setFontSize(10);
      doc.text(`Employee Name: ${salary.staff?.name || user.name}`, 14, 45);
      doc.text(`Employee ID: ${salary.staff?.staffId || user.staffId || 'N/A'}`, 14, 52);
      doc.text(`Email: ${salary.staff?.email || user.email}`, 14, 59);
      doc.text(`Month: ${new Date(salary.year, salary.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 66);
      
      // Salary Details
      let y = 80;
      doc.setFontSize(12);
      doc.text('EARNINGS', 14, y);
      y += 10;
      
      const earnings = [
        ['Basic Salary', salary.basicSalary],
        ['House Rent Allowance', salary.houseRentAllowance],
        ['Medical Allowance', salary.medicalAllowance],
        ['Transport Allowance', salary.transportAllowance],
        ['Special Allowance', salary.specialAllowance],
        ['Bonus', salary.bonus],
        ['Overtime', salary.overtime]
      ];
      
      earnings.forEach(([label, amount]) => {
        if (amount > 0) {
          doc.text(`${label}:`, 20, y);
          doc.text(`₹${amount.toLocaleString()}`, 150, y);
          y += 7;
        }
      });
      
      doc.text('Gross Salary:', 20, y);
      doc.text(`₹${salary.grossSalary.toLocaleString()}`, 150, y);
      y += 15;
      
      // Deductions
      doc.text('DEDUCTIONS', 14, y);
      y += 10;
      
      const deductions = [
        ['Provident Fund', salary.providentFund],
        ['Professional Tax', salary.professionalTax],
        ['Income Tax', salary.incomeTax],
        ['Other Deductions', salary.otherDeductions]
      ];
      
      deductions.forEach(([label, amount]) => {
        if (amount > 0) {
          doc.text(`${label}:`, 20, y);
          doc.text(`₹${amount.toLocaleString()}`, 150, y);
          y += 7;
        }
      });
      
      doc.text('Total Deductions:', 20, y);
      doc.text(`₹${salary.totalDeductions.toLocaleString()}`, 150, y);
      y += 15;
      
      // Net Salary
      doc.setFontSize(12);
      doc.text('NET SALARY:', 20, y);
      doc.text(`₹${salary.netSalary.toLocaleString()}`, 150, y);
      
      // Status
      y += 20;
      doc.setFontSize(10);
      doc.text(`Status: ${salary.status.toUpperCase()}`, 14, y);
      if (salary.paymentDate) {
        doc.text(`Payment Date: ${new Date(salary.paymentDate).toLocaleDateString()}`, 14, y + 7);
      }
      if (salary.paymentMethod) {
        doc.text(`Payment Method: ${salary.paymentMethod.replace('_', ' ').toUpperCase()}`, 14, y + 14);
      }
      
      // Footer
      doc.setFontSize(8);
      doc.text('This is a computer generated salary slip.', 14, 280);
      
      doc.save(`salary_slip_${salary.year}_${salary.month}.pdf`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-warning',
      approved: 'badge-info',
      paid: 'badge-success'
    };
    return `badge ${badges[status] || 'badge-secondary'}`;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">My Salary Information</h3>
              <div className="card-tools">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${activeTab === 'template' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('template')}
                  >
                    Salary Template
                  </button>
                  <button
                    type="button"
                    className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveTab('history')}
                  >
                    Salary History
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Salary Template Tab */}
              {activeTab === 'template' && (
                <div>
                  {salaryTemplate ? (
                    <div>
                      <h4>My Salary Structure</h4>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <h5>Basic Components</h5>
                            </div>
                            <div className="card-body">
                              <p><strong>Basic Salary:</strong> ₹{salaryTemplate.basicSalary?.toLocaleString()}</p>
                              <p><strong>House Rent Allowance:</strong> ₹{salaryTemplate.houseRentAllowance?.toLocaleString()}</p>
                              <p><strong>Medical Allowance:</strong> ₹{salaryTemplate.medicalAllowance?.toLocaleString()}</p>
                              <p><strong>Transport Allowance:</strong> ₹{salaryTemplate.transportAllowance?.toLocaleString()}</p>
                              <p><strong>Special Allowance:</strong> ₹{salaryTemplate.specialAllowance?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-header">
                              <h5>Deduction Rates</h5>
                            </div>
                            <div className="card-body">
                              <p><strong>Provident Fund:</strong> {salaryTemplate.providentFundRate}%</p>
                              <p><strong>Professional Tax:</strong> {salaryTemplate.professionalTaxRate}%</p>
                              <p><strong>Income Tax:</strong> {salaryTemplate.incomeTaxRate}%</p>
                              <p><strong>Fixed Deductions:</strong> ₹{salaryTemplate.fixedDeductions?.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {salaryTemplate.notes && (
                        <div className="mt-3">
                          <h5>Notes</h5>
                          <p className="text-muted">{salaryTemplate.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <small className="text-muted">
                          Effective from: {new Date(salaryTemplate.effectiveFrom).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <h4>No Salary Template Found</h4>
                      <p>Your salary template has not been set up yet. Please contact the HR department.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Salary History Tab */}
              {activeTab === 'history' && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <h4>Salary History</h4>
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-control"
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                      >
                        {Array.from({length: 5}, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>{year}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {salaryHistory.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Basic Salary</th>
                            <th>Gross Salary</th>
                            <th>Net Salary</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salaryHistory.map((salary) => (
                            <tr key={salary._id}>
                              <td>
                                {new Date(salary.year, salary.month - 1).toLocaleString('default', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </td>
                              <td>₹{salary.basicSalary?.toLocaleString()}</td>
                              <td>₹{salary.grossSalary?.toLocaleString()}</td>
                              <td>₹{salary.netSalary?.toLocaleString()}</td>
                              <td>
                                <span className={getStatusBadge(salary.status)}>
                                  {salary.status?.toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => downloadSalarySlip(salary)}
                                >
                                  Download Slip
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <h4>No Salary Records Found</h4>
                      <p>No salary records found for the selected year.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSalaryView;



