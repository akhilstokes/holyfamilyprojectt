import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const MonthlyWageView = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  });

  const [salaryData, setSalaryData] = useState(null);
  const [salaryTemplate, setSalaryTemplate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');

      // Load current month salary
      const salaryRes = await fetch(`${base}/api/salary/monthly/${user._id}?year=${y}&month=${Number(m)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (salaryRes.ok) {
        const salaryData = await salaryRes.json();
        setSalaryData(salaryData.data);
      }

      // Load salary template
      const templateRes = await fetch(`${base}/api/salary/template/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (templateRes.ok) {
        const templateData = await templateRes.json();
        setSalaryTemplate(templateData.data);
      }

      // Load salary history
      const historyRes = await fetch(`${base}/api/salary/history/${user._id}?limit=12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(historyData.data || []);
      }

    } catch (error) {
      console.error('Error loading monthly wage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) loadData();
  }, [month, user]);

  const downloadSalarySlip = async (salary) => {
    try {
      const response = await fetch(`${base}/api/salary/payslip/${salary._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const html = await response.text();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      } else {
        alert('Failed to generate salary slip');
      }
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      alert('Failed to download salary slip');
    }
  };

  if (loading) return <div className="text-center"><div className="spinner-border"></div></div>;

  return (
    <div>
      <div className="row mb-3">
        <div className="col-md-6">
          <h4>Monthly Salary</h4>
        </div>
        <div className="col-md-6">
          <input
            type="month"
            className="form-control"
            value={month}
            onChange={(e)=>setMonth(e.target.value)}
          />
        </div>
      </div>

      {/* Salary Template Information */}
      {salaryTemplate ? (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Salary Structure</h5>
              </div>
              <div className="card-body">
                <div className="salary-breakdown">
                  <div className="d-flex justify-content-between">
                    <span>Basic Salary:</span>
                    <span>₹{salaryTemplate.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>House Rent Allowance:</span>
                    <span>₹{salaryTemplate.houseRentAllowance?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Medical Allowance:</span>
                    <span>₹{salaryTemplate.medicalAllowance?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Transport Allowance:</span>
                    <span>₹{salaryTemplate.transportAllowance?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Special Allowance:</span>
                    <span>₹{salaryTemplate.specialAllowance?.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between font-weight-bold">
                    <span>Gross Salary:</span>
                    <span>₹{(
                      salaryTemplate.basicSalary +
                      salaryTemplate.houseRentAllowance +
                      salaryTemplate.medicalAllowance +
                      salaryTemplate.transportAllowance +
                      salaryTemplate.specialAllowance
                    ).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Deduction Rates</h5>
              </div>
              <div className="card-body">
                <div className="deduction-rates">
                  <div className="d-flex justify-content-between">
                    <span>Provident Fund:</span>
                    <span>{salaryTemplate.providentFundRate}%</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Professional Tax:</span>
                    <span>{salaryTemplate.professionalTaxRate}%</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Income Tax:</span>
                    <span>{salaryTemplate.incomeTaxRate}%</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Fixed Deductions:</span>
                    <span>₹{salaryTemplate.fixedDeductions?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-warning mb-4">
          <h5>Salary Template Not Set</h5>
          <p>Your monthly salary template has not been configured yet. Please contact HR department to set up your salary structure.</p>
        </div>
      )}

      {/* Current Month Salary */}
      {salaryData ? (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Current Month Salary</h5>
              </div>
              <div className="card-body">
                <div className="current-salary">
                  <div className="d-flex justify-content-between">
                    <span>Basic + Allowances:</span>
                    <span>₹{salaryData.grossSalary?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Bonus:</span>
                    <span>₹{salaryData.bonus?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Overtime:</span>
                    <span>₹{salaryData.overtime?.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between font-weight-bold">
                    <span>Gross Salary:</span>
                    <span>₹{salaryData.grossSalary?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Deductions & Net Salary</h5>
              </div>
              <div className="card-body">
                <div className="deductions-net">
                  <div className="d-flex justify-content-between text-danger">
                    <span>Provident Fund:</span>
                    <span>₹{salaryData.providentFund?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between text-danger">
                    <span>Professional Tax:</span>
                    <span>₹{salaryData.professionalTax?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between text-danger">
                    <span>Income Tax:</span>
                    <span>₹{salaryData.incomeTax?.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between text-danger">
                    <span>Other Deductions:</span>
                    <span>₹{salaryData.otherDeductions?.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between font-weight-bold text-success">
                    <span>Net Salary:</span>
                    <span>₹{salaryData.netSalary?.toLocaleString()}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`badge badge-${salaryData.status === 'paid' ? 'success' : salaryData.status === 'approved' ? 'info' : 'warning'}`}>
                      Status: {salaryData.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info mb-4">
          <h5>No Salary Data</h5>
          <p>No salary record found for the selected month.</p>
        </div>
      )}

      {/* Salary History */}
      <div className="mt-4">
        <h5>Salary History</h5>
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
              {history.map((salary) => (
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
                    <span className={`badge badge-${salary.status === 'paid' ? 'success' : salary.status === 'approved' ? 'info' : 'warning'}`}>
                      {salary.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {salary.status === 'paid' && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => downloadSalarySlip(salary)}
                      >
                        <i className="fas fa-download"></i> Download Slip
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No salary history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthlyWageView;
