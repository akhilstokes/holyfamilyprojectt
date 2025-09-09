import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../services/storeService';
import './buyers.css';

const CheckoutPage = () => {
  const { items, clearCart, totals } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const submit = async () => {
    setLoading(true);
    if (!items || items.length === 0 || totals.subtotal <= 0) {
      setLoading(false);
      return alert('Your cart is empty or total is invalid.');
    }
    const payload = {
      items: items.map(i => ({
        product: i.productId,
        name: i.name,
        type: i.type,
        category: i.category,
        unitPrice: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      })),
      notes,
    };
    const res = await placeOrder(payload);
    if (!res?.success || !res.order?._id) {
      setLoading(false);
      return alert(res?.message || 'Failed to place order');
    }

    const ok = await loadRazorpay();
    if (!ok) {
      setLoading(false);
      return alert('Failed to load payment gateway.');
    }

    const pr = await createRazorpayOrder(res.order._id);
    if (!pr?.success) {
      setLoading(false);
      return alert(pr?.message || 'Unable to initiate payment');
    }

    const options = {
      key: pr.key,
      amount: pr.amount,
      currency: pr.currency || 'INR',
      name: 'Holy Family Polymers',
      description: 'Order Payment',
      order_id: pr.rpOrderId,
      handler: async function (response) {
        const verify = await verifyRazorpayPayment(res.order._id, {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
        setLoading(false);
        if (verify?.success) {
          clearCart();
          navigate('/buyers/orders');
        } else {
          alert(verify?.message || 'Payment verification failed');
        }
      },
      theme: { color: '#0f766e' },
      modal: {
        ondismiss: () => {
          setLoading(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function () {
      setLoading(false);
      alert('Payment failed. Please try again.');
    });
    rzp.open();
  };

  return (
    <div className="buyers-container">
      <div className="buyers-header">
        <h1>Checkout</h1>
        <p>Total: ₹{totals.subtotal}</p>
      </div>

      {items.length === 0 ? (
        <div className="buyers-empty">Your cart is empty.</div>
      ) : (
        <div className="checkout-panel">
          <label>Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special request..." />
          <button className="buyers-btn primary" onClick={submit} disabled={loading}>
            {loading ? 'Placing order...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;