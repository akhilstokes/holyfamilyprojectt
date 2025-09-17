import React, { useEffect, useMemo, useState } from 'react';
import { createSalesEntry, getSalesPrediction, getSalesYearlySummary, listMySales } from '../../services/storeService';

const width = 640;
const height = 240;
const padding = 32;

function LineChart({ points }) {
  if (!points || points.length === 0) return <svg width={width} height={height}></svg>;
  const maxY = Math.max(...points.map(p => p.y), 1);
  const maxX = Math.max(...points.map(p => p.x), 12);
  const sx = (x) => padding + (x - 1) * ((width - padding * 2) / (maxX - 1));
  const sy = (y) => height - padding - (y) * ((height - padding * 2) / maxY);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`).join(' ');
  return (
    <svg width={width} height={height}>
      <path d={d} stroke="#2b6cb0" fill="none" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#2b6cb0" />
      ))}
      {[1,3,5,7,9,11].map(m => (
        <text key={m} x={sx(m)} y={height - padding + 14} fontSize="10" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

const SalesPage = () => {
  const [form, setForm] = useState({ date: '', amount: '', notes: '' });
  const [year, setYear] = useState(new Date().getFullYear());
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const monthlyPoints = useMemo(() => {
    const map = new Map(summary.map(r => [r.month, r.total]));
    return Array.from({ length: 12 }, (_, i) => ({ x: i + 1, y: Number(map.get(i + 1) || 0) }));
  }, [summary]);

  const load = async (y) => {
    setLoading(true);
    try {
      const [l, s, p] = await Promise.all([
        listMySales({ year: y }),
        getSalesYearlySummary(y),
        getSalesPrediction(y),
      ]);
      setList(l);
      setSummary(s);
      setPrediction(p);
    } catch (e) {
      setMessage('Failed to load sales');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(year); }, [year]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { date: form.date, amount: Number(form.amount), notes: form.notes };
      if (!payload.date || Number.isNaN(payload.amount)) {
        setMessage('Provide date and amount');
        return;
      }
      await createSalesEntry(payload);
      setForm({ date: '', amount: '', notes: '' });
      await load(year);
    } catch (e) {
      setMessage(e?.message || 'Failed to create');
    }
  };

  return (
    <div>
      <h3>Sales</h3>
      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 520, marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-group"><label>Date</label><input type="date" name="date" value={form.date} onChange={onChange} className="form-control" /></div>
          <div className="form-group"><label>Amount</label><input type="number" step="0.01" name="amount" value={form.amount} onChange={onChange} className="form-control" /></div>
          <div className="form-group"><label>Notes</label><input name="notes" value={form.notes} onChange={onChange} className="form-control" /></div>
          <button className="btn btn-primary" type="submit">Add</button>
        </div>
      </form>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>Year</label>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="form-control" style={{ width: 120 }} />
          </div>
          <LineChart points={monthlyPoints} />
          {prediction && prediction.predictedNextYearTotal != null && (
            <div>Predicted next year total: <strong>{prediction.predictedNextYearTotal}</strong></div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">Entries</div>
        <div className="card-body">
          {loading ? 'Loading...' : (
            <ul>
              {list.map((it) => (
                <li key={it._id}>{new Date(it.date).toLocaleDateString()} — {it.amount}</li>
              ))}
            </ul>
          )}
          {message && <div style={{ marginTop: 8 }}>{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default SalesPage;


