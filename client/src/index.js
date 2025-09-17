import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// Cursor ripple script: attach once on startup
(() => {
  let rippleEl;
  let rafId = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let attached = false;

  const ensureRipple = () => {
    if (rippleEl) return rippleEl;
    rippleEl = document.createElement('div');
    rippleEl.className = 'cursor-ripple pulsing is-hidden';
    document.body.appendChild(rippleEl);
    return rippleEl;
  };

  const onMouseMove = (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    ensureRipple().classList.remove('is-hidden');
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const onMouseLeave = () => {
    if (rippleEl) rippleEl.classList.add('is-hidden');
  };

  const tick = () => {
    // Smooth follow (lerp)
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    if (rippleEl) {
      rippleEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    }
    if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };

  const attach = () => {
    if (attached) return;
    attached = true;
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
  };

  const detach = () => {
    if (!attached) return;
    attached = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseleave', onMouseLeave);
    if (rippleEl && rippleEl.parentNode) rippleEl.parentNode.removeChild(rippleEl);
    rippleEl = null;
  };

  // Enable on pages that opt-in with .ripple-cursor on body descendants
  const observer = new MutationObserver(() => {
    const enabled = document.querySelector('.ripple-cursor') !== null;
    if (enabled) {
      attach();
    } else {
      detach();
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, attributes: true });
})();