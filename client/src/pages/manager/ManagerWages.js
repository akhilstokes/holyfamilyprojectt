import React, { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';


const ManagerWages = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  const now = useMemo(() => new Date(), []);
  const [form, setForm] = useState({ workerId: '', year: now.getFullYear(), month: now.getMonth() + 1, group: 'field' });
  const [employees, setEmployees] = useState([]); // loaded by group
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [advance, setAdvance] = useState(0);
  // Manual calculator state
  const [manual, setManual] = useState({ workingDays: 0, dailyWage: 0, overtimeHours: 0, overtimeRate: 0, deductions: 0, bonus: 0, advance: 0 });
  const [saveMsg, setSaveMsg] = useState('');

  // Load employees when group changes
  useEffect(() => {

    // Debounce the API call to prevent rate limiting
    const timeoutId = setTimeout(async () => {
      const loadUsers = async () => {
        try {
          setError('');
          const api = process.env.REACT_APP_API_URL || 'http://localhost:5000';
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          const hdrs = token ? { Authorization: `Bearer ${token}` } : {};

    const loadUsers = async () => {
      try {
        setError('');
        const api = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const hdrs = token ? { Authorization: `Bearer ${token}` } : {};

        
        // Determine role mapping
        const roleMapping = {
          'field': 'field_staff',
          'lab': 'lab_staff', 
          'delivery': 'delivery_staff',
          'accountant': 'accountant'
        };
        
        const targetRole = roleMapping[form.group] || 'field_staff';
        
        // Try the wages staff endpoint first (new dedicated endpoint)
        let userList = [];
        try {
          const response = await fetch(`${api}/api/wages/staff?role=${encodeURIComponent(targetRole)}`, { 
            headers: hdrs, 
            credentials: 'include' 
          });
          
          if (response.ok) {
            const data = await response.json();
            userList = data?.data || data?.users || data?.records || data || [];
            if (!Array.isArray(userList)) userList = [];
          } else {
            console.warn(`Wages staff endpoint failed: ${response.status}`);
          }
        } catch (err) {
          console.warn('Wages staff endpoint error:', err.message);
        }
        
        // Fallback to user-management endpoint
        if (userList.length === 0) {
          try {
            const response = await fetch(`${api}/api/user-management/staff?role=${encodeURIComponent(targetRole)}&limit=200&status=active`, { 
              headers: hdrs, 
              credentials: 'include' 
            });
            
            if (response.ok) {
              const data = await response.json();
              userList = data?.users || data?.records || data?.data || data || [];
              if (!Array.isArray(userList)) userList = [];
            } else {
              console.warn(`User-management endpoint failed: ${response.status}`);
            }
          } catch (err) {
            console.warn('User-management endpoint error:', err.message);
          }
        }
        
        // If no users found, try alternative endpoints
        if (userList.length === 0) {
          try {
            // Try the general users endpoint with role filtering
            const response = await fetch(`${api}/api/users?role=${encodeURIComponent(targetRole)}`, { 
              headers: hdrs, 
              credentials: 'include' 
            });
            
            if (response.ok) {
              const data = await response.json();
              const allUsers = Array.isArray(data) ? data : (data?.users || data?.records || data?.data || []);
              userList = allUsers.filter(user => 
                user.role === targetRole && 
                (user.status === 'active' || user.status === undefined)
              );
            }
          } catch (err) {
            console.warn('Users endpoint error:', err.message);
          }
        }
        
        // Final fallback: get all users and filter client-side
        if (userList.length === 0) {
          try {
            const response = await fetch(`${api}/api/users`, { 
              headers: hdrs, 
              credentials: 'include' 
            });
            
            if (response.ok) {
              const data = await response.json();
              const allUsers = Array.isArray(data) ? data : (data?.users || data?.records || data?.data || []);
              userList = allUsers.filter(user => {
                const userRole = user.role?.toLowerCase();
                const targetRoleLower = targetRole.toLowerCase();
                return userRole === targetRoleLower && 
                       (user.status === 'active' || user.status === undefined);
              });
            }
          } catch (err) {
            console.warn('Fallback users endpoint error:', err.message);
          }
        }
        
        setEmployees(userList);
        
        if (userList.length === 0) {
          const groupName = form.group === 'lab' ? 'Lab Staff' : 
                           form.group === 'delivery' ? 'Delivery Staff' : 
                           form.group === 'accountant' ? 'Accountant' : 'Staff';
          setError(`No active ${groupName} found. Please add employees with role "${targetRole}" first.`);
        }
      } catch (e) {
        console.error('Error loading employees:', e);
        setError(e?.message || 'Failed to load employees');
        setEmployees([]);
      }

      };
      
      loadUsers();
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount or dependency change
    return () => clearTimeout(timeoutId);

    };
    
    loadUsers();

  }, [form.group]);

  // If group is accountant and employees loaded, auto-select the first employee when none chosen
  useEffect(() => {
    if (form.group === 'accountant' && !form.workerId && employees.length > 0) {
      setForm(s => ({ ...s, workerId: employees[0]._id }));
    }
  }, [employees, form.group, form.workerId]);

  const calculate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError(''); setResult(null);
      const res = await fetch(`${base}/api/daily-wage/calculate/${form.workerId}?year=${form.year}&month=${form.month}`, { headers });
      if (!res.ok) throw new Error(`Calculation failed (${res.status})`);
      const data = await res.json();
      setResult(data?.data || data);
      setAdvance(0);
    } catch (e2) { setError(e2?.message || 'Calculation failed'); }
    finally { setLoading(false); }
  };

  // Build payslip objects
  const buildCalculatedPayslip = () => {
    const workingDaysCalc = Number(result?.month?.workingDays ?? result?.workingDays ?? 0) || 0;
    const dailyWageCalc = Number(result?.worker?.dailyWage ?? 0) || 0;
    const grossSystem = Number(result?.month?.grossSalary ?? result?.grossSalary ?? 0) || 0;
    const gross = form.group === 'delivery' ? (workingDaysCalc * dailyWageCalc) : grossSystem;
    const pending = Math.max(0, gross - (Number(advance) || 0));
    return {
      workerId: form.workerId,
      group: form.group,
      year: Number(form.year),
      month: Number(form.month),
      source: 'calculated',
      workingDays: workingDaysCalc,
      dailyWage: dailyWageCalc,
      grossSalary: gross,
      salaryAdvance: Number(advance) || 0,
      netPay: pending,
      days: result?.days || result?.month?.days || [],
    };
  };

  const buildManualPayslip = () => {
    const basePay = (Number(manual.workingDays)||0) * (Number(manual.dailyWage)||0);
    const otPayRaw = (Number(manual.overtimeHours)||0) * (Number(manual.overtimeRate)||0);
    const bonusRaw = Number(manual.bonus)||0;
    const otPay = form.group === 'delivery' ? 0 : otPayRaw;
    const bonus = form.group === 'delivery' ? 0 : bonusRaw;
    const gross = basePay + otPay + bonus;
    const net = Math.max(0, gross - (Number(manual.deductions)||0) - (Number(manual.advance)||0));
    return {
      workerId: form.workerId || null,
      group: form.group,
      year: Number(form.year),
      month: Number(form.month),
      source: 'manual',
      workingDays: Number(manual.workingDays)||0,
      dailyWage: Number(manual.dailyWage)||0,
      overtimeHours: form.group === 'delivery' ? 0 : (Number(manual.overtimeHours)||0),
      overtimeRate: form.group === 'delivery' ? 0 : (Number(manual.overtimeRate)||0),
      bonus: form.group === 'delivery' ? 0 : (Number(manual.bonus)||0),
      deductions: Number(manual.deductions)||0,
      salaryAdvance: Number(manual.advance)||0,
      grossSalary: gross,
      netPay: net,
    };
  };

  const savePayslip = async (payload) => {
    try {
      setSaveMsg(''); setError('');
      const res = await fetch(`${base}/api/wages/payslips`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);

      
      const savedData = await res.json();
      setSaveMsg('Payslip saved.');
      
      // Send salary notification to staff
      try {
        const notificationPayload = {
          staffId: payload.workerId,
          salaryData: {
            _id: savedData.data?._id || savedData._id,
            grossSalary: payload.grossSalary,
            netSalary: payload.netPay,
            workingDays: payload.workingDays,
            deductions: (payload.grossSalary || 0) - (payload.netPay || 0)
          },
          month: payload.month,
          year: payload.year
        };
        
        await fetch(`${base}/api/salary-notifications/send`, {
          method: 'POST',
          headers,
          body: JSON.stringify(notificationPayload)
        });
        
        setSaveMsg('Payslip saved and notification sent to staff.');
      } catch (notificationError) {
        console.warn('Failed to send salary notification:', notificationError);
        setSaveMsg('Payslip saved (notification failed to send).');
      }
      

      setSaveMsg('Payslip saved.');

    } catch (e) {
      const msg = e?.message || 'Failed to save payslip';
      // Improve visibility if backend route is missing
      if (/\(404\)/.test(msg)) setError('Save failed (404): Missing backend route POST /api/wages/payslips');
      else setError(msg);
    }
  };

  const exportCsv = (rows, filename = 'payslip.csv') => {
    const headers = Object.keys(rows[0] || {});
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  };

  const exportPdf = (title, payload) => {
    const doc = new jsPDF();
    let y = 16;
    doc.setFontSize(16); doc.text(title, 14, y); y += 8; doc.setFontSize(11);
    Object.entries(payload).forEach(([k,v]) => { if (v !== undefined) { doc.text(`${k}: ${Array.isArray(v) ? JSON.stringify(v).slice(0,80) : v}`, 14, y); y += 6; if (y > 280) { doc.addPage(); y = 16; } }});
    doc.save(`${title.replace(/\s+/g,'_').toLowerCase()}.pdf`);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: 0 }}>Wages from Attendance</h2>
      <form onSubmit={calculate} style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', alignItems:'end', marginTop: 16 }}>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Employee Type</span>
          <select value={form.group} onChange={(e)=>setForm(s=>({ ...s, group: e.target.value, workerId: '' }))} 
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }}>
            <option value="field">Staff</option>
            <option value="lab">Lab Staff</option>
            <option value="delivery">Delivery Staff</option>
            <option value="accountant">Accountant</option>
          </select>
        </label>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Employee</span>
          <select value={form.workerId} onChange={(e)=>setForm(s=>({ ...s, workerId: e.target.value }))} required
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }}>
            <option value="" disabled>Select employee</option>
            {employees.map(u => (
              <option key={u._id} value={u._id}>
                {(u.staffId || u.staff_id || '').toUpperCase() || ''} {u.name ? `- ${u.name}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Year</span>
          <input type="number" min={2025} max={2100} value={form.year} onChange={(e)=>setForm(s=>({ ...s, year: e.target.value }))} required 
                 style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }} />
        </label>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Month</span>
          <select
            value={form.month}
            onChange={(e)=>setForm(s=>({ ...s, month: Number(e.target.value) }))}
            required
            style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }}
          >
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
        </label>
        <div style={{ display:'flex', alignItems:'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Calculating...' : 'Calculate'}</button>
        </div>
      </form>

      {error && <div style={{ color:'tomato', marginTop: 8 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 16 }}>
          <div className="dash-card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Summary</h3>
            {(() => {
              const wd = Number(result.month?.workingDays ?? result.workingDays ?? 0) || 0;
              const dw = Number(result.worker?.dailyWage ?? 0) || 0;
              const grossSystem = Number(result.month?.grossSalary ?? result.grossSalary ?? 0) || 0;
              const grossShown = form.group === 'delivery' ? (wd * dw) : grossSystem;
              return (
                <>
                  <div>Working Days: <b>{wd}</b></div>
                  <div>Daily Wage: <b>{dw}</b></div>
                  <div>Gross Salary: <b>{grossShown}</b></div>
                </>
              );
            })()}
            <div style={{ marginTop: 8 }}>
              <label>Salary Advance</label><br />
              <input type="number" min={0} step="0.01" value={advance} onChange={(e)=>setAdvance(Number(e.target.value || 0))} />
            </div>
            {(() => {
              const wd = Number(result.month?.workingDays ?? result.workingDays ?? 0) || 0;
              const dw = Number(result.worker?.dailyWage ?? 0) || 0;
              const grossSystem = Number(result.month?.grossSalary ?? result.grossSalary ?? 0) || 0;
              const gross = form.group === 'delivery' ? (wd * dw) : grossSystem;
              const pending = Math.max(0, gross - (Number(advance) || 0));
              return (
                <>
                  <div style={{ marginTop: 8 }}>Pending Amount: <b>{pending.toFixed(2)}</b></div>
                  <div style={{ marginTop: 12, display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button type="button" className="btn" onClick={()=>savePayslip(buildCalculatedPayslip())}>Save Payslip</button>
                    <button type="button" className="btn btn-outline" onClick={()=>exportCsv([buildCalculatedPayslip()], 'calculated_payslip.csv')}>Export CSV</button>
                    <button type="button" className="btn btn-outline" onClick={()=>exportPdf('Calculated Payslip', buildCalculatedPayslip())}>Export PDF</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Manual Calculator */}
      <div style={{ marginTop: 16 }}>
        <div className="dash-card" style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Manual Calculator</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Working Days</span>
              <input type="number" min={0} step="1" value={manual.workingDays}
                     onChange={(e)=>setManual(m=>({ ...m, workingDays: Number(e.target.value || 0) }))}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Daily Wage</span>
              <input type="number" min={0} step="0.01" value={manual.dailyWage}
                     onChange={(e)=>setManual(m=>({ ...m, dailyWage: Number(e.target.value || 0) }))}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Overtime Hours</span>
              <input type="number" min={0} step="0.1" value={manual.overtimeHours}
                     onChange={(e)=>setManual(m=>({ ...m, overtimeHours: Number(e.target.value || 0) }))}
                     disabled={form.group==='delivery'}
                     title={form.group==='delivery' ? 'Overtime disabled for Delivery Staff' : ''}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Overtime Rate (per hour)</span>
              <input type="number" min={0} step="0.01" value={manual.overtimeRate}
                     onChange={(e)=>setManual(m=>({ ...m, overtimeRate: Number(e.target.value || 0) }))}
                     disabled={form.group==='delivery'}
                     title={form.group==='delivery' ? 'Overtime disabled for Delivery Staff' : ''}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Bonus</span>
              <input type="number" min={0} step="0.01" value={manual.bonus}
                     onChange={(e)=>setManual(m=>({ ...m, bonus: Number(e.target.value || 0) }))}
                     disabled={form.group==='delivery'}
                     title={form.group==='delivery' ? 'Bonus disabled for Delivery Staff' : ''}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Deductions</span>
              <input type="number" min={0} step="0.01" value={manual.deductions}
                     onChange={(e)=>setManual(m=>({ ...m, deductions: Number(e.target.value || 0) }))}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }} />
            </label>
            <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <span style={{ color:'#334155', fontWeight:600 }}>Salary Advance</span>
              <input type="number" min={0} step="0.01" value={manual.advance}
                     onChange={(e)=>setManual(m=>({ ...m, advance: Number(e.target.value || 0) }))}
                     style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff' }} />
            </label>
          </div>
          {(() => {
            const base = (Number(manual.workingDays)||0) * (Number(manual.dailyWage)||0);
            const ot = form.group==='delivery' ? 0 : ((Number(manual.overtimeHours)||0) * (Number(manual.overtimeRate)||0));
            const bonus = form.group==='delivery' ? 0 : (Number(manual.bonus)||0);
            const gross = base + ot + bonus;
            const net = Math.max(0, gross - (Number(manual.deductions)||0) - (Number(manual.advance)||0));
            return (
              <div style={{ marginTop: 12, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
                <div><div style={{ color:'#64748b', fontSize:12 }}>Base Pay</div><div style={{ fontWeight:700 }}>{base.toFixed(2)}</div></div>
                <div><div style={{ color:'#64748b', fontSize:12 }}>Overtime Pay</div><div style={{ fontWeight:700 }}>{ot.toFixed(2)}</div></div>
                <div><div style={{ color:'#64748b', fontSize:12 }}>Gross</div><div style={{ fontWeight:700 }}>{gross.toFixed(2)}</div></div>
                <div><div style={{ color:'#64748b', fontSize:12 }}>Net Pay</div><div style={{ fontWeight:700 }}>{net.toFixed(2)}</div></div>
                <div style={{ gridColumn:'1 / -1', display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button type="button" className="btn" onClick={()=>savePayslip(buildManualPayslip())}>Save Payslip</button>
                  <button type="button" className="btn btn-outline" onClick={()=>exportCsv([buildManualPayslip()], 'manual_payslip.csv')}>Export CSV</button>
                  <button type="button" className="btn btn-outline" onClick={()=>exportPdf('Manual Payslip', buildManualPayslip())}>Export PDF</button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      {saveMsg && <div style={{ color:'limegreen', marginTop: 8 }}>{saveMsg}</div>}

      {/* Day-level breakdown if available from API */}
      {result?.days?.length || result?.month?.days?.length ? (
        <div style={{ marginTop: 16, overflowX:'auto' }}>
          <div className="dash-card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Day-level Breakdown</h3>
            <table className="dashboard-table" style={{ minWidth: 640 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Hours</th>
                  <th>OT Hours</th>
                </tr>
              </thead>
              <tbody>
                {(result.days || result.month?.days || []).map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.date ? new Date(d.date).toLocaleDateString() : '-'}</td>
                    <td>{d.status || d.type || '-'}</td>
                    <td>{d.hours ?? '-'}</td>
                    <td>{d.overtimeHours ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ManagerWages;


