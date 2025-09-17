import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById } from '../../services/storeService';
import { useCart } from '../../context/CartContext';
import './buyers.css';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const p = await fetchProductById(id);
      setProduct(p || null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="buyers-container"><div className="buyers-loading">Loading...</div></div>;
  if (!product) return <div className="buyers-container"><div className="buyers-empty">Product not found.</div></div>;

  const buyNow = () => {
    addItem(product, 1);
    navigate('/buyers/checkout');
  };

  return (
    <div className="buyers-container">
      <div className="buyers-header">
        <h1>{product.name}</h1>
        <p>{product.type} • {product.category}</p>
      </div>

      <div className="product-details">
        <div className="pd-image" style={{backgroundImage: `url(${product.imageUrl || '/images/placeholder.png'})`}} />
        <div className="pd-info">
          <div className="pd-price">₹{product.price}</div>
          <ul className="content-list" style={{ marginLeft: '1rem' }}>
            {(product.features || [
              'High elasticity and durability',
              'Quality checked in-house',
              'Suitable for packaging and general use'
            ]).map((f, idx) => (<li key={idx}>{f}</li>))}
          </ul>
          <div className="pd-actions">
            <button className="buyers-btn" onClick={() => addItem(product, 1)}>Add to Cart</button>
            <button className="buyers-btn primary" onClick={buyNow}>Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;


