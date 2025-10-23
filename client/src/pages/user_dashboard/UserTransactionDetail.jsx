import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { downloadBillPdf, getTransactionById } from '../../services/customerService';
import './userDashboardTheme.css';

const saveBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

const Row = ({ label, value }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 8 }}>
    <div style={{ color: '#6b7280' }}>{label}</div>
    <div>{value ?? '-'}</div>
  </div>
);

const UserTransactionDetail = () => {
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      setErr('');
      setLoading(true);
      try {
        const data = await getTransactionById(id);
        setTx(data);
      } catch (e) {
        setErr('Failed to load transaction');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const downloadPdf = async () => {
    try {
      const blob = await downloadBillPdf(id);
      saveBlob(blob, `bill-${id}.pdf`);
    } catch (e) {
      alert('Failed to download PDF');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (err) return <div className="alert error">{err}</div>;
  if (!tx) return <div className="no-data">Not found</div>;

  const created = new Date(tx.date || tx.createdAt).toLocaleString('en-IN');
  const priceFormula = tx.priceCalcMeta?.formula || 'DRC × Weight × Rate';

  return (
    <div>
      <h2>Transaction Detail</h2>
      <div className="dash-card" style={{ maxWidth: 720, display: 'grid', gap: 12 }}>
        <Row label="Date" value={created} />
        <Row label="Batch" value={tx.batchId} />
        <Row label="Weight (kg)" value={tx.weightKg ?? tx.weight} />
        <Row label="DRC (%)" value={tx.drcPercent} />
        <Row label="Agreed Rate" value={tx.agreedRatePerKg ?? '-'} />
        <Row label="Market Rate" value={tx.marketRatePerKg ?? '-'} />
        <Row label="Amount" value={tx.finalAmount ?? '-'} />
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Price Calculation</h3>
        <p>{priceFormula}</p>
      </div>

      {tx.labReport && (
        <div className="dash-card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Lab Report</h3>
          <Row label="DRC (%)" value={tx.labReport.drcPercent} />
          <Row label="Moisture" value={tx.labReport.moisture} />
          <Row label="Impurities" value={tx.labReport.impurities} />
          {tx.labReport.reportUrl && (
            <a className="btn-secondary" href={tx.labReport.reportUrl} target="_blank" rel="noreferrer">Open Report</a>
          )}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={downloadPdf}>Download Bill (PDF)</button>
      </div>
    </div>
  );
};

export default UserTransactionDetail;
