import React, { useEffect, useState } from 'react';

const AdminAttendanceReport = () => {
  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState([]);

  const load = async () => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`${base}/api/workers/attendance?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setRows(await res.json());
  };

  useEffect(() => { load(); }, []);

  const downloadCsv = () => {
    const header = ['Name','Email','Date','CheckIn','CheckOut','Late','Verified'];
    const lines = rows.map(r => [
      r.staff?.name || '',
      r.staff?.email || '',
      r.date ? new Date(r.date).toLocaleDateString() : '',
      r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '',
      r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '',
      r.isLate ? 'Yes' : 'No',
      r.verified ? 'Yes' : 'No'
    ].join(','));
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Attendance Report', 14, 16);
    let y = 24;
    const header = ['Name','Email','Date','In','Out','Late','Verified'];
    doc.text(header.join(' | '), 14, y);
    y += 6;
    rows.forEach((r) => {
      const line = [
        r.staff?.name || '',
        r.staff?.email || '',
        r.date ? new Date(r.date).toLocaleDateString() : '',
        r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : '',
        r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : '',
        r.isLate ? 'Yes' : 'No',
        r.verified ? 'Yes' : 'No'
      ].join(' | ');
      doc.text(line, 14, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 16; }
    });
    doc.save('attendance_report.pdf');
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Attendance Report</h2>
      <div style={{ display:'flex', gap:12, marginTop: 12 }}>
        <input type="date" className="form-control" value={from} onChange={(e)=>setFrom(e.target.value)} />
        <input type="date" className="form-control" value={to} onChange={(e)=>setTo(e.target.value)} />
        <button className="btn btn-primary" onClick={load}>Filter</button>
        <button className="btn btn-outline-secondary" onClick={downloadCsv}>Download CSV</button>
        <button className="btn btn-outline-secondary" onClick={downloadPdf}>Download PDF</button>
      </div>
      <div className="table-responsive" style={{ marginTop: 12 }}>
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Late</th><th>Verified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>{r.staff?.name || ''}</td>
                <td>{r.staff?.email || ''}</td>
                <td>{r.date ? new Date(r.date).toLocaleDateString() : ''}</td>
                <td>{r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : ''}</td>
                <td>{r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : ''}</td>
                <td>{r.isLate ? 'Yes' : 'No'}</td>
                <td>{r.verified ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7}>No records</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendanceReport;


