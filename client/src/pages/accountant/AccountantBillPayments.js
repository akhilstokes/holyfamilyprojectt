import React, { useEffect, useMemo, useState } from 'react';
import { fetchLatexRequests, updateLatexRequestAdmin } from '../../services/accountantService';
import { useConfirm } from '../../components/common/ConfirmDialog';

const AccountantBillPayments = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('VERIFIED'); // VERIFIED | paid | ACCOUNT_CALCULATED | TEST_COMPLETED | all
  const [q, setQ] = useState('');
  const todayStr = new Date().toISOString().slice(0,10);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateError, setDateError] = useState('');
  const [showSummary, setShowSummary] = useState(true);
  const confirm = useConfirm();

  const load = async () => {
    setLoading(true); setError('');
    try {
      const list = await fetchLatexRequests({ status: status === 'all' ? undefined : status, limit: 200 });
      setRows(list);
    } catch (e) {
      setError('Failed to load payments');
    } finally { setLoading(false); }
  };

  useEffect(() => { load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const markPaid = async (id) => {
    const ok = await confirm('Confirm Payment', 'Mark this bill as paid?');
    if (!ok) return;
    try {
      await updateLatexRequestAdmin(id, { status: 'paid' });
      await load();
    } catch (e) {
      setError('Failed to mark paid');
    }
  };

  const filtered = useMemo(()=>{
    let arr = rows || [];
    // validate date range
    setDateError('');
    if (from && to) {
      const f = new Date(from);
      const t = new Date(to);
      if (t < f) {
        setDateError('To date cannot be earlier than From date.');
        return [];
      }
    }
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter(r => (r.user?.name||'').toLowerCase().includes(t) || (r.overrideBuyerName||'').toLowerCase().includes(t));
    }
    if (from) {
      const f = new Date(from);
      arr = arr.filter(r => new Date(r.verifiedAt || r.updatedAt || r.createdAt) >= f);
    }
    if (to) {
      const t2 = new Date(to + 'T23:59:59.999Z');
      arr = arr.filter(r => new Date(r.verifiedAt || r.updatedAt || r.createdAt) <= t2);
    }
    return arr;
  }, [rows, q, from, to]);

  const totalAmount = useMemo(()=> filtered.reduce((s, r)=> s + (Number(r.finalPayment || r.calculatedAmount) || 0), 0), [filtered]);

  // Summary statistics
  const summary = useMemo(() => {
    const totalQty = filtered.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
    const avgDRC = filtered.length > 0 
      ? filtered.reduce((s, r) => s + (Number(r.drcPercentage) || 0), 0) / filtered.length 
      : 0;
    const avgRate = filtered.length > 0
      ? filtered.reduce((s, r) => s + (Number(r.marketRate) || 0), 0) / filtered.length
      : 0;
    
    // Group by buyer
    const byBuyer = {};
    filtered.forEach(r => {
      const buyer = r.overrideBuyerName || r.user?.name || 'Unknown';
      if (!byBuyer[buyer]) {
        byBuyer[buyer] = { count: 0, amount: 0, qty: 0 };
      }
      byBuyer[buyer].count++;
      byBuyer[buyer].amount += Number(r.finalPayment || r.calculatedAmount) || 0;
      byBuyer[buyer].qty += Number(r.quantity) || 0;
    });

    return { totalQty, avgDRC, avgRate, byBuyer };
  }, [filtered]);

  // Export to CSV
  const exportToCSV = () => {
    if (filtered.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Buyer', 'Quantity (L)', 'DRC %', 'Rate', 'Final Amount', 'Invoice Number', 'Status'];
    const csvRows = [headers.join(',')];

    filtered.forEach(r => {
      const row = [
        new Date(r.verifiedAt || r.updatedAt || r.createdAt).toLocaleDateString(),
        `"${r.overrideBuyerName || r.user?.name || '-'}"`,
        r.quantity ?? '',
        r.drcPercentage ?? '',
        r.marketRate ?? '',
        r.finalPayment ?? r.calculatedAmount ?? '',
        r.invoiceNumber || '',
        r.status || ''
      ];
      csvRows.push(row.join(','));
    });

    // Add summary
    csvRows.push('');
    csvRows.push('Summary');
    csvRows.push(`Total Records,${filtered.length}`);
    csvRows.push(`Total Amount,${totalAmount}`);
    csvRows.push(`Total Quantity (L),${summary.totalQty.toFixed(2)}`);
    csvRows.push(`Average DRC %,${summary.avgDRC.toFixed(2)}`);
    csvRows.push(`Average Rate,${summary.avgRate.toFixed(2)}`);

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-payments-${status}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Payments Report - ${status}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #0f4c75; border-bottom: 2px solid #0f4c75; padding-bottom: 10px; }
          .header { margin-bottom: 20px; }
          .header p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #0f4c75; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .summary { margin-top: 30px; background: #f9f9f9; padding: 15px; border-radius: 5px; }
          .summary h3 { margin-top: 0; color: #0f4c75; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
          .summary-item { padding: 10px; background: white; border-radius: 3px; }
          .summary-item strong { display: block; color: #666; font-size: 12px; }
          .summary-item span { display: block; font-size: 18px; color: #0f4c75; margin-top: 5px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Bill Payments Report</h1>
        <div class="header">
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          ${from || to ? `<p><strong>Date Range:</strong> ${from || 'Beginning'} to ${to || 'Present'}</p>` : ''}
          ${q ? `<p><strong>Buyer Filter:</strong> ${q}</p>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Qty (L)</th>
              <th>DRC %</th>
              <th>Rate</th>
              <th>Final Amount</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(r => `
              <tr>
                <td>${new Date(r.verifiedAt || r.updatedAt || r.createdAt).toLocaleDateString()}</td>
                <td>${r.overrideBuyerName || r.user?.name || '-'}</td>
                <td>${r.quantity ?? '-'}</td>
                <td>${r.drcPercentage ?? '-'}</td>
                <td>${r.marketRate ?? '-'}</td>
                <td>${r.finalPayment ?? r.calculatedAmount ?? '-'}</td>
                <td>${r.invoiceNumber || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3>Summary</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>Total Records</strong>
              <span>${filtered.length}</span>
            </div>
            <div class="summary-item">
              <strong>Total Amount</strong>
              <span>₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-item">
              <strong>Total Quantity</strong>
              <span>${summary.totalQty.toFixed(2)} L</span>
            </div>
            <div class="summary-item">
              <strong>Average DRC</strong>
              <span>${summary.avgDRC.toFixed(2)}%</span>
            </div>
            <div class="summary-item">
              <strong>Average Rate</strong>
              <span>₹${summary.avgRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <h2>Bill Payments {status === 'paid' && '- Payment History'}</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button 
            className="btn" 
            onClick={exportToCSV} 
            disabled={loading || filtered.length === 0}
            style={{ background:'#10b981', borderColor:'#10b981' }}
          >
            📊 Export CSV
          </button>
          <button 
            className="btn" 
            onClick={handlePrint} 
            disabled={loading || filtered.length === 0}
            style={{ background:'#6366f1', borderColor:'#6366f1' }}
          >
            🖨️ Print
          </button>
          <button className="btn" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>
      {error && <div style={{ color:'tomato', marginTop:8 }}>{error}</div>}
      
      <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:12, flexWrap:'wrap' }}>
        <label style={{ fontWeight:'500' }}>Status
          <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{ marginLeft:6 }}>
            <option value="VERIFIED">✓ Verified (Pending Payment)</option>
            <option value="paid">💰 Paid (History)</option>
            <option value="ACCOUNT_CALCULATED">🧮 Calculated</option>
            <option value="TEST_COMPLETED">🧪 Test Completed</option>
            <option value="all">📋 All</option>
          </select>
        </label>
        <label>From <input type="date" value={from} max={to || undefined} onChange={(e)=>{
          const v = e.target.value;
          setFrom(v);
          if (to && v && new Date(to) < new Date(v)) setTo(v);
        }} /></label>
        <label>To <input type="date" value={to} min={from || undefined} onChange={(e)=>{
          const v = e.target.value;
          setTo(v);
        }} /></label>
        <input placeholder="🔍 Search buyer" value={q} onChange={(e)=>setQ(e.target.value)} style={{ width:220 }} />
      </div>
      {dateError && <div style={{ color:'tomato', marginTop:6 }}>{dateError}</div>}

      {/* Summary Section */}
      {filtered.length > 0 && showSummary && (
        <div style={{
          marginTop: 16,
          padding: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          color: 'white'
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:18 }}>📊 Summary Statistics</h3>
            <button 
              onClick={() => setShowSummary(false)} 
              style={{ 
                background:'rgba(255,255,255,0.2)', 
                border:'none', 
                color:'white', 
                padding:'4px 12px',
                borderRadius:4,
                cursor:'pointer'
              }}
            >
              Hide
            </button>
          </div>
          <div style={{ 
            display:'grid', 
            gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', 
            gap:12 
          }}>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Total Records</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>{filtered.length}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Total Amount</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>₹{totalAmount.toFixed(2)}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Total Quantity</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>{summary.totalQty.toFixed(2)} L</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Avg DRC</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>{summary.avgDRC.toFixed(2)}%</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Avg Rate</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>₹{summary.avgRate.toFixed(2)}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:12, opacity:0.9 }}>Unique Buyers</div>
              <div style={{ fontSize:24, fontWeight:'bold', marginTop:4 }}>{Object.keys(summary.byBuyer).length}</div>
            </div>
          </div>
          
          {/* Top Buyers */}
          {Object.keys(summary.byBuyer).length > 0 && (
            <div style={{ marginTop:16, background:'rgba(255,255,255,0.1)', padding:12, borderRadius:6 }}>
              <div style={{ fontSize:14, fontWeight:'bold', marginBottom:8 }}>Top Buyers</div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                {Object.entries(summary.byBuyer)
                  .sort((a, b) => b[1].amount - a[1].amount)
                  .slice(0, 5)
                  .map(([buyer, data]) => (
                    <div key={buyer} style={{ 
                      background:'rgba(255,255,255,0.15)', 
                      padding:'8px 12px', 
                      borderRadius:4,
                      fontSize:12 
                    }}>
                      <div style={{ fontWeight:'bold' }}>{buyer}</div>
                      <div style={{ opacity:0.9 }}>₹{data.amount.toFixed(2)} ({data.count} bills)</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {filtered.length > 0 && !showSummary && (
        <button 
          onClick={() => setShowSummary(true)}
          style={{
            marginTop:12,
            padding:'8px 16px',
            background:'#667eea',
            color:'white',
            border:'none',
            borderRadius:6,
            cursor:'pointer'
          }}
        >
          📊 Show Summary
        </button>
      )}
      <div style={{ marginTop: 12, overflowX: 'auto' }}>
        <table className="dashboard-table" style={{ minWidth: 780 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer</th>
              <th>Qty (L)</th>
              <th>DRC%</th>
              <th>Rate</th>
              <th>Final Amount</th>
              <th>Invoice</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r._id} style={{ 
                background: r.status === 'paid' ? '#f0fdf4' : 'transparent' 
              }}>
                <td>{new Date(r.verifiedAt || r.updatedAt || r.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight:500 }}>{r.overrideBuyerName || r.user?.name || '-'}</td>
                <td>{r.quantity ?? '-'}</td>
                <td>{r.drcPercentage ?? '-'}</td>
                <td>₹{r.marketRate ?? '-'}</td>
                <td style={{ fontWeight:'bold', color:'#0f4c75' }}>₹{r.finalPayment ?? r.calculatedAmount ?? '-'}</td>
                <td>{r.invoiceNumber ? (
                  <a 
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/latex/invoice/${r._id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color:'#0f4c75', textDecoration:'underline' }}
                  >
                    {r.invoiceNumber}
                  </a>
                ) : '-'}</td>
                <td>
                  {r.status === 'paid' && <span style={{ 
                    background:'#10b981', 
                    color:'white', 
                    padding:'4px 8px', 
                    borderRadius:4, 
                    fontSize:12,
                    fontWeight:'bold'
                  }}>✓ Paid</span>}
                  {r.status === 'VERIFIED' && <span style={{ 
                    background:'#f59e0b', 
                    color:'white', 
                    padding:'4px 8px', 
                    borderRadius:4, 
                    fontSize:12,
                    fontWeight:'bold'
                  }}>⏳ Pending</span>}
                  {r.status === 'ACCOUNT_CALCULATED' && <span style={{ 
                    background:'#3b82f6', 
                    color:'white', 
                    padding:'4px 8px', 
                    borderRadius:4, 
                    fontSize:12
                  }}>Calculated</span>}
                  {r.status === 'TEST_COMPLETED' && <span style={{ 
                    background:'#8b5cf6', 
                    color:'white', 
                    padding:'4px 8px', 
                    borderRadius:4, 
                    fontSize:12
                  }}>Tested</span>}
                </td>
                <td>
                  {r.status === 'VERIFIED' ? (
                    <button className="btn" onClick={() => markPaid(r._id)}>Mark Paid</button>
                  ) : r.status === 'paid' ? (
                    <span style={{ color:'#10b981', fontWeight:'bold' }}>✓ Completed</span>
                  ) : (
                    <span style={{ color:'#6b7280' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={9} style={{ textAlign:'center', color:'#6b7280', padding:32 }}>
                  {status === 'paid' ? (
                    <div>
                      <div style={{ fontSize:48, marginBottom:8 }}>📭</div>
                      <div style={{ fontSize:16, fontWeight:'bold' }}>No payment history found</div>
                      <div style={{ fontSize:14, marginTop:4 }}>Try adjusting your date range or filters</div>
                    </div>
                  ) : status === 'VERIFIED' ? (
                    <div>
                      <div style={{ fontSize:48, marginBottom:8 }}>✅</div>
                      <div style={{ fontSize:16, fontWeight:'bold' }}>No verified bills pending</div>
                      <div style={{ fontSize:14, marginTop:4 }}>All bills have been processed</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize:48, marginBottom:8 }}>📄</div>
                      <div style={{ fontSize:16, fontWeight:'bold' }}>No bills found</div>
                      <div style={{ fontSize:14, marginTop:4 }}>No records match your current filters</div>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantBillPayments;
