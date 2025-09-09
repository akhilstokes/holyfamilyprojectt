import React from 'react';
import './AdministrationPage.css';

const AdministrationPage = () => {
  return (
    <div className="admin-page">
      <h1>Administration</h1>
      <p>Welcome to the Administration section of Holy Family Polymers.</p>

      <div className="admin-cards">
        <div className="admin-card">
          <img src="/images/partner1.jpg" alt="Managing Partner" className="admin-img" />
          <h3>P. A. Mani</h3>
          <p>Managing Partner</p>
        </div>

        <div className="admin-card">
          <img src="/images/partner2.jpg" alt="Partner 2" className="admin-img" />
          <h3>Ansen P. Manuel</h3>
          <p>Partner</p>
        </div>
      </div>
    </div>
  );
};

export default AdministrationPage;
