import React, { useMemo, useState } from 'react';
import { EnquiryService } from '../../services/enquiryService';
import './EnquiryWizard.css';

/*
  5-step wizard:
  1. Profile: name, phone, email (prefill from user if available via parent)
  2. Location: address fields
  3. Products: show summary of cart
  4. Banking Option: COD, Bank Transfer, or Razorpay Online
  5. Review & Submit: show thank-you on success
*/

const initialForm = {
  profile: { name: '', email: '', phone: '' },
  location: { addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '' },
  bankingOption: 'razorpay',
};

export default function EnquiryWizard({ open, onClose, cartItems = [], user, products }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState(null);

  React.useEffect(() => {
    if (open) {
      setStep(1);
      setForm((prev) => ({
        ...initialForm,
        profile: {
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phoneNumber || '',
        },
      }));
      setSubmitting(false);
      setError('');
      setSuccessId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const itemsForPayload = useMemo(() => {
    return cartItems.map(({ id, qty }) => {
      const p = products.find((x) => x.id === id);
      return { productId: id, name: p?.name || id, price: p?.price || 0, quantity: qty };
    });
  }, [cartItems, products]);

  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (form.bankingOption === 'razorpay') {
        // Prepare order on server (you need a server endpoint to create Razorpay order)
        const amountPaise = itemsForPayload.reduce((sum, it) => sum + (it.price * it.quantity), 0) * 100;
        // Fallback minimal amount if prices are 0 in demo
        const finalAmount = amountPaise > 0 ? amountPaise : 100; // 1 INR for test

        // Open Razorpay Checkout
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxx',
          amount: finalAmount,
          currency: 'INR',
          name: 'Holy Family Polymers',
          description: 'Rubber Bands Purchase',
          handler: async function (response) {
            try {
              // After successful payment, submit enquiry/purchase
              const payload = {
                items: itemsForPayload,
                profile: form.profile,
                location: form.location,
                bankingOption: 'razorpay',
                payment: {
                  method: 'razorpay',
                  razorpayPaymentId: response.razorpay_payment_id,
                }
              };
              const res = await EnquiryService.create(payload);
              setSuccessId(res._id);
              setStep(5);
            } catch (e) {
              setError(e.response?.data?.message || e.message || 'Failed to submit after payment');
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: form.profile.name,
            email: form.profile.email,
            contact: form.profile.phone,
          },
          notes: {
            address: `${form.location.addressLine1} ${form.location.addressLine2} ${form.location.city}`,
          },
          theme: { color: '#3399cc' },
        };

        if (!window.Razorpay) {
          setError('Razorpay SDK not loaded. Please add the script tag to index.html.');
          return;
        }
        const rzp = new window.Razorpay(options);
        rzp.open();
        return; // Stop here; submission happens in handler
      }

      // Non-online payment flows
      const payload = {
        items: itemsForPayload,
        profile: form.profile,
        location: form.location,
        bankingOption: form.bankingOption,
      };
      const res = await EnquiryService.create(payload);
      setSuccessId(res._id);
      setStep(5);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to submit');
    } finally {
      if (form.bankingOption !== 'razorpay') setSubmitting(false);
    }
  };

  if (!open) return null;

  // Basic client-side validation helpers
  const isProfileValid = form.profile.name && form.profile.phone && /\S+@\S+\.\S+/.test(form.profile.email || '');
  const isLocationValid = form.location.addressLine1 && form.location.city && form.location.state && form.location.postalCode;
  const hasItems = (cartItems || []).length > 0;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h3>Buyer Enquiry</h3>
          <button className="link" onClick={onClose}>Close</button>
        </div>
        {error && <div className="error-message" style={{ marginBottom: 12 }}>{error}</div>}

        {step === 1 && (
          <div>
            <h4>Step 1: Profile</h4>
            <div className="grid-2">
              <div>
                <label>Name</label>
                <input value={form.profile.name} onChange={(e) => setForm({ ...form, profile: { ...form.profile, name: e.target.value } })} />
              </div>
              <div>
                <label>Phone</label>
                <input value={form.profile.phone} onChange={(e) => setForm({ ...form, profile: { ...form.profile, phone: e.target.value } })} />
              </div>
            </div>
            <div>
              <label>Email</label>
              <input value={form.profile.email} onChange={(e) => setForm({ ...form, profile: { ...form.profile, email: e.target.value } })} />
            </div>
            <div className="wizard-nav">
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4>Step 2: Location</h4>
            <div>
              <label>Address Line 1</label>
              <input value={form.location.addressLine1} onChange={(e) => setForm({ ...form, location: { ...form.location, addressLine1: e.target.value } })} />
            </div>
            <div>
              <label>Address Line 2</label>
              <input value={form.location.addressLine2} onChange={(e) => setForm({ ...form, location: { ...form.location, addressLine2: e.target.value } })} />
            </div>
            <div className="grid-3">
              <div>
                <label>City</label>
                <input value={form.location.city} onChange={(e) => setForm({ ...form, location: { ...form.location, city: e.target.value } })} />
              </div>
              <div>
                <label>State</label>
                <input value={form.location.state} onChange={(e) => setForm({ ...form, location: { ...form.location, state: e.target.value } })} />
              </div>
              <div>
                <label>Postal Code</label>
                <input value={form.location.postalCode} onChange={(e) => setForm({ ...form, location: { ...form.location, postalCode: e.target.value } })} />
              </div>
            </div>
            <div className="wizard-nav">
              <button className="btn-secondary" onClick={back}>Back</button>
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4>Step 3: Products</h4>
            {cartItems.length === 0 ? (
              <p className="muted">No items in cart.</p>
            ) : (
              <ul className="cart-list" style={{ maxHeight: 200, overflow: 'auto' }}>
                {cartItems.map(({ id, qty }) => {
                  const p = products.find((x) => x.id === id);
                  return (
                    <li key={id} className="cart-item">
                      <div>
                        <strong>{p?.name || id}</strong>
                        <div className="muted">₹{p?.price || 0} × {qty}</div>
                      </div>
                      <div className="cart-item__right">
                        <span className="cart-item__total">₹{(p?.price || 0) * qty}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="wizard-nav">
              <button className="btn-secondary" onClick={back}>Back</button>
              <button className="btn-primary" onClick={next} disabled={cartItems.length === 0}>Next</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h4>Step 4: Banking Option</h4>
            <div>
              <label>
                <input type="radio" name="bankingOption" checked={form.bankingOption === 'razorpay'} onChange={() => setForm({ ...form, bankingOption: 'razorpay' })} />
                Razorpay (Online Payment)
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="bankingOption" checked={form.bankingOption === 'cod'} onChange={() => setForm({ ...form, bankingOption: 'cod' })} />
                Cash on Delivery
              </label>
            </div>
            <div>
              <label>
                <input type="radio" name="bankingOption" checked={form.bankingOption === 'bank_transfer'} onChange={() => setForm({ ...form, bankingOption: 'bank_transfer' })} />
                Bank Transfer
              </label>
            </div>
            <div className="wizard-nav">
              <button className="btn-secondary" onClick={back}>Back</button>
              <button className="btn-primary" onClick={next}>Next</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h4>Step 5: Review & Submit</h4>
            {successId ? (
              <div>
                <p>Thank you! Your enquiry has been submitted.</p>
                <p className="muted">Reference: {successId}</p>
                <div className="wizard-nav">
                  <button className="btn-primary" onClick={onClose}>Close</button>
                </div>
              </div>
            ) : (
              <div>
                <p>Please review your details and submit your enquiry.</p>
                <div className="wizard-nav">
                  <button className="btn-secondary" onClick={back}>Back</button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Enquiry'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}