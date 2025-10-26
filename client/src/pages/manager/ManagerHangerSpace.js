import React, { useEffect, useMemo, useState } from 'react';
import '../admin/HangerSpace.css';
import { listHangerSpaces, seedHangerGrid, setHangerSpaceStatus } from '../../services/adminService';

// Rows D through L
const ROWS = ['D','E','F','G','H','I','J','K','L'];

const Block = ({ label, cols = 10, statusMap, onClickSlot }) => (
  <div className="hanger-block" aria-label={`Hanger block ${label}`}>
    {ROWS.map((row) => (
      <div className="hanger-row" key={`${label}-${row}`}>
        <div className="row-cells">
          {Array.from({ length: cols }).map((_, idx) => {
            const col = idx + 1;
            const key = `${label}-${row}-${col}`;
            const status = statusMap.get(key) || 'free';
            return (
              <div
                key={key}
                className={`slot ${status}`}
                role="button"
                tabIndex={0}
                onClick={() => onClickSlot(label, row, col, status)}
                aria-label={`${row}${col} ${status}`}
                title={`${row}${col} ${status}`}
              />
            );
          })}
        </div>
      </div>
    ))}
  </div>
);

const RowLabels = ({ side = 'left' }) => (
  <div className={`row-labels ${side}`} aria-hidden>
    {ROWS.map((r) => (
      <div className="row-label" key={`${side}-${r}`}>{r}</div>
    ))}
  </div>
);

const ManagerHangerSpace = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusMap = useMemo(() => {
    const m = new Map();
    for (const slot of slots) {
      const cls = slot.status === 'vacant' ? 'free' : slot.status;
      m.set(`${slot.block}-${slot.row}-${slot.col}`, cls);
    }
    return m;
  }, [slots]);

  const occupiedCount = useMemo(() => slots.filter(s => s.status === 'occupied').length, [slots]);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const data = await listHangerSpaces();
      setSlots(Array.isArray(data) ? data : (Array.isArray(data?.records) ? data.records : []));
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setSlots([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleClick = async (block, row, col, status) => {
    try {
      const slot = slots.find(s => s.block === block && s.row === row && s.col === col);
      if (!slot) return;
      const options = [
        { key: 'occupied', label: 'Occupied (Rubber Band)' },
        { key: 'empty_barrel', label: 'Empty Barrel' },
        { key: 'complete_bill', label: 'Complete Bill' },
        { key: 'vacant', label: 'Vacant' }
      ];
      const choice = window.prompt(`Set status for ${row}${col}:\n+1) Occupied (Rubber Band)\n+2) Empty Barrel\n+3) Complete Bill\n+4) Vacant\nEnter 1-4`, '1');
      const idx = parseInt(choice, 10);
      if (!idx || idx < 1 || idx > 4) return;
      const selected = options[idx - 1].key;
      const product = selected === 'occupied' ? (window.prompt('Rubber band label (optional):', '') || '') : '';
      await setHangerSpaceStatus(slot._id, selected, product);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="hanger-page">
      {error && <div style={{ color: '#fca5a5', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button className="btn" onClick={load} disabled={loading}>Reload</button>
        <button className="btn" onClick={async () => { await seedHangerGrid(); await load(); }} disabled={loading}>Seed Grid</button>
        <span style={{ color: '#e2e8f0' }}>Total: {slots.length} | Occupied: {occupiedCount}</span>
      </div>

      <div className="hanger-wrap">
        <RowLabels side="left" />
        <Block label="A" cols={10} statusMap={statusMap} onClickSlot={handleClick} />
        <div className="hanger-gap" />
        <Block label="B" cols={10} statusMap={statusMap} onClickSlot={handleClick} />
        <RowLabels side="right" />
      </div>

      <div className="legend">
        <div className="legend-item"><span className="slot free" /> Free</div>
        <div className="legend-item"><span className="slot occupied" /> Rubber Band</div>
        <div className="legend-item"><span className="slot empty_barrel" /> Empty Barrel</div>
        <div className="legend-item"><span className="slot complete_bill" /> Complete Bill</div>
      </div>
    </div>
  );
};

export default ManagerHangerSpace;
