import React, { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../../services/storeService';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './buyers.css';

const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState(''); // raw | finished | accessory (or custom)
  const [category, setCategory] = useState(''); // center | shop
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchProducts({ q, type, category });
      setProducts(data || []);
      setLoading(false);
    })();
  }, [q, type, category]);

  const types = useMemo(() => Array.from(new Set(products.map(p => p.type))), [products]);

  return (
    <div className="buyers-container">
      <div className="buyers-header">
        <h1>Store</h1>
        <p>Browse products by type and category</p>
      </div>

      <div className="buyers-filters">
        <input placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Locations</option>
          <option value="center">Center</option>
          <option value="shop">Shop</option>
        </select>
      </div>

      {loading ? (
        <div className="buyers-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="buyers-empty">No products found</div>
      ) : (
        <div className="buyers-grid">
          {products.map((p) => (
            <div key={p._id} className="buyers-card">
              <Link to={`/buyers/product/${p._id}`} className="buyers-image" style={{backgroundImage: `url(${p.imageUrl || '/images/placeholder.png'})`, display: 'block'}} />
              <div className="buyers-card-content">
                <Link to={`/buyers/product/${p._id}`} className="buyers-title" style={{ textDecoration: 'none', color: 'inherit' }}>{p.name}</Link>
                <div className="buyers-meta">
                  <span className={`pill ${p.category}`}>{p.category}</span>
                  <span className="sep">•</span>
                  <span className="type">{p.type}</span>
                </div>
                <div className="buyers-desc">{p.description || 'No description'}</div>
                <div className="buyers-price">₹{p.price}</div>
                <button onClick={() => addItem(p, 1)} className="buyers-btn primary">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;