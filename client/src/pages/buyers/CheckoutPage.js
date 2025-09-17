import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../services/storeService';
import { useAuth } from '../../context/AuthContext';
import './buyers.css';

const CheckoutPage = () => {
  const { items, clearCart, totals } = useCart();
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
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
    if (!isAuthenticated) {
      return navigate('/login');
    }
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
          navigate('/buyers/thank-you');
        } else {
          alert(verify?.message || 'Payment verification failed');
        }
      },
      theme: { color: '#0f766e' },
      method: {
        upi: paymentMethod === 'upi',
        card: paymentMethod === 'card',
        netbanking: paymentMethod === 'netbanking',
        wallet: false,
        emi: false,
        paylater: false,
      },
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
        <div className="checkout-payments">
          <div className="pay-left">
            <button className={`pay-item ${paymentMethod==='upi'?'active':''}`} onClick={()=>setPaymentMethod('upi')}>UPI</button>
            <button className={`pay-item ${paymentMethod==='card'?'active':''}`} onClick={()=>setPaymentMethod('card')}>Credit / Debit Card</button>
            <button className={`pay-item ${paymentMethod==='netbanking'?'active':''}`} onClick={()=>setPaymentMethod('netbanking')}>Net Banking</button>
          </div>
          <div className="pay-right">
            {paymentMethod==='upi' && (
              <div className="pay-section">
                <h3>Pay via UPI</h3>
                <p>Use any UPI app to complete payment securely after clicking Pay.</p>
              </div>
            )}
            {paymentMethod==='card' && (
              <div className="pay-section">
                <h3>Pay via Card</h3>
                <p>Add and secure cards as per RBI guidelines in the payment popup.</p>
              </div>
            )}
            {paymentMethod==='netbanking' && (
              <div className="pay-section">
                <h3>Pay via Net Banking</h3>
                <p>Select your bank in the payment popup and finish payment.</p>
              </div>
            )}
            <label>Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special request..." />
            <button className="buyers-btn primary" onClick={submit} disabled={loading}>
              {loading ? 'Processing...' : `Pay ₹${totals.subtotal}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;