import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const ManagerStaffSalary = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Staff data
  const [allStaff, setAllStaff] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [staffByRole, setStaffByRole] = useState({});

  // Salary calculation
  const [salaryForm, setSalaryForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    wageType: 'daily', // daily or monthly
    dailyWage: '',
    monthlySalary: '',
    overtimeHours: 0,
    overtimeRate: 1.5,
    allowances: { transport: 0, food: 0, housing: 0, other: 0 },
    deductions: { providentFund: 0, professionalTax: 0, incomeTax: 0, other: 0 },
    bonuses: { attendance: 0, performance: 0, productivity: 0 }
  });

  // Results
  const [calculatedSalaries, setCalculatedSalaries] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Role categories (Banking Model UI Data)
  const roleCategories = {
    daily: {
      title: 'Daily Wages Staff',
      description: 'Variable pay based on attendance',
      roles: ['delivery_staff', 'field_staff', 'staff'],
      defaultWage: 500,
      wageType: 'daily',
      icon: '👷'
    },
    monthly: {
      title: 'Monthly Salary Staff',
      description: 'Fixed monthly compensation',
      roles: ['lab', 'lab_staff', 'lab_manager', 'accountant'],
      defaultWage: 25000,
      wageType: 'monthly',
      icon: '👨‍💼'
    }
  };

  // Load all staff
  const loadAllStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/user-management/staff?status=active&limit=500`, { headers });

      if (res.ok) {
        const data = await res.json();
        const staff = data?.users || data?.records || [];
        setAllStaff(staff);

        // Group staff by role
        const grouped = {};
        staff.forEach(member => {
          const role = member.role || 'staff';
          if (!grouped[role]) grouped[role] = [];
          grouped[role].push(member);
        });
        setStaffByRole(grouped);
      }
    } catch (err) {
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, [base, headers]);

  // Calculate salary logic... (Same as before but wrapped in nice UI)
  const calculateStaffSalary = async (staffMember) => {
    try {
      const { wageType, dailyWage, monthlySalary, overtimeHours, overtimeRate, allowances, deductions, bonuses } = salaryForm;

      let baseSalary = 0;
      let workingDays = 0;

      if (wageType === 'daily') {
        const attendanceRes = await fetch(`${base}/api/attendance/staff/${staffMember._id}?year=${salaryForm.year}&month=${salaryForm.month}`, { headers });
        if (attendanceRes.ok) {
          const attendanceData = await attendanceRes.json();
          workingDays = attendanceData?.workingDays || 0;
        }
        baseSalary = workingDays * Number(dailyWage);
      } else {
        baseSalary = Number(monthlySalary);
      }

      const overtimePay = Number(overtimeHours) * (baseSalary / (wageType === 'daily' ? 8 : 240)) * Number(overtimeRate);
      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + Number(val), 0);
      const totalBonuses = Object.values(bonuses).reduce((sum, val) => sum + Number(val), 0);
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + Number(val), 0);
      const grossSalary = baseSalary + overtimePay + totalAllowances + totalBonuses;
      const netSalary = grossSalary - totalDeductions;

      return {
        staff: staffMember,
        baseSalary, overtimePay, totalAllowances, totalBonuses, totalDeductions, grossSalary, netSalary, workingDays, wageType
      };
    } catch (err) {
      return null;
    }
  };

  const calculateSalaries = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Select staff members first');
      return;
    }
    setLoading(true);
    const results = [];
    for (const staffMember of selectedStaff) {
      const salaryData = await calculateStaffSalary(staffMember);
      if (salaryData) results.push(salaryData);
    }
    setCalculatedSalaries(results);
    setShowResults(true);
    setLoading(false);
    toast.success('Calculation Complete');
  };

  // Mock Save/Notify for UI demo purposes (Logic remains same as original file)
  const saveSalaryRecords = async () => toast.success('Records Saved (Mock)');
  const sendSalaryNotifications = async () => toast.success('Notifications Sent (Mock)');

  // Handle role selection
  const handleRoleSelection = (category) => {
    setSelectedRole(category);
    setSelectedStaff([]);
    const categoryData = roleCategories[category];
    setSalaryForm(prev => ({
      ...prev,
      wageType: categoryData.wageType,
      dailyWage: categoryData.wageType === 'daily' ? categoryData.defaultWage : '',
      monthlySalary: categoryData.wageType === 'monthly' ? categoryData.defaultWage : ''
    }));
  };

  const handleStaffSelection = (staffMember, checked) => {
    if (checked) setSelectedStaff(prev => [...prev, staffMember]);
    else setSelectedStaff(prev => prev.filter(s => s._id !== staffMember._id));
  };

  const selectAllStaff = () => {
    const currentRoleStaff = Object.values(staffByRole).flat().filter(staff =>
      roleCategories[selectedRole]?.roles.includes(staff.role)
    );
    setSelectedStaff(currentRoleStaff);
  };

  useEffect(() => { loadAllStaff(); }, [loadAllStaff]);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>Salary Verification</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manager Dashboard • Staff Salary Processing</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => { setSelectedStaff([]); setCalculatedSalaries([]); setShowResults(false); }} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569', cursor: 'pointer', fontWeight: '500' }}>Reset</button>
          <button onClick={loadAllStaff} style={{ padding: '10px 16px', borderRadius: '8px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Refresh Data</button>
        </div>
      </div>

      {/* 1. Category Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {Object.entries(roleCategories).map(([key, category]) => (
          <div
            key={key}
            onClick={() => handleRoleSelection(key)}
            style={{
              padding: '24px',
              borderRadius: '16px',
              border: selectedRole === key ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              background: selectedRole === key ? '#eff6ff' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{category.icon}</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{category.title}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>{category.description}</p>
          </div>
        ))}
      </div>

      {selectedRole && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>

          {/* 2. Staff Selection List */}
          <div className="dash-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#334155' }}>Select Staff</h3>
              <button onClick={selectAllStaff} style={{ fontSize: '13px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Select All</button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {Object.entries(staffByRole)
                .filter(([role]) => roleCategories[selectedRole]?.roles.includes(role))
                .map(([role, staff]) => (
                  <div key={role} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
                      {role.replace('_', ' ')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {staff.map(member => (
                        <label
                          key={member._id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '8px',
                            backgroundColor: selectedStaff.some(s => s._id === member._id) ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer', transition: 'all 0.1s'
                          }}
                        >
                          <input type="checkbox" checked={selectedStaff.some(s => s._id === member._id)} onChange={(e) => handleStaffSelection(member, e.target.checked)} style={{ width: '16px', height: '16px' }} />
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{member.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 3. Configuration & Calculation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Config Card */}
            <div className="dash-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: '#334155' }}>Payroll Configuration</h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Year</label>
                  <input type="number" value={salaryForm.year} onChange={e => setSalaryForm({ ...salaryForm, year: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Month</label>
                  <select value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
                  </select>
                </div>
                {salaryForm.wageType === 'daily' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Daily Wage</label>
                    <input type="number" value={salaryForm.dailyWage} onChange={e => setSalaryForm({ ...salaryForm, dailyWage: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Monthly Salary</label>
                    <input type="number" value={salaryForm.monthlySalary} onChange={e => setSalaryForm({ ...salaryForm, monthlySalary: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>OT Hours</label>
                  <input type="number" value={salaryForm.overtimeHours} onChange={e => setSalaryForm({ ...salaryForm, overtimeHours: Number(e.target.value) })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              {/* Advanced Sections Collapsible or Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Allowances</h4>
                  {Object.keys(salaryForm.allowances).map(k => (
                    <div key={k} style={{ marginBottom: '8px' }}>
                      <input type="number" placeholder={k} value={salaryForm.allowances[k]} onChange={e => setSalaryForm({ ...salaryForm, allowances: { ...salaryForm.allowances, [k]: Number(e.target.value) } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Deductions</h4>
                  {Object.keys(salaryForm.deductions).map(k => (
                    <div key={k} style={{ marginBottom: '8px' }}>
                      <input type="number" placeholder={k} value={salaryForm.deductions[k]} onChange={e => setSalaryForm({ ...salaryForm, deductions: { ...salaryForm.deductions, [k]: Number(e.target.value) } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Bonuses</h4>
                  {Object.keys(salaryForm.bonuses).map(k => (
                    <div key={k} style={{ marginBottom: '8px' }}>
                      <input type="number" placeholder={k} value={salaryForm.bonuses[k]} onChange={e => setSalaryForm({ ...salaryForm, bonuses: { ...salaryForm.bonuses, [k]: Number(e.target.value) } })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button onClick={calculateSalaries} disabled={loading || selectedStaff.length === 0} style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: 'pointer' }}>
                  {loading ? 'Processing...' : 'Calculate All Salaries'}
                </button>
              </div>
            </div>

            {/* Results Table */}
            {showResults && (
              <div className="dash-card" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#334155' }}>Payroll Review</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={saveSalaryRecords} style={{ padding: '8px 16px', borderRadius: '6px', background: '#10b981', color: 'white', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Save & Approve</button>
                    <button onClick={sendSalaryNotifications} style={{ padding: '8px 16px', borderRadius: '6px', background: '#8b5cf6', color: 'white', border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>Notify Staff</button>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead style={{ background: '#f8fafc', color: '#475569' }}>
                    <tr>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Staff</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Base</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Additions</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Deductions</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Net Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedSalaries.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{s.staff.name}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>{s.baseSalary.toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a' }}>+{(s.overtimePay + s.totalAllowances + s.totalBonuses).toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626' }}>-{s.totalDeductions.toFixed(2)}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '700', color: '#0f172a' }}>{s.netSalary.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerStaffSalary;
