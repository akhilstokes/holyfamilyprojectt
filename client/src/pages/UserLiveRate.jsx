// client/src/pages/UserLiveRate.jsx
import React, { useEffect, useState } from 'react';
import { getHistory, exportCsv, exportPdf } from '../services/dailyRateService';
import { getPublishedLatest } from '../services/rateService';
import './UserLiveRate.css';

export default function UserLiveRate() {
  const category = 'LATEX60';
  const [rate, setRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [drc, setDrc] = useState(''); // optional DRC for calculator handoff
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loadingHist, setLoadingHist] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const normalize = (rec) => {
    if (!rec) return { official: null, company: null, date: null };
    const official = Number(rec.inr ?? rec.marketRate ?? rec.rate ?? rec.official);
    const company = Number(rec.company ?? rec.companyRate ?? rec.usd ?? rec.buyRate);
    const date = rec.effectiveDate ?? rec.createdAt ?? rec.date ?? null;
    return { official: isNaN(official) ? null : official, company: isNaN(company) ? null : company, date };
  };

  const reloadLatest = () => {
    setLoadingLatest(true);
    getPublishedLatest('latex60')
      .then((data) => setRate(data))
      .catch(() => setRate(null))
      .finally(() => setLoadingLatest(false));
  };

  useEffect(() => {
    reloadLatest();
    reloadHistory();
    // Auto-refresh every 60s
    const id = setInterval(() => {
      reloadLatest();
      reloadHistory();
    }, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadHistory = () => {
    setLoadingHist(true);
    getHistory({ category, limit: 50, from, to })
      .then(({ data }) => setHistory(Array.isArray(data) ? data : data?.rows || []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHist(false));
  };

  const saveBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    try {
      const blob = (await exportCsv({ category, from, to })).data;
      saveBlob(blob, `latex60-rate-history.csv`);
    } catch (_) { /* ignore */ }
  };

  const handleExportPdf = async () => {
    try {
      const blob = (await exportPdf({ category, from, to })).data;
      saveBlob(blob, `latex60-rate-history.pdf`);
    } catch (_) { /* ignore */ }
  };

  return (
    <div className="user-rate-history">
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Live Rates</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {rate && (
            <span style={{ color: '#64748b', fontSize: 12 }}>
              Last updated: {rate.effectiveDate ? new Date(rate.effectiveDate).toLocaleString('en-IN') : '—'}
            </span>
          )}
          <button className="btn-secondary" onClick={() => { reloadLatest(); reloadHistory(); }} disabled={loadingLatest || loadingHist}>
            {loadingLatest || loadingHist ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="dash-card" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>Category: LATEX60</div>
          {/* Optional DRC input (calculator buttons removed) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <span style={{ color: '#334155', fontWeight: 600 }}>DRC (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={drc}
                onChange={(e) => setDrc(e.target.value)}
                placeholder="optional"
                style={{ width: 120 }}
              />
            </label>
          </div>
        </div>

        {rate ? (
          <table className="rates-table" style={{ maxWidth: 680 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Official Market Rate (INR)</th>
                <th>Company Buying Rate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date((normalize(rate).date) || Date.now()).toLocaleDateString('en-IN')}</td>
                <td>{normalize(rate).official ?? '-'}</td>
                <td>{normalize(rate).company ?? '-'}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="no-data">No data</div>
        )}
      </div>

      {/* Recent History */}
      <div className="dash-card" style={{ marginTop: 16, maxWidth: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ marginTop: 0 }}>Recent History</h3>
          <div style={{ display: 'flex', alignItems: 'end', gap: 8, flexWrap: 'wrap' }}>
            <label>
              From
              <input
                type="date"
                value={from}
                max={todayStr}
                onChange={(e) => {
                  const v = e.target.value;
                  if (to && to < v) setTo(v);
                  setFrom(v);
                }}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={to}
                min={from}
                max={todayStr}
                onChange={(e) => {
                  const v = e.target.value;
                  setTo(from && v < from ? from : v);
                }}
              />
            </label>
            <button className="btn" onClick={reloadHistory} disabled={loadingHist}>
              {loadingHist ? 'Loading...' : 'Filter'}
            </button>
            <button className="btn-secondary" onClick={handleExportCsv}>Export CSV</button>
            <button className="btn-secondary" onClick={handleExportPdf}>Export PDF</button>
          </div>
        </div>
        {loadingHist ? (
          <p>Loading...</p>
        ) : history && history.length > 0 ? (
          <table className="rates-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Official Market Rate (INR)</th>
                <th>Company Buying Rate</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => {
                const dateStr = new Date(row.effectiveDate).toLocaleDateString('en-IN');
                const n = normalize(row);
                return (
                  <tr key={row._id}>
                    <td>{dateStr}</td>
                    <td>{row.category}</td>
                    <td>{n.official ?? '-'}</td>
                    <td>{n.company ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">No recent history</div>
        )}
      </div>
    </div>
  );
}