import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EnquiryWizard from '../components/buying/EnquiryWizard';
import AuthModal from '../components/auth/AuthModal';
import './BuyingPage.css';

const PRODUCTS = [
  { id: 'premium_band', name: 'Premium Rubber Bands', desc: 'High elasticity, smooth finish', price: 120, unit: 'per pack' },
  { id: 'industrial_band', name: 'Industrial Grade Bands', desc: 'High tensile strength', price: 180, unit: 'per pack' },
  { id: 'eco_band', name: 'Eco-Friendly Bands', desc: 'Biodegradable materials', price: 150, unit: 'per pack' },
]; // Seed 3 demo products
const hasProducts = PRODUCTS.length > 0;
const CART_STORAGE_KEY = 'buying_cart';

// Inline SVG Icon Components (stroke-based, reusable)
const ShoppingBagIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const CartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 4h2l2 12h10l2-8H7" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="19" r="1.5" fill="currentColor" />
    <circle cx="17" cy="19" r="1.5" fill="currentColor" />
  </svg>
);

const PackageIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 7 12 3l9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 7v10l9 4 9-4V7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 11v10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Specialty icons for rubber band types
const ElasticIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 12c0-4.418 3.582-8 8-8m0 16c-4.418 0-8-3.582-8-8m16 0c0 4.418-3.582 8-8 8m0-16c4.418 0 8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3 5 6v6c0 4.418 3.582 7.5 7 9 3.418-1.5 7-4.582 7-9V6l-7-3Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9.5 12.5 11 14l3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const LeafIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 5c-6 0-10 4-10 10 0 2 1 4 3 4 6 0 10-4 10-10 0-2-1-4-3-4Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 15c2-2 5-3 8-3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const WaterDropIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3s6 6 6 10a6 6 0 1 1-12 0c0-4 6-10 6-10Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 14a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BuyingPage = () => {
  const [cart, setCart] = useState({}); // { productId: quantity }
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const productsRef = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true || user?.is_admin === true;

  // Restore cart from localStorage so users don't lose selections after login
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') setCart(parsed);
      }
    } catch (_) {}
  }, []);

  // Persist cart on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (_) {}
  }, [cart]);

  const addToCart = (productId) => {
    setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const updateQty = (productId, qty) => {
    const q = Math.max(0, Number(qty) || 0);
    setCart((prev) => ({ ...prev, [productId]: q }));
  };

  const removeItem = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const items = Object.entries(cart).filter(([_, q]) => q > 0);
  const subtotal = items.reduce((sum, [id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p ? p.price * q : 0);
  }, 0);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); } catch (_) {}
      setAuthOpen(true);
      return;
    }
    setWizardOpen(true);
  };

  const filteredProducts = PRODUCTS.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
  });

  const cartItemsForWizard = useMemo(() => items.map(([id, qty]) => ({ id, qty })), [items]);

  // Featured types (visual cards independent from PRODUCTS)
  const featuredTypes = [
    { key: 'premium', title: 'Premium Bands', desc: 'Smooth finish, high elasticity for everyday use.', Icon: ElasticIcon },
    { key: 'industrial', title: 'Industrial Grade', desc: 'High tensile strength for heavy packaging.', Icon: ShieldIcon },
    { key: 'eco', title: 'Eco-Friendly', desc: 'Biodegradable, sustainably sourced materials.', Icon: LeafIcon },
    { key: 'water', title: 'Water Resistant', desc: 'Moisture-resistant bands for outdoor usage.', Icon: WaterDropIcon },
  ];

  return (
    <div className={`buying-page ${isAdmin ? 'theme-admin' : 'theme-user'}`}>
      {/* Premium Hero */}
      <header className="buying-hero premium-gradient">
        {/* Subtle background orbs */}
        <div className="hero-orbs" aria-hidden="true">
          <span className="orb orb-1" />
          <span className="orb orb-2" />
          <span className="orb orb-3" />
        </div>

        <div className="buying-hero__content">
          <h1 className="hero-title animated-title">Buy Rubber Bands</h1>
          <p className="hero-subtitle fade-in-delay">
            Premium quality rubber bands engineered for performance, durability, and sustainability.
          </p>

          <div className="hero-icons">
            <ShoppingBagIcon className="svg-icon svg-float" />
            <CartIcon className="svg-icon svg-float delay" />
            <PackageIcon className="svg-icon svg-float delay2" />
          </div>

          <div className="hero-cta">
            <button className="btn-primary btn-glow" onClick={() => { setAuthOpen(true); }}>
              Shop Now
            </button>
          </div>
        </div>
      </header>

      {/* Featured Types (Premium Cards) */}
      <section className="featured-section">
        <div className="featured-header">
          <h2 className="section-title fade-in">Featured Rubber Band Types</h2>
          <p className="section-subtitle fade-in-delay">
            Explore our most popular categories, carefully crafted with premium materials and tested for reliability.
          </p>
        </div>

        <div className="types-grid">
          {featuredTypes.map(({ key, title, desc, Icon }, idx) => (
            <div className="type-card slide-up" style={{ animationDelay: `${0.1 * (idx + 1)}s` }} key={key}>
              <div className="type-icon-wrap">
                <Icon className="type-icon" />
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <button className="btn-secondary ghost" onClick={handleCheckout}>View Options</button>
            </div>
          ))}
        </div>
      </section>

      {/* Optional: Products list (only rendered if PRODUCTS provided elsewhere) */}
      {hasProducts && (
        <>
          <section className="buying-search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products (e.g., premium, industrial)"
              onFocus={() => { if (!isAuthenticated) setAuthOpen(true); }}
              className="search-input"
              aria-label="Search products"
            />
          </section>

          <section id="products" className="product-grid" ref={productsRef}>
            {filteredProducts.length === 0 ? (
              <div className="muted">No products match your search.</div>
            ) : (
              filteredProducts.map((p) => (
                <div key={p.id} className="product-card">
                  <div className="product-image">
                    <img src={p.image} alt={p.name} />
                  </div>
                  <div className="product-info">
                    <h3>{p.name}</h3>
                    <p className="product-desc">{p.desc}</p>
                    <div className="product-meta">
                      <span className="product-price">₹{p.price} <small>{p.unit}</small></span>
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="btn-secondary" onClick={() => { if (!isAuthenticated) { setAuthOpen(true); return; } addToCart(p.id); }}>Add to Cart</button>
                    <div className="qty-row">
                      <label htmlFor={`qty-${p.id}`}>Qty</label>
                      <input
                        id={`qty-${p.id}`}
                        type="number"
                        min="0"
                        value={cart[p.id] || 0}
                        onChange={(e) => updateQty(p.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </>
      )}

      {/* Enquiry Wizard */}
      <EnquiryWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        cartItems={cartItemsForWizard}
        products={PRODUCTS}
        user={user}
      />

      {/* Auth flow before opening wizard */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          // After login, scroll to products so user can select
          setTimeout(() => {
            productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        compact
      />
    </div>
  );
};

export default BuyingPage;