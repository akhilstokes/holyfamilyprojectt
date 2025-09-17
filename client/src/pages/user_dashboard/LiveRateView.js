import React, { useEffect, useState } from "react";
import axios from "axios";

function LiveRateView() {
  const [rate, setRate] = useState(null);

  useEffect(() => {
    axios
      .get("/api/rates/latest")
      .then((res) => setRate(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="live-rate-view">
      <h1>Live Rates</h1>
      {rate ? (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Daily Market Rate</th>
              <th>Company Buying Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{new Date(rate.effectiveDate || rate.createdAt).toLocaleDateString("en-IN")}</td>
              <td>
                {typeof rate.marketRate === "number"
                  ? `₹${rate.marketRate.toLocaleString("en-IN")}`
                  : typeof rate.rate === "number"
                  ? `₹${rate.rate.toLocaleString("en-IN")}`
                  : "-"}
              </td>
              <td>
                {typeof rate.companyRate === "number"
                  ? `₹${rate.companyRate.toLocaleString("en-IN")}`
                  : "-"}
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>No rate data available.</p>
      )}
    </div>
  );
}

export default LiveRateView; // ✅ IMPORTANT
 