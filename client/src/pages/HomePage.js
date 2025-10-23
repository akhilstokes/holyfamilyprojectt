import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="homepage">
            {/* Hero Section with Company Branding */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">Holy Family Polymers</h1>
                        <p className="hero-subtitle">
                            Leading the future of sustainable rubber manufacturing with eco-friendly processes and premium quality products.
                        </p>
                        <div className="hero-actions">
                            <Link to="/about" className="btn btn-primary">Learn More</Link>
                            <Link to="/contact" className="btn btn-secondary">Get In Touch</Link>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src="/images/logo.png" alt="Holy Family Polymers Logo" />
                    </div>
                </div>
            </section>

            {/* Quick Navigation Section */}
            <section className="quick-nav-section">
                <div className="container">
                    <h2 className="section-title">Explore Our Platform</h2>
                    <div className="quick-nav-grid">
                        <Link to="/about" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <h3>About Us</h3>
                            <p>Learn about our company history, values, and commitment to sustainability</p>
                        </Link>
                        
                        <Link to="/history" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-history"></i>
                            </div>
                            <h3>Our History</h3>
                            <p>Discover our journey from humble beginnings to industry leadership</p>
                        </Link>
                        
                        <Link to="/gallery" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-images"></i>
                            </div>
                            <h3>Gallery</h3>
                            <p>View our manufacturing facilities, products, and team in action</p>
                        </Link>
                        
                        { /* Administration card removed */ }
                        
                        <Link to="/contact" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Contact</h3>
                            <p>Get in touch with us for inquiries, partnerships, or support</p>
                        </Link>
                        
                        <Link to="/login" className="nav-card login-card" aria-label="Login">
                            <div className="nav-icon">
                                <i className="fas fa-sign-in-alt"></i>
                            </div>
                            <h3>Login <span className="nav-cta" aria-hidden><i className="fas fa-arrow-right"></i></span></h3>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Highlight Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Holy Family Polymers?</h2>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-leaf"></i>
                            </div>
                            <h3>Eco-Friendly</h3>
                            <p>100% natural latex sourced from sustainable rubber plantations with minimal environmental impact.</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-award"></i>
                            </div>
                            <h3>Premium Quality</h3>
                            <p>Strict quality checks ensure durable, elastic, and biodegradable rubber bands for multiple uses.</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-shipping-fast"></i>
                            </div>
                            <h3>Fast Delivery</h3>
                            <p>Efficient logistics network ensuring on-time delivery of bulk and retail orders nationwide.</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <h3>Farmer Partnerships</h3>
                            <p>Working closely with local farmers to ensure fair trade and consistent raw material supply.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* News/Updates Section */}
            <section className="news-section">
                <div className="container">
                    <h2 className="section-title">Latest Updates</h2>
                    <div className="news-grid">
                        <article className="news-card featured">
                            <div className="news-image">
                                <img src="/images/holy2.jpg" alt="Manufacturing Update" />
                            </div>
                            <div className="news-content">
                                <span className="news-category">Manufacturing</span>
                                <h3>New Production Line Launched</h3>
                                <p>We've successfully launched our new eco-friendly production line, increasing capacity by 40% while reducing environmental impact.</p>
                                <span className="news-time">2 days ago</span>
                            </div>
                        </article>
                        
                        <article className="news-card">
                            <div className="news-image">
                                <img src="/images/holy3.jpg" alt="Sustainability Award" />
                            </div>
                            <div className="news-content">
                                <span className="news-category">Awards</span>
                                <h3>Sustainability Excellence Award</h3>
                                <p>Holy Family Polymers receives recognition for outstanding environmental practices in rubber manufacturing.</p>
                                <span className="news-time">1 week ago</span>
                            </div>
                        </article>
                        
                        <article className="news-card">
                            <div className="news-image">
                                <img src="/images/holy4.jpg" alt="Partnership News" />
                            </div>
                            <div className="news-content">
                                <span className="news-category">Partnerships</span>
                                <h3>New Distribution Partnership</h3>
                                <p>Expanding our reach with new distribution partners across three states, bringing our products closer to customers.</p>
                                <span className="news-time">2 weeks ago</span>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Experience Quality?</h2>
                        <p>Join thousands of satisfied customers who trust Holy Family Polymers for their rubber band needs.</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Get Quote</Link>
                            <Link to="/login" className="btn btn-outline">Login to Account</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>Holy Family Polymers</h3>
                            <p>Leading sustainable rubber manufacturing with eco-friendly processes and premium quality products.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/history">Our History</Link></li>
                                <li><Link to="/gallery">Gallery</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Services</h4>
                            <ul>
                                { /* Administration link removed */ }
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/contact">Support</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 Holy Family Polymers. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;