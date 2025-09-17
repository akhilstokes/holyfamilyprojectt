import React, { useEffect, useState } from "react";
import axios from "axios";

function LiveRatePage() {
  const [marketRate, setMarketRate] = useState("");
  const [companyRate, setCompanyRate] = useState("");
  const [message, setMessage] = useState("");
  const [liveSchedulerRate, setLiveSchedulerRate] = useState(null);
  const [loadingLive, setLoadingLive] = useState(false);

  useEffect(() => {
    const fetchLive = async () => {
      setLoadingLive(true);
      try {
        const { data } = await axios.get("/api/rates/latest", { params: { product: "latex60" } });
        // Prefer explicit marketRate; fall back to single rate field (scheduler)
        setLiveSchedulerRate({
          value: typeof data.marketRate === "number" ? data.marketRate : data.rate,
          date: data.effectiveDate || data.createdAt,
          source: data.source,
          unit: data.unit || "per 100 Kg",
        });
      } catch (_) {
        setLiveSchedulerRate(null);
      } finally {
        setLoadingLive(false);
      }
    };
    fetchLive();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // JWT stored after login
      const res = await axios.post(
        "/api/rates/update",
        { marketRate: Number(marketRate), companyRate: Number(companyRate), product: "latex60" },
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
      <p style={{ marginTop: 8, opacity: 0.8 }}>Product: LATEX60 • Unit: per 100 Kg</p>
      <div style={{ margin: "12px 0" }}>
        {loadingLive ? (
          <p>Loading today\'s live rate…</p>
        ) : liveSchedulerRate ? (
          <div>
            <strong>Today\'s Live (Scheduler)</strong>: ₹{Number(liveSchedulerRate.value).toLocaleString("en-IN")} &nbsp;
            <small>
              ({new Date(liveSchedulerRate.date).toLocaleDateString("en-IN")}, source: {liveSchedulerRate.source})
            </small>
            <div style={{ marginTop: 6 }}>
              <button type="button" onClick={() => setMarketRate(liveSchedulerRate.value)}>
                Use this as Daily Market Rate
              </button>
            </div>
          </div>
        ) : (
          <p>No live scheduler rate found for today.</p>
        )}
      </div>
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
