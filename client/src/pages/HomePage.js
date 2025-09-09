import React from 'react';
import './HomePage.css';





const HomePage = () => {
    
    return (
        <div>
            {/* Hero Section */}
            <header className="hero">
                <h1 className="hero-title fade-in">Welcome to Holy Family Polymers</h1>
                <p className="hero-subtitle fade-in-delay">
                    Sustainable rubber band manufacturing from natural tapped latex — eco-friendly, durable, and trusted nationwide.
                </p>
                <div className="hero-cta-buttons fade-in-delay2">
                    <a href="#features" className="cta-button cta-primary">Learn More</a>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="section-title">Why Choose Us?</h2>
                <p className="section-subtitle">
                    We combine eco-friendly production, quality assurance, and nationwide service to deliver the best rubber products.
                </p>
                <div className="features-grid">
                    <div className="feature-card">
                        <i className="fas fa-leaf feature-icon"></i>
                        <h3>Eco-Friendly Production</h3>
                        <p>100% natural latex sourced from sustainable rubber plantations with minimal environmental impact.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-certificate feature-icon"></i>
                        <h3>Premium Quality</h3>
                        <p>Strict quality checks ensure durable, elastic, and biodegradable rubber bands for multiple uses.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-truck feature-icon"></i>
                        <h3>Nationwide Delivery</h3>
                        <p>Efficient logistics network ensuring on-time delivery of bulk and retail orders across the country.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-handshake feature-icon"></i>
                        <h3>Farmer Partnerships</h3>
                        <p>Working closely with local farmers to ensure fair trade and consistent raw material supply.</p>
                    </div>
                    <div className="feature-card">
                        <i className="fas fa-cogs feature-icon"></i>
                        <h3>Custom Manufacturing</h3>
                        <p>Offering a variety of sizes, colors, and strengths tailored to customer needs.</p>
                    </div>
                </div>
            </section>

            {/* Buying Section */}
            <section id="buying" className="buying-section">
                <div className="buying-container">
                    <div className="buying-content">
                        <div className="buying-header">
                            <h2 className="slide-up">Premium Buying Experience</h2>
                            <p className="slide-up" style={{ animationDelay: '.08s' }}>
                                Transparent rates, secure checkout, and reliable delivery — crafted for professionals.
                            </p>
                            <a href="/buying" className="cta-button cta-primary buy-now-btn slide-up" style={{ animationDelay: '.16s' }}>
                                Start Buying
                            </a>
                        </div>

                        <div className="buying-grid">
                            <div className="buying-card slide-up" style={{ animationDelay: '.1s' }}>
                                <i className="fas fa-rupee-sign buying-icon"></i>
                                <h3>Live Rates</h3>
                                <p>Get the latest market and company rates in real‑time for informed decisions.</p>
                            </div>
                            <div className="buying-card slide-up" style={{ animationDelay: '.2s' }}>
                                <i className="fas fa-shield-alt buying-icon"></i>
                                <h3>Secure Payments</h3>
                                <p>Protected transactions with verified billing and audit-ready invoices.</p>
                            </div>
                            <div className="buying-card slide-up" style={{ animationDelay: '.3s' }}>
                                <i className="fas fa-box buying-icon"></i>
                                <h3>Quality Assured</h3>
                                <p>Every order is quality checked to meet our strict manufacturing standards.</p>
                            </div>
                        </div>
                    </div>

                    <div className="buying-visual">
                        {/* Inline SVG illustration with subtle motion */}
                        <svg className="buying-illustration svg-float" viewBox="0 0 360 300" role="img" aria-label="Buying Illustration">
                            <defs>
                                <linearGradient id="buyGrad" x1="0" y1="0" x2="1" y2="1">
                                    <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.85"/>
                                    <stop offset="100%" stopColor="var(--primary-hover)" stopOpacity="0.85"/>
                                </linearGradient>
                                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,0.15)"/>
                                </filter>
                            </defs>
                            <rect x="40" y="40" rx="16" ry="16" width="280" height="200" fill="url(#buyGrad)" filter="url(#softShadow)"/>
                            <text x="90" y="120" fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="42" fill="#fff">₹</text>
                            <rect x="120" y="105" width="140" height="10" rx="5" fill="rgba(255,255,255,0.9)"/>
                            <rect x="120" y="130" width="100" height="10" rx="5" fill="rgba(255,255,255,0.75)"/>
                            <rect x="120" y="155" width="160" height="10" rx="5" fill="rgba(255,255,255,0.6)"/>
                            <circle cx="280" cy="80" r="18" fill="var(--white-color)"/>
                            <path d="M272 80 l8 8 16-16" stroke="var(--primary-color)" strokeWidth="4" fill="none" strokeLinecap="round"/>
                            <circle className="ring" cx="300" cy="210" r="18" stroke="var(--white-color)" strokeOpacity="0.7" strokeWidth="3" fill="none"/>
                            <circle className="ring delay" cx="60" cy="210" r="14" stroke="var(--white-color)" strokeOpacity="0.5" strokeWidth="3" fill="none"/>
                        </svg>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 Holy Family Polymers. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;
