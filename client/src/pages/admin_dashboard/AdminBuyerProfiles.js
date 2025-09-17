import React, { useEffect, useState } from 'react';
import { fetchBuyerProfiles } from '../../services/buyersService';
import './AdminBuyerProfiles.css';

const AdminBuyerProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchBuyerProfiles();
      setProfiles(res || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="buyers-admin">
      <h1>Buyer Profiles</h1>
      {loading ? (
        <div>Loading...</div>
      ) : profiles.length === 0 ? (
        <div>No buyer profiles found.</div>
      ) : (
        <div className="buyers-admin-table">
          <div className="row head">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div>State</div>
            <div>District</div>
            <div>Updated</div>
          </div>
          {profiles.map((b, i) => (
            <div key={i} className="row">
              <div>{b.name}</div>
              <div>{b.email}</div>
              <div>{b.phone}</div>
              <div>{b.state}</div>
              <div>{b.district}</div>
              <div>{new Date(b.updatedAt || Date.now()).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBuyerProfiles;


