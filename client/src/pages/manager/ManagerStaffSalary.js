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

    allowances: {
      transport: 0,
      food: 0,
      housing: 0,
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

  // Role categories
  const roleCategories = {
    daily: {
      title: 'Daily Wages Staff',
      description: 'Delivery Staff, General Staff',
      roles: ['delivery_staff', 'field_staff', 'staff'],
      defaultWage: 500,
      wageType: 'daily'
    },
    monthly: {
      title: 'Monthly Salary Staff', 
      description: 'Lab Staff, Accountant',
      roles: ['lab', 'lab_staff', 'lab_manager', 'accountant'],
      defaultWage: 25000,
      wageType: 'monthly'

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


      console.error('Error loading staff:', err);

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

  // Load staff by role
  const loadStaffByRole = useCallback(async (role) => {
    try {
      const res = await fetch(`${base}/api/user-management/staff?role=${encodeURIComponent(role)}&status=active&limit=100`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        return data?.users || data?.records || [];
      }
    } catch (err) {
      console.error('Error loading staff by role:', err);
    }
    return [];
  }, [base, headers]);

  // Calculate salary for a staff member
  const calculateStaffSalary = async (staffMember) => {
    try {
      const { wageType, dailyWage, monthlySalary, overtimeHours, overtimeRate, allowances, deductions, bonuses } = salaryForm;
      
      let baseSalary = 0;
      let workingDays = 0;
      
      if (wageType === 'daily') {
        // For daily wage staff, get attendance data

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

        // For monthly salary staff
        baseSalary = Number(monthlySalary);
      }

      // Calculate overtime
      const overtimePay = Number(overtimeHours) * (baseSalary / (wageType === 'daily' ? 8 : 240)) * Number(overtimeRate);
      
      // Calculate allowances
      const totalAllowances = Object.values(allowances).reduce((sum, val) => sum + Number(val), 0);
      
      // Calculate bonuses
      const totalBonuses = Object.values(bonuses).reduce((sum, val) => sum + Number(val), 0);
      
      // Calculate deductions
      const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + Number(val), 0);
      
      // Calculate gross and net salary

      const grossSalary = baseSalary + overtimePay + totalAllowances + totalBonuses;
      const netSalary = grossSalary - totalDeductions;

      return {
        staff: staffMember,

        baseSalary, overtimePay, totalAllowances, totalBonuses, totalDeductions, grossSalary, netSalary, workingDays, wageType
      };
    } catch (err) {

        baseSalary,
        overtimePay,
        totalAllowances,
        totalBonuses,
        totalDeductions,
        grossSalary,
        netSalary,
        workingDays,
        wageType
      };
    } catch (err) {
      console.error('Error calculating salary for', staffMember.name, err);

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

  // Calculate salaries for selected staff
  const calculateSalaries = async () => {
    if (selectedStaff.length === 0) {
      toast.error('Please select at least one staff member');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const results = [];
      for (const staffMember of selectedStaff) {
        const salaryData = await calculateStaffSalary(staffMember);
        if (salaryData) {
          results.push(salaryData);
        }
      }
      
      setCalculatedSalaries(results);
      setShowResults(true);
      toast.success(`Calculated salaries for ${results.length} staff members`);
      
    } catch (err) {
      setError('Failed to calculate salaries');
      toast.error('Failed to calculate salaries');
    } finally {
      setLoading(false);
    }
  };

  // Send salary notifications to staff
  const sendSalaryNotifications = async () => {
    if (calculatedSalaries.length === 0) {
      toast.error('No calculated salaries to send');
      return;
    }

    try {
      setLoading(true);
      
      for (const salaryData of calculatedSalaries) {
        await fetch(`${base}/api/notifications/staff-trip-event`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: 'Salary Calculated',
            message: `Your salary for ${salaryForm.month}/${salaryForm.year} has been calculated. Net Amount: ₹${salaryData.netSalary.toFixed(2)}`,
            link: '/staff/salary',
            meta: {
              staffId: salaryData.staff._id,
              staffName: salaryData.staff.name,
              month: salaryForm.month,
              year: salaryForm.year,
              grossSalary: salaryData.grossSalary,
              netSalary: salaryData.netSalary,
              wageType: salaryData.wageType,
              workingDays: salaryData.workingDays
            },
            userId: salaryData.staff._id,
            targetRole: salaryData.staff.role
          })
        });
      }
      
      toast.success(`Salary notifications sent to ${calculatedSalaries.length} staff members`);
      
    } catch (err) {
      setError('Failed to send notifications');
      toast.error('Failed to send salary notifications');
    } finally {
      setLoading(false);
    }
  };

  // Save salary records
  const saveSalaryRecords = async () => {
    if (calculatedSalaries.length === 0) {
      toast.error('No calculated salaries to save');
      return;
    }

    try {
      setLoading(true);
      
      for (const salaryData of calculatedSalaries) {
        await fetch(`${base}/api/salary/calculate`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            staffId: salaryData.staff._id,
            year: salaryForm.year,
            month: salaryForm.month,
            wageType: salaryData.wageType,
            baseSalary: salaryData.baseSalary,
            overtimePay: salaryData.overtimePay,
            allowances: salaryForm.allowances,
            bonuses: salaryForm.bonuses,
            deductions: salaryForm.deductions,
            grossSalary: salaryData.grossSalary,
            netSalary: salaryData.netSalary,
            workingDays: salaryData.workingDays
          })
        });
      }
      
      toast.success(`Salary records saved for ${calculatedSalaries.length} staff members`);
      
    } catch (err) {
      setError('Failed to save salary records');
      toast.error('Failed to save salary records');
    } finally {
      setLoading(false);
    }
  };


  // Handle role selection
  const handleRoleSelection = (category) => {
    setSelectedRole(category);
    setSelectedStaff([]);


    
    // Set default wage type and amount

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

  // Handle staff selection
  const handleStaffSelection = (staffMember, checked) => {
    if (checked) {
      setSelectedStaff(prev => [...prev, staffMember]);
    } else {
      setSelectedStaff(prev => prev.filter(s => s._id !== staffMember._id));
    }
  };

  // Select all staff in current role
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

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedStaff([]);
    setShowResults(false);
    setCalculatedSalaries([]);
  };

  useEffect(() => {
    loadAllStaff();
  }, [loadAllStaff]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>Staff Salary Management</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>Calculate and manage salaries for all staff members</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            className="btn btn-outline" 
            onClick={clearAllSelections}
            disabled={loading}
          >
            Clear All
          </button>
          <button 
            className="btn" 
            onClick={loadAllStaff}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Staff'}
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

      {/* Role Selection */}
      <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Select Staff Category</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {Object.entries(roleCategories).map(([key, category]) => (
            <div 
              key={key}
              className={`role-card ${selectedRole === key ? 'selected' : ''}`}
              onClick={() => handleRoleSelection(key)}
              style={{
                padding: 20,
                border: selectedRole === key ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                borderRadius: 12,
                cursor: 'pointer',
                backgroundColor: selectedRole === key ? '#f0f9ff' : '#fff',
                transition: 'all 0.2s ease'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{category.title}</h4>
              <p style={{ margin: '0 0 12px 0', color: '#64748b', fontSize: 14 }}>{category.description}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {category.roles.map(role => (
                  <span 
                    key={role}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: 6,
                      fontSize: 12,
                      color: '#475569'
                    }}
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRole && (
        <>
          {/* Staff Selection */}
          <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>
                Select Staff ({selectedStaff.length} selected)
              </h3>
              <button 
                className="btn btn-outline" 
                onClick={selectAllStaff}
                disabled={loading}
              >
                Select All {roleCategories[selectedRole]?.title}
              </button>
            </div>
            
            <div style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #e2e8f0', 
              borderRadius: 8, 
              padding: 12 
            }}>
              {Object.entries(staffByRole)
                .filter(([role]) => roleCategories[selectedRole]?.roles.includes(role))
                .map(([role, staff]) => (
                  <div key={role} style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#475569', fontSize: 14, textTransform: 'uppercase' }}>
                      {role.replace('_', ' ')} ({staff.length})
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8 }}>
                      {staff.map(member => (
                        <label 
                          key={member._id}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 8, 
                            padding: 8,
                            borderRadius: 6,
                            backgroundColor: selectedStaff.some(s => s._id === member._id) ? '#f0f9ff' : '#f8fafc',
                            cursor: 'pointer',
                            border: selectedStaff.some(s => s._id === member._id) ? '1px solid #3b82f6' : '1px solid transparent'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedStaff.some(s => s._id === member._id)}
                            onChange={(e) => handleStaffSelection(member, e.target.checked)}
                          />
                          <div>
                            <div style={{ fontWeight: 500, color: '#1e293b' }}>
                              {member.name || member.email}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>
                              {member.staffId && `${member.staffId} • `}{member.email}
                            </div>
                          </div>

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

          {/* Salary Configuration */}
          <div className="dash-card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>Salary Configuration</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                  Year
                </label>
                <input
                  type="number"
                  value={salaryForm.year}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, year: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                  Month
                </label>
                <select
                  value={salaryForm.month}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, month: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              {salaryForm.wageType === 'daily' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Daily Wage (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.dailyWage}
                    onChange={(e) => setSalaryForm(prev => ({ ...prev, dailyWage: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                    Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.monthlySalary}
                    onChange={(e) => setSalaryForm(prev => ({ ...prev, monthlySalary: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#374151' }}>
                  Overtime Hours
                </label>
                <input
                  type="number"
                  value={salaryForm.overtimeHours}
                  onChange={(e) => setSalaryForm(prev => ({ ...prev, overtimeHours: Number(e.target.value) }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db' }}
                />
              </div>
            </div>

            {/* Allowances */}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Allowances (₹)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {Object.entries(salaryForm.allowances).map(([key, value]) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setSalaryForm(prev => ({
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
                {Object.entries(salaryForm.deductions).map(([key, value]) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setSalaryForm(prev => ({
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
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>Bonuses (₹)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                {Object.entries(salaryForm.bonuses).map(([key, value]) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 14, color: '#6b7280' }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setSalaryForm(prev => ({
                        ...prev,
                        bonuses: { ...prev.bonuses, [key]: Number(e.target.value) }
                      }))}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button 
              className="btn btn-primary" 
              onClick={calculateSalaries}
              disabled={loading || selectedStaff.length === 0}
            >
              {loading ? 'Calculating...' : 'Calculate Salaries'}
            </button>
            
            {showResults && (
              <>
                <button 
                  className="btn btn-success" 
                  onClick={saveSalaryRecords}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Records'}
                </button>
                
                <button 
                  className="btn btn-info" 
                  onClick={sendSalaryNotifications}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Notifications'}
                </button>
              </>
            )}
          </div>

          {/* Results */}
          {showResults && calculatedSalaries.length > 0 && (
            <div className="dash-card" style={{ padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#1e293b' }}>
                Calculated Salaries ({calculatedSalaries.length} staff)
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Staff</th>
                      <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Base</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Overtime</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Allowances</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Bonuses</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Deductions</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Gross</th>
                      <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedSalaries.map((salary, index) => (
                      <tr key={salary.staff._id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>{salary.staff.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{salary.staff.staffId}</div>
                          </div>
                        </td>
                        <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ 
                            padding: '4px 8px', 
                            borderRadius: 4, 
                            fontSize: 12,
                            backgroundColor: salary.wageType === 'daily' ? '#fef3c7' : '#dbeafe',
                            color: salary.wageType === 'daily' ? '#92400e' : '#1e40af'
                          }}>
                            {salary.wageType}
                          </span>
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                          ₹{salary.baseSalary.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                          ₹{salary.overtimePay.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                          ₹{salary.totalAllowances.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                          ₹{salary.totalBonuses.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                          ₹{salary.totalDeductions.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 500 }}>
                          ₹{salary.grossSalary.toFixed(2)}
                        </td>
                        <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#059669' }}>
                          ₹{salary.netSalary.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 600 }}>
                      <td style={{ padding: 12, borderTop: '2px solid #e2e8f0' }} colSpan="7">Total</td>
                      <td style={{ padding: 12, textAlign: 'right', borderTop: '2px solid #e2e8f0' }}>
                        ₹{calculatedSalaries.reduce((sum, s) => sum + s.grossSalary, 0).toFixed(2)}
                      </td>
                      <td style={{ padding: 12, textAlign: 'right', borderTop: '2px solid #e2e8f0', color: '#059669' }}>
                        ₹{calculatedSalaries.reduce((sum, s) => sum + s.netSalary, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>

      )}
    </div>
  );
};

export default ManagerStaffSalary;
