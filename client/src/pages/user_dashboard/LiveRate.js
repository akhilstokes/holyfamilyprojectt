import React, { useState, useEffect } from "react";

const LiveRate = () => {
  const [rate, setRate] = useState(0);

  // Simulate fetching live rate every 5 sec
  useEffect(() => {
    const fetchRate = () => {
      const newRate = (Math.random() * 100).toFixed(2); // random price
      setRate(newRate);
    };

    fetchRate(); // first call
    const interval = setInterval(fetchRate, 5000); // update every 5 sec

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📈 Live Rate</h2>
      <p style={{ fontSize: "24px", fontWeight: "bold" }}>Current Rate: {rate} ₹</p>
    </div>
  );
};

export default LiveRate;
