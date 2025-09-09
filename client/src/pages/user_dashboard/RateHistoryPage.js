import React, { useEffect, useState } from "react";
import axios from "axios";

// User rate history with date-range filter (auth required)
function RateHistory() {
  const [history, setHistory] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // default: load last 30 public if no range selected yet
    if (!from || !to) {
      axios
        .get("/api/rates/public-history?limit=30")
        .then((res) => setHistory(res.data))
        .catch((err) => console.error(err));
    }
  }, [from, to]);

  const fetchRange = async (e) => {
    e.preventDefault();
    setError("");
    if (!from || !to) {
      setError("Please select both dates");
      return;
    }
    try {
      const { data } = await axios.get(`/api/rates/history-range?from=${from}&to=${to}`, config);
      setHistory(data);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load rate history");
    }
  };

  return (
    <div className="rate-history-view">
      <h1>Rate History</h1>

      <form onSubmit={fetchRange} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button type="submit">Filter</button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {history.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Market Rate</th>
              <th>Company Rate</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate, index) => (
              <tr key={index}>
                <td>{new Date(rate.createdAt).toLocaleDateString()}</td>
                <td>{rate.marketRate}</td>
                <td>{rate.companyRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No history data available.</p>
      )}
    </div>
  );
}

export default RateHistory; // ✅ important
