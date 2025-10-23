import React, { useEffect, useMemo, useState, useCallback } from 'react';

const LabSalary = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }, []);

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMonthly = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true); setError(''); setRecord(null);
    try {
      // Reuse salary history endpoint and pick the month OR support direct monthly endpoint if available
      const res = await fetch(`${base}/api/salary/history/${user._id}?year=${year}&limit=12`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Load failed (${res.status})`);
      const data = await res.json();
      const list = data?.data || [];
      const r = list.find(x => Number(x.month) === Number(month));
      setRecord(r || null);
    } catch (e) {
      setError(e?.message || 'Failed to load salary');
    } finally { setLoading(false); }
  }, [base, token, user, year, month]);

  useEffect(() => { loadMonthly(); }, [loadMonthly]);

  const downloadSlip = async (rec) => {
    if (!rec) return;
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 16;
    doc.setFontSize(16); doc.text('HOLY FAMILY POLYMERS', 14, y); y += 8;
    doc.setFontSize(14); doc.text('Lab Staff Salary Slip', 14, y); y += 12;
    doc.setFontSize(10);
    doc.text(`Employee: ${rec.staff?.name || user?.name || ''}`, 14, y); y += 6;
    doc.text(`ID: ${rec.staff?.staffId || user?.staffId || ''}`, 14, y); y += 6;
    doc.text(`Month: ${new Date(rec.year, rec.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, y); y += 10;
    doc.setFontSize(12); doc.text('Summary', 14, y); y += 8; doc.setFontSize(10);
    const rows = [
      ['Basic', rec.basicSalary],
      ['Gross', rec.grossSalary],
      ['Net', rec.netSalary],
      ['Status', (rec.status || '').toUpperCase()],
    ];
    rows.forEach(([k,v]) => { doc.text(`${k}:`, 20, y); doc.text(`${v ?? '-'}`, 80, y); y += 6; });
    doc.save(`lab_salary_${rec.year}_${rec.month}.pdf`);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin: 0 }}>My Salary (Lab)</h2>
        <button className="btn" onClick={loadMonthly} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>

      <form onSubmit={(e)=>{ e.preventDefault(); loadMonthly(); }} style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', marginTop: 12 }}>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Year</span>
          <input type="number" min={2000} max={2100} value={year} onChange={(e)=>setYear(Number(e.target.value || now.getFullYear()))} 
                 style={{ padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }} />
        </label>
        <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <span style={{ color:'#334155', fontWeight:600 }}>Month</span>
          <input type="number" min={1} max={12} value={month} onChange={(e)=>setMonth(Number(e.target.value || (now.getMonth()+1)))} 
                 style={{ padding:'10px 12px', border:'1px solid #e5e7eb', borderRadius:8 }} />
        </label>
        <div style={{ display:'flex', alignItems:'flex-end' }}>
          <button type="submit" className="btn btn-primary">View</button>
        </div>
      </form>

      {error && <div style={{ color:'tomato', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 16 }}>
        {!record && !loading ? (
          <div className="dash-card" style={{ padding: 16 }}>
            <div style={{ color:'#64748b' }}>No salary record found for the selected month.</div>
          </div>
        ) : null}
        {record && (
          <div className="dash-card" style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>{new Date(record.year, record.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
              <div>
                <div style={{ color:'#64748b', fontSize:12 }}>Basic Salary</div>
                <div style={{ fontWeight:700 }}>{record.basicSalary ?? '-'}</div>
              </div>
              <div>
                <div style={{ color:'#64748b', fontSize:12 }}>Gross Salary</div>
                <div style={{ fontWeight:700 }}>{record.grossSalary ?? '-'}</div>
              </div>
              <div>
                <div style={{ color:'#64748b', fontSize:12 }}>Net Salary</div>
                <div style={{ fontWeight:700 }}>{record.netSalary ?? '-'}</div>
              </div>
              <div>
                <div style={{ color:'#64748b', fontSize:12 }}>Status</div>
                <div style={{ fontWeight:700 }}>{(record.status || '').toUpperCase()}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display:'flex', gap:8, flexWrap:'wrap' }}>
              <button type="button" className="btn btn-outline" onClick={()=>downloadSlip(record)}>Download PDF</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabSalary;
