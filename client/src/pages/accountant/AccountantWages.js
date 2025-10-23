import React, { useEffect, useState } from 'react';
import { listDailyWageWorkers, calcMonthlySalary, getSalarySummary } from '../../services/accountantService';

export default function AccountantWages() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const list = await listDailyWageWorkers({ limit: 100 });
      setWorkers(list);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWorkers(); }, []);

  const runCalc = async (w) => {
    setSelected(w);
    setResult(null);
    const ok = window.confirm(`Auto-calculate wages for ${w.name}?`);
    if (!ok) return;
    const data = await calcMonthlySalary(w._id || w.id, { year, month });
    const summary = await getSalarySummary(w._id || w.id, { year, month });
    setResult({ calc: data, summary });
  };

  return (
    <div>
      <h2>Auto-calculate Wages</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ width: 100 }} />
        <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} style={{ width: 70 }} />
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Daily Wage</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => (
                <tr key={w._id || w.id}>
                  <td>{w.name}</td>
                  <td>{w.dailyWage ?? '-'}</td>
                  <td><button className="btn" onClick={() => runCalc(w)}>Calculate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && result && (
        <div style={{ marginTop: 16 }}>
          <h3>Result: {selected.name}</h3>
          <pre style={{ background: '#f7f7f7', padding: 12, borderRadius: 6 }}>
{JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
