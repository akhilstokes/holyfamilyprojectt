import React, { useEffect, useState } from 'react';
import { fetchMyOrders } from '../../services/storeService';
import './buyers.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchMyOrders();
      setOrders(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="buyers-container">
      <div className="buyers-header">
        <h1>My Orders</h1>
      </div>

      {loading ? (
        <div className="buyers-loading">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="buyers-empty">No orders yet</div>
      ) : (
        <div className="orders-list">
          {orders.map(o => (
            <div key={o._id} className="order-card">
              <div className="order-head">
                <div>Order #{o._id}</div>
                <div className={`status ${o.status}`}>
                  {o.status}
                  {o.paymentStatus ? ` • ${o.paymentStatus}` : ''}
                </div>
              </div>
              <div className="order-items">
                {o.items.map((it, idx) => (
                  <div key={idx} className="order-item-row">
                    <div className="name">{it.name}</div>
                    <div className="qty">x{it.quantity}</div>
                    <div className="amount">₹{it.subtotal}</div>
                  </div>
                ))}
              </div>
              <div className="order-foot">Total: ₹{o.totalAmount}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;