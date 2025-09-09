// client/src/pages/user_dashboard/RateHistory.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const UserRateHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get("/api/rates/history"); // ✅ Backend route
        setHistory(res.data);
      } catch (error) {
        console.error("Error fetching rate history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  if (loading) return <p>Loading rate history...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">📊 Rate History</h2>
      {history.length === 0 ? (
        <p>No rate history found.</p>
      ) : (
        <table className="w-full border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Rate Type</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Updated By</th>
            </tr>
          </thead>
          <tbody>
            {history.map((rate) => (
              <tr key={rate._id} className="text-center">
                <td className="p-2 border">
                  {new Date(rate.effectiveDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">{rate.rateType}</td>
                <td className="p-2 border">₹{rate.rateValue}</td>
                <td className="p-2 border">
                  {rate.updatedBy?.name || "Admin"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserRateHistory;
