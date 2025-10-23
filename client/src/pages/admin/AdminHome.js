import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({ title, desc, to, action = 'Open' }) => (
  <div className="card" style={{ borderRadius: 12 }}>
    <div className="card-body">
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {desc ? <div style={{ color: '#a3a3a3', marginBottom: 12 }}>{desc}</div> : null}
      <Link className="btn btn-primary" to={to}>{action}</Link>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <h2 style={{ margin: '0 0 12px 0' }}>{title}</h2>
    <div className="card-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: 16,
    }}>
      {children}
    </div>
  </div>
);

const AdminHome = () => {
  return (
    <div>
      <Section title="Manager">
        <Card title="Create Barrel" desc="Create barrel IDs and print QR" to="/admin/create-barrel" action="Open" />
        <Card title="Approve Barrel" desc="Approve purchase by ID" to="/admin/create-barrel" action="Go" />
        <Card title="Barrel History" desc="View movement logs" to="/manager/barrel-history" action="View" />
        <Card title="Scan Barrel" desc="Scan and verify" to="/manager/barrel-scan" action="Scan" />
      </Section>

      <Section title="Staff Modules">
        <Card title="Staff Scan" desc="Field/Staff scanner" to="/staff/barrel-scan" action="Scan" />
        <Card title="Staff Barrel History" desc="Lookup movement logs" to="/staff/barrel-history" action="View" />
        <Card title="Delivery Scan" desc="Delivery staff scanning" to="/delivery/barrel-scan" action="Scan" />
        <Card title="Accountant Billing" desc="Payments and billing" to="/accountant/payments" action="Open" />
        <Card title="Lab DRC" desc="Enter/compute DRC" to="/lab/drc-update" action="Open" />
      </Section>
    </div>
  );
};

export default AdminHome;
