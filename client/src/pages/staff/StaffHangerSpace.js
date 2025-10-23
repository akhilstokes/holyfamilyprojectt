import React, { useEffect, useMemo, useState } from 'react';
import { listVacantHangerSpaces, staffAssignHangerSpace } from '../../services/adminService';
import './StaffHangerSpace.css';

const ROWS = ['D','E','F','G','H','I','J','K','L'];

const Block = ({ label, cols = 10, vacantSet, onClaim }) => (
  <div className="hanger-block" aria-label={`Hanger block ${label}`}>
    {ROWS.map((row) => (
      <div className="hanger-row" key={`${label}-${row}`}>
        <div className="row-cells">
          {Array.from({ length: cols }).map((_, idx) => {
            const col = idx + 1;
            const key = `${label}-${row}-${col}`;
            const isVacant = vacantSet.has(key);
            return (
              <div
                key={key}
                className={`slot ${isVacant ? 'free' : 'occupied'}`}
                role="button"
                tabIndex={0}
                onClick={() => isVacant && onClaim(label, row, col)}
                title={isVacant ? 'Vacant (click to claim)' : 'Occupied'}
                aria-label={`${row}${col} ${isVacant ? 'vacant' : 'occupied'}`}
              />
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

const StaffHangerSpace = () => {
  const [vacantSlots, setVacantSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const vacantSet = useMemo(() => {
    const s = new Set();
    for (const slot of vacantSlots) s.add(`${slot.block}-${slot.row}-${slot.col}`);
    return s;
  }, [vacantSlots]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listVacantHangerSpaces();
      setVacantSlots(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleClaim = async (block, row, col) => {
    try {
      const slot = vacantSlots.find(s => s.block === block && s.row === row && s.col === col);
      if (!slot) return;
      const product = window.prompt('Product/label (optional):', '') || '';
      await staffAssignHangerSpace(slot._id, 'claim', product);
      await load();
      alert('Slot claimed.');
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="hanger-page">
      {error && <div style={{ color: '#fca5a5', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button className="btn" onClick={load} disabled={loading}>Reload</button>
        <span style={{ color: '#e2e8f0' }}>Vacant: {vacantSlots.length}</span>
      </div>

      <div className="hanger-wrap">
        <div className="row-labels left" aria-hidden>
          {ROWS.map((r) => (<div className="row-label" key={`left-${r}`}>{r}</div>))}
        </div>
        <Block label="A" cols={10} vacantSet={vacantSet} onClaim={handleClaim} />
        <div className="hanger-gap" />
        <Block label="B" cols={10} vacantSet={vacantSet} onClaim={handleClaim} />
        <div className="row-labels right" aria-hidden>
          {ROWS.map((r) => (<div className="row-label" key={`right-${r}`}>{r}</div>))}
        </div>
      </div>

      <div className="legend">
        <div className="legend-item"><span className="slot free" /> Vacant</div>
        <div className="legend-item"><span className="slot occupied" /> Occupied</div>
      </div>
    </div>
  );
};

export default StaffHangerSpace;