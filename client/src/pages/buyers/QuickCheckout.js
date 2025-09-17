import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { placeOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../services/storeService';
import './buyers.css';

const KERALA_DISTRICTS = [
  'Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'
];
const TALUKS_BY_DISTRICT = {
  Thiruvananthapuram: ['Thiruvananthapuram','Neyyattinkara','Nedumangad','Kattakkada','Varkala','Chirayinkeezhu'],
  Kollam: ['Kollam','Kunnathoor','Karunagappally','Kottarakkara','Punalur','Pathanapuram'],
  Pathanamthitta: ['Adoor','Konni','Kozhencherry','Ranni','Thiruvalla','Mallappally'],
  Alappuzha: ['Alappuzha','Ambalappuzha','Cherthala','Chengannur','Karthikappally','Mavelikkara'],
  Kottayam: ['Changanassery','Kanjirappally','Kottayam','Vaikom','Meenachil','Ettumanoor'],
  Idukki: ['Devikulam','Peerumedu','Thodupuzha','Udumbanchola','Idukki'],
  Ernakulam: ['Aluva','Kochi','Kothamangalam','Muvattupuzha','North Paravur','Perumbavoor','Kanayannur'],
  Thrissur: ['Chalakudy','Chavakkad','Kodungallur','Kunnamkulam','Mukundapuram','Thalapilly','Thrissur'],
  Palakkad: ['Alathur','Chittur','Mannarkkad','Ottapalam','Palakkad','Pattambi'],
  Malappuram: ['Eranad','Kondotty','Nilambur','Perinthalmanna','Ponnani','Tirur','Tirurangadi'],
  Kozhikode: ['Kozhikode','Vadakara','Koyilandy','Thamarassery'],
  Wayanad: ['Mananthavady','Sulthan Bathery','Vythiri'],
  Kannur: ['Iritty','Kannur','Payyannur','Taliparamba','Thalassery'],
  Kasaragod: ['Hosdurg','Kasaragod','Manjeshwaram','Vellarikundu']
};

export default function QuickCheckout() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { items, totals, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [delivery, setDelivery] = useState({ district: '', taluk: '', addressLine: '' });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const cartList = useMemo(() => items.map(i => ({ name: i.name, qty: i.quantity, price: i.price, subtotal: i.price * i.quantity })), [items]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (step === 6) {
      setTimer(60);
      let stopped = false;
      const t = setInterval(async () => {
        setTimer((v) => {
          const next = v - 1;
          if (next <= 0 && !stopped) {
            stopped = true;
            clearInterval(t);
            (async () => { try { await logout(); } catch(_) {} finally { navigate('/login'); } })();
          }
          return next;
        });
      }, 1000);
      return () => { stopped = true; clearInterval(t); };
    }
  }, [step, isAuthenticated, navigate, logout]);

  const next = () => setStep(s => Math.min(6, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

  const proceedPayment = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setLoading(true);
    const payload = {
      items: items.map(i => ({ product: i.productId, name: i.name, type: i.type, category: i.category, unitPrice: i.price, quantity: i.quantity, subtotal: i.price * i.quantity })),
      notes: `Delivery: ${delivery.district}/${delivery.taluk} - ${delivery.addressLine}`
    };
    const res = await placeOrder(payload);
    if (!res?.success || !res.order?._id) { setLoading(false); alert('Failed to place order'); return; }

    const scriptOk = await new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
    });
    if (!scriptOk) { setLoading(false); alert('Failed to load payment gateway'); return; }

    const pr = await createRazorpayOrder(res.order._id);
    if (!pr?.success) { setLoading(false); alert('Unable to initiate payment'); return; }

    const opts = {
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
        if (verify?.success) { clearCart(); setStep(6); } else { alert('Payment verification failed'); }
      },
      theme: { color: '#0f766e' },
      method: { upi: paymentMethod==='upi', card: paymentMethod==='card', netbanking: paymentMethod==='netbanking', wallet:false, emi:false, paylater:false },
      modal: { ondismiss: () => setLoading(false) }
    };
    const rzp = new window.Razorpay(opts);
    rzp.on('payment.failed', function () { setLoading(false); alert('Payment failed'); });
    rzp.open();
  };

  return (
    <div className="buyers-container">
      <div className="buyers-header"><h1>Quick Checkout</h1></div>

      {/* Step 1: Products */}
      {step===1 && (
        <div className="checkout-panel">
          <h3>Step 1: Products</h3>
          {cartList.length===0 ? <div className="buyers-empty">Your cart is empty.</div> : (
            <ul className="orders-list">
              {cartList.map((c, idx) => (
                <li key={idx} className="order-item-row"><div>{c.name}</div><div>x{c.qty}</div><div>₹{c.subtotal}</div></li>
              ))}
            </ul>
          )}
          <div className="cart-summary"><div className="total">Total: ₹{totals.subtotal}</div></div>
          <div><button className="buyers-btn primary" onClick={next} disabled={cartList.length===0}>Next</button></div>
        </div>
      )}

      {/* Step 2: Delivery (Kerala only) */}
      {step===2 && (
        <div className="buyers-form">
          <h3>Step 2: Delivery Address (Kerala only)</h3>
          <label>District</label>
          <select value={delivery.district} onChange={(e)=>setDelivery({...delivery, district:e.target.value, taluk:''})}>
            <option value="">Select district</option>
            {KERALA_DISTRICTS.map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
          <label>Taluk</label>
          <select value={delivery.taluk} onChange={(e)=>setDelivery({...delivery, taluk:e.target.value})} disabled={!delivery.district}>
            <option value="">Select taluk</option>
            {(TALUKS_BY_DISTRICT[delivery.district]||[]).map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
          <label>Address</label>
          <input value={delivery.addressLine} onChange={(e)=>setDelivery({...delivery, addressLine:e.target.value})} placeholder="House, Street, Landmark" />
          <div>
            <button className="buyers-btn" onClick={back}>Back</button>
            <button className="buyers-btn primary" onClick={next} style={{ marginLeft: 8 }} disabled={!delivery.district || !delivery.taluk || !delivery.addressLine}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step===3 && (
        <div className="checkout-panel">
          <h3>Step 3: Confirm</h3>
          <p>Deliver to: {delivery.district} / {delivery.taluk} — {delivery.addressLine}</p>
          <div>
            <button className="buyers-btn" onClick={back}>Back</button>
            <button className="buyers-btn primary" onClick={next} style={{ marginLeft: 8 }}>Next</button>
          </div>
        </div>
      )}

      {/* Step 4: Terms */}
      {step===4 && (
        <div className="checkout-panel">
          <h3>Step 4: Terms & Conditions</h3>
          <p className="buyers-desc">By proceeding, you agree to our shipping, returns, and data policies.</p>
          <label style={{ display:'flex', alignItems:'center', gap:8 }}>
            <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} /> I agree to the Terms & Conditions
          </label>
          <div>
            <button className="buyers-btn" onClick={back}>Back</button>
            <button className="buyers-btn primary" onClick={next} style={{ marginLeft: 8 }} disabled={!agree}>Next</button>
          </div>
        </div>
      )}

      {/* Step 5: Payment */}
      {step===5 && (
        <div className="checkout-payments">
          <div className="pay-left">
            <button className={`pay-item ${paymentMethod==='upi'?'active':''}`} onClick={()=>setPaymentMethod('upi')}>UPI</button>
            <button className={`pay-item ${paymentMethod==='card'?'active':''}`} onClick={()=>setPaymentMethod('card')}>Credit / Debit Card</button>
            <button className={`pay-item ${paymentMethod==='netbanking'?'active':''}`} onClick={()=>setPaymentMethod('netbanking')}>Net Banking</button>
          </div>
          <div className="pay-right">
            <h3>Step 5: Payment</h3>
            <p className="buyers-desc">Choose your payment method and click Pay.</p>
            <button className="buyers-btn primary" onClick={proceedPayment} disabled={loading}>{loading?'Processing...':`Pay ₹${totals.subtotal}`}</button>
          </div>
        </div>
      )}

      {/* Step 6: Thank you + auto logout timer */}
      {step===6 && (
        <div className="checkout-panel">
          <h3>Step 6: Thank you!</h3>
          <p>Your order has been placed successfully. You will be logged out in {timer}s.</p>
        </div>
      )}
    </div>
  );
}


