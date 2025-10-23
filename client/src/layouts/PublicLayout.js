import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const PublicLayout = () => {
    const location = useLocation();
    // Global numeric-only guard for public pages
    useEffect(() => {
        const keydownHandler = (e) => {
            const el = e.target;
            if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
            const allowedControlKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','Tab'];
            if (e.ctrlKey || e.metaKey) return;
            const invalidKeys = ['e','E','+','-'];
            if (invalidKeys.includes(e.key)) { e.preventDefault(); return; }
            if (e.key.length === 1) {
                const isDigit = /[0-9]/.test(e.key);
                const isDot = e.key === '.';
                const stepAttr = el.getAttribute('step');
                const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
                if (!isDigit && !(isDot && allowsDecimal)) {
                    if (!allowedControlKeys.includes(e.key)) e.preventDefault();
                }
            }
        };
        const pasteHandler = (e) => {
            const el = e.target;
            if (!el || el.tagName !== 'INPUT' || el.type !== 'number') return;
            const text = (e.clipboardData || window.clipboardData)?.getData('text');
            if (typeof text !== 'string') return;
            const stepAttr = el.getAttribute('step');
            const allowsDecimal = stepAttr === null || stepAttr === 'any' || /\./.test(stepAttr);
            const sanitized = allowsDecimal ? text.replace(/[^0-9.]/g, '') : text.replace(/[^0-9]/g, '');
            if (sanitized !== text) {
                e.preventDefault();
                const start = el.selectionStart, end = el.selectionEnd;
                const value = el.value || '';
                el.value = value.slice(0, start) + sanitized + value.slice(end);
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };
        document.addEventListener('keydown', keydownHandler, true);
        document.addEventListener('paste', pasteHandler, true);
        return () => {
            document.removeEventListener('keydown', keydownHandler, true);
            document.removeEventListener('paste', pasteHandler, true);
        };
    }, []);
    const gradientRoutes = ['/about', '/history', '/contact', '/gallery'];
    const isGradient = gradientRoutes.some((p) => location.pathname.startsWith(p));
    // Apply body-level gradient to guarantee full viewport background
    useEffect(() => {
        if (isGradient) {
            document.body.classList.add('brand-gradient-root');
        } else {
            document.body.classList.remove('brand-gradient-root');
        }
        return () => {
            document.body.classList.remove('brand-gradient-root');
        };
    }, [isGradient]);
    return (
        <>
            <Navbar />
            <main className={isGradient ? 'brand-gradient' : ''}>
                <Outlet /> {/* This will render the specific page content */}
            </main>
        </>
    );
};

export default PublicLayout;