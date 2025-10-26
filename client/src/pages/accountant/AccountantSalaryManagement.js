import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const AccountantSalaryManagement = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Salary data
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryTemplate, setSalaryTemplate] = useState(null);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Salary calculation form
  const [calculationForm, setCalculationForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    baseSalary: 0,
    overtimeHours: 0,
    overtimeRate: 1.5,
    allowances: {
      transport: 0,
      food: 0,
      housing: 0,
      medical: 0,
      other: 0
    },
    deductions: {
      providentFund: 0,
      professionalTax: 0,
      incomeTax: 0,
      other: 0
    },
    bonuses: {
      attendance: 0,
      performance: 0,
      productivity: 0
    }
  });

  // Calculated results
  const [calculatedSalary, setCalculatedSalary] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);

  // Load salary history
  const loadSalaryHistory = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/salary/history?year=${selectedYear}&limit=12`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setSalaryHistory(data.data || []);
      }
    } catch (err) {
      setError('Failed to load salary history');
      console.error('Error loading salary history:', err);
    } finally {
      setLoading(false);
    }
  }, [base, headers, selectedYear]);

  // Load current salary template
  const loadSalaryTemplate = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/salary/template`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setSalaryTemplate(data.data);
        
        // Pre-fill form with template data
        if (data.data) {
          setCalculationForm(prev => ({
            ...prev,
            baseSalary: data.data.monthlySalary || 0,
            allowances: {
              transport: data.data.benefits?.transportAllowance || 0,
              food: data.data.benefits?.foodAllowance || 0,
              housing: data.data.benefits?.housingAllowance || 0,
              medical: data.data.benefits?.healthInsurance || 0,
              other: data.data.benefits?.otherAllowances || 0
            },
            deductions: {
              providentFund: data.data.deductions?.providentFund || 0,
              professionalTax: data.data.deductions?.professionalTax || 0,
              incomeTax: data.data.deductions?.incomeTax || 0,
              other: data.data.deductions?.otherDeductions || 0
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error loading salary template:', err);
    }
  }, [base, headers]);

  // Load current month salary
  const loadCurrentSalary = useCallback(async () => {
    try {
      const res = await fetch(`${base}/api/salary/current?year=${selectedYear}&month=${selectedMonth}`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentSalary(data.data);
      }
    } catch (err) {
      console.error('Error loading current salary:', err);
    }
  }, [base, headers, selectedYear, selectedMonth]);

  // Calculate salary
  const calculateSalary = () => {
    const { baseSalary, overtimeHours, overtimeRate, allowances, deductions, bonuses } = calculationForm;
    
    // Calculate overtime pay (assuming 8 hours per day, 30 days per month = 240 hours)
    const hourlyRate = baseSalary / 240;
    const overtimePay = overtimeHours * hourlyRate * overtimeRate;
    
    // Calculate totals
    const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + Number(val), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + Number(val), 0);
    const totalBonuses = Object.values(bonuses).reduce((sum, val) => sum + Number(val), 0);
    
    // Calculate gross and net salary
    const grossSalary = baseSalary + overtimePay + totalAllowances + totalBonuses;
    const netSalary = grossSalary - totalDeductions;
    
    const result = {
      baseSalary: Number(baseSalary),
      overtimePay,
      totalAllowances,
      totalDeductions,
      totalBonuses,
      grossSalary,
      netSalary,
      hourlyRate,
      overtimeHours: Number(overtimeHours),
      overtimeRate: Number(overtimeRate)
    };
    
    setCalculatedSalary(result);
    setShowCalculation(true);
  };

  // Save salary calculation
  const saveSalaryCalculation = async () => {
    if (!calculatedSalary) {
      toast.error('No calculation to save');
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch(`${base}/api/salary/calculate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          year: calculationForm.year,
          month: calculationForm.month,
          wageType: 'monthly',
          baseSalary: calculatedSalary.baseSalary,
          overtimePay: calculatedSalary.overtimePay,
          allowances: calculationForm.allowances,
          bonuses: calculationForm.bonuses,
          deductions: calculationForm.deductions,
          grossSalary: calculatedSalary.grossSalary,
          netSalary: calculatedSalary.netSalary,
          overtimeHours: calculatedSalary.overtimeHours,
          overtimeRate: calculatedSalary.overtimeRate
        })
      });
      
      if (res.ok) {
        toast.success('Salary calculation saved successfully');
        await loadSalaryHistory();
        await loadCurrentSalary();
      } else {
        throw new Error('Failed to save calculation');
      }
    } catch (err) {
      setError('Failed to save salary calculation');
      toast.error('Failed to save salary calculation');
    } finally {
      setLoading(false);
    }
  };

  // Request salary review
  const requestSalaryReview = async () => {
    if (!calculatedSalary) {
      toast.error('No calculation to review');
      return;
    }

    try {
      setLoading(true);
      
      await fetch(`${base}/api/notifications/staff-trip-event`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: 'Salary Review Request',
          message: `Accountant has requested salary review for ${calculationForm.month}/${calculationForm.year}. Net Amount: ₹${calculatedSalary.netSalary.toFixed(2)}`,
          link: '/manager/staff-salary',
          meta: {
            role: 'accountant',
            month: calculationForm.month,
            year: calculationForm.year,
            grossSalary: calculatedSalary.grossSalary,
            netSalary: calculatedSalary.netSalary,
            requestType: 'salary_review'
          },
          targetRole: 'manager'
        })
      });
      
      toast.success('Salary review request sent to manager');
    } catch (err) {
      setError('Failed to send review request');
      toast.error('Failed to send salary review request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalaryTemplate();
    loadCurrentSalary();
  }, [loadSalaryTemplate, loadCurrentSalary]);

  useEffect(() => {
    loadSalaryHistory();
  }, [loadSalaryHistory]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Accountant Salary Management</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>View and calculate your monthly salary</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-outline" 
            onClick={loadSalaryHistory}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" style={{ marginBottom: 16 }}>
          {success}
        </div>
      )}

      {/* Current Salary Display */}
      {currentSalary && (
        <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>
            Current Salary - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Gross Salary</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>
                ₹{currentSalary.grossSalary?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Net Salary</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
                ₹{currentSalary.netSalary?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#fef3c7', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Overtime</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
                ₹{currentSalary.overtimePay?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Allowances</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                ₹{currentSalary.totalAllowances?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary Calculation */}
      <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Calculate Salary</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
              Year
            </label>
            <input
              type="number"
              value={calculationForm.year}
              onChange={(e) => setCalculationForm(prev => ({ ...prev, year: Number(e.target.value) }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
              Month
            </label>
            <select
              value={calculationForm.month}
              onChange={(e) => setCalculationForm(prev => ({ ...prev, month: Number(e.target.value) }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
              Base Salary (₹)
            </label>
            <input
              type="number"
              value={calculationForm.baseSalary}
              onChange={(e) => setCalculationForm(prev => ({ ...prev, baseSalary: Number(e.target.value) }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
              Overtime Hours
            </label>
            <input
              type="number"
              value={calculationForm.overtimeHours}
              onChange={(e) => setCalculationForm(prev => ({ ...prev, overtimeHours: Number(e.target.value) }))}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        {/* Allowances */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Allowances (₹)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {Object.entries(calculationForm.allowances).map(([key, value]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setCalculationForm(prev => ({
                    ...prev,
                    allowances: { ...prev.allowances, [key]: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Deductions */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Deductions (₹)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {Object.entries(calculationForm.deductions).map(([key, value]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setCalculationForm(prev => ({
                    ...prev,
                    deductions: { ...prev.deductions, [key]: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bonuses */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Bonuses (₹)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {Object.entries(calculationForm.bonuses).map(([key, value]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setCalculationForm(prev => ({
                    ...prev,
                    bonuses: { ...prev.bonuses, [key]: Number(e.target.value) }
                  }))}
                  style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-primary" 
            onClick={calculateSalary}
            disabled={loading}
          >
            Calculate Salary
          </button>
          
          {showCalculation && (
            <>
              <button 
                className="btn btn-success" 
                onClick={saveSalaryCalculation}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Calculation'}
              </button>
              
              <button 
                className="btn btn-info" 
                onClick={requestSalaryReview}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Request Review'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Calculation Results */}
      {showCalculation && calculatedSalary && (
        <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Salary Calculation Results</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f8fafc', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Base Salary</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
                ₹{calculatedSalary.baseSalary.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#fef3c7', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Overtime Pay</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#d97706' }}>
                ₹{calculatedSalary.overtimePay.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Total Allowances</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#16a34a' }}>
                ₹{calculatedSalary.totalAllowances.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#fef2f2', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Total Deductions</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#dc2626' }}>
                ₹{calculatedSalary.totalDeductions.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Gross Salary</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#3b82f6' }}>
                ₹{calculatedSalary.grossSalary.toFixed(2)}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
              <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>Net Salary</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                ₹{calculatedSalary.netSalary.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Salary History */}
      <div className="dash-card" style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Salary History</h3>
        
        {salaryHistory.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Month</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Gross</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Net</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Overtime</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Allowances</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Deductions</th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryHistory.map((salary, index) => (
                  <tr key={salary._id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                      {new Date(salary.year, salary.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                      ₹{salary.grossSalary?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>
                      ₹{salary.netSalary?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                      ₹{salary.overtimePay?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                      ₹{salary.totalAllowances?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                      ₹{salary.totalDeductions?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        fontSize: 12,
                        backgroundColor: salary.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: salary.status === 'paid' ? '#166534' : '#92400e'
                      }}>
                        {salary.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            No salary history found
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountantSalaryManagement;
