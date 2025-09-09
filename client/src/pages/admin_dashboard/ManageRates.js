import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManageRates.css";

/*
  ManageRates (Admin)
  - Shows full rate history (GET /api/rates/history)
  - Allows adding a new rate entry (POST /api/rates/update)
  - Aligned with existing backend routes in server/routes/rateRoutes.js
*/
const ManageRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRate, setNewRate] = useState({ marketRate: "", companyRate: "", source: "manual" });

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/rates/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRates(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async () => {
    try {
      if (!newRate.marketRate || !newRate.companyRate) {
        setError("Please fill in market and company rate");
        return;
      }
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/rates/update`,
        {
          marketRate: Number(newRate.marketRate),
          companyRate: Number(newRate.companyRate),
          source: newRate.source || "manual",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setShowAddModal(false);
        setNewRate({ marketRate: "", companyRate: "", source: "manual" });
        fetchRates();
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add rate");
    }
  };

  const closeModals = () => {
    setShowAddModal(false);
    setNewRate({ marketRate: "", companyRate: "", source: "manual" });
    setError("");
  };

  if (loading) {
    return (
      <div className="manage-rates">
        <div className="loading">Loading rates...</div>
      </div>
    );
  }

  return (
    <div className="manage-rates">
      <div className="page-header">
        <h1>Rate Management</h1>
        <p>Add new rate entries and review full history</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions-section">
        <button className="add-rate-btn" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i>
          Add New Rate
        </button>
      </div>

      <div className="rates-table-container">
        <h2>Rate History</h2>
        {rates.length === 0 ? (
          <div className="no-data">No rates found</div>
        ) : (
          <table className="rates-table">
            <thead>
              <tr>
                <th>Created On</th>
                <th>Market Rate (₹/kg)</th>
                <th>Company Rate (₹/kg)</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr key={rate._id}>
                  <td>{new Date(rate.createdAt).toLocaleString()}</td>
                  <td className="rate-value">₹{rate.marketRate}</td>
                  <td className="rate-value">₹{rate.companyRate}</td>
                  <td>{rate.source || "manual"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Rate</h3>
              <button onClick={closeModals} className="close-btn">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Market Rate (₹/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRate.marketRate}
                  onChange={(e) => setNewRate({ ...newRate, marketRate: e.target.value })}
                  placeholder="Enter market rate"
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Rate (₹/kg):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRate.companyRate}
                  onChange={(e) => setNewRate({ ...newRate, companyRate: e.target.value })}
                  placeholder="Enter company buying rate"
                  required
                />
              </div>
              <div className="form-group">
                <label>Source:</label>
                <input
                  type="text"
                  value={newRate.source}
                  onChange={(e) => setNewRate({ ...newRate, source: e.target.value })}
                  placeholder="e.g. manual or URL"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModals} className="cancel-btn">Cancel</button>
              <button onClick={handleAddRate} className="save-btn">Add Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRates;