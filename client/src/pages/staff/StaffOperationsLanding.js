import React from 'react';
import { useNavigate } from 'react-router-dom';

const StaffOperationsLanding = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: 24 }}>
      <h2>Staff Operations</h2>
      <p style={{ opacity: 0.8 }}>Select an action:</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16 }}>
        <button className="btn btn-success" onClick={() => navigate('/staff/operations/add-barrel')}>
          <i className="fas fa-oil-can" style={{ marginRight: 8 }}></i>
          Add Barrel
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/staff/operations/trip-km')}>
          <i className="fas fa-road" style={{ marginRight: 8 }}></i>
          Log Trip KM
        </button>
      </div>
    </div>
  );
};

export default StaffOperationsLanding;








































