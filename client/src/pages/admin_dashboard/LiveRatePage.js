import React, { useState } from "react";
import axios from "axios";

function LiveRatePage() {
  const [marketRate, setMarketRate] = useState("");
  const [companyRate, setCompanyRate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // JWT stored after login
      const res = await axios.post(
        "/api/rates/update",
        { marketRate, companyRate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setMarketRate("");
      setCompanyRate("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error updating rate");
    }
  };

  return (
    <div className="live-rate-page">
      <h1>Update Live Rate</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Daily Market Rate:</label>
          <input
            type="number"
            value={marketRate}
            onChange={(e) => setMarketRate(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Company Buying Rate:</label>
          <input
            type="number"
            value={companyRate}
            onChange={(e) => setCompanyRate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Rate</button>
      </form>
    </div>
  );
}

export default LiveRatePage;
