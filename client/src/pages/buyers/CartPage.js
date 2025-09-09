import React from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './buyers.css';

const CartPage = () => {
  const { items, updateQty, removeItem, totals } = useCart();

  return (
    <div className="buyers-container">
      <div className="buyers-header">
        <h1>Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="buyers-empty">
          Your cart is empty. <Link to="/buyers/catalog">Go shopping</Link>
        </div>
      ) : (
        <div className="cart-table">
          <div className="cart-row cart-head">
            <div>Product</div>
            <div>Type</div>
            <div>Location</div>
            <div>Price</div>
            <div>Qty</div>
            <div>Subtotal</div>
            <div></div>
          </div>
          {items.map(i => (
            <div key={i.productId} className="cart-row">
              <div className="cell-name">{i.name}</div>
              <div>{i.type}</div>
              <div><span className={`pill ${i.category}`}>{i.category}</span></div>
              <div>₹{i.price}</div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={i.quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!Number.isFinite(val) || val < 1) return;
                    updateQty(i.productId, Math.floor(val));
                  }}
                />
              </div>
              <div>₹{i.price * i.quantity}</div>
              <div>
                <button className="buyers-btn danger" onClick={() => removeItem(i.productId)}>Remove</button>
              </div>
            </div>
          ))}

          <div className="cart-summary">
            <div className="total">Total: ₹{totals.subtotal}</div>
            <Link to="/buyers/checkout" className="buyers-btn primary">Proceed to Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;