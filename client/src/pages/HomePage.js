import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import './HomePage.css';
import 'animate.css';

const HomePage = () => {
    return (
        <div className="homepage animate__animated animate__fadeIn">
            <Navbar />
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title animate__animated animate__fadeInDown">Smart Accounting for Rubber Manufacturing</h1>
                            <p className="hero-subtitle animate__animated animate__fadeInUp">
                                Streamline latex billing, wage automation, inventory tracking, and payroll management with Holy Family Polymers.
                                Empowering operations with precision, transparency, and speed.
                            </p>
                            <div className="hero-actions">
                                <Link to="/login" className="btn btn-primary animate__animated animate__fadeInLeft">Get Started</Link>
                                <Link to="/contact" className="btn btn-secondary animate__animated animate__fadeInRight">Contact Sales</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Below-Hero Mini Info Strip */}
            <section className="info-strip">
                <div className="container">
                    <div className="info-grid">
                        <div className="info-item">
                            <i className="fas fa-file-invoice-dollar"></i>
                            <span>Automated Latex Billing</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-calculator"></i>
                            <span>Smart Wage Calculation</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-chart-line"></i>
                            <span>Real-time Analytics</span>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-shield-alt"></i>
                            <span>Secure & Reliable</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision, Mission, Who We Are Section */}
            <section className="company-values-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">About Holy Family Polymers</h2>
                        <p className="section-subtitle">Discover our commitment to excellence in rubber manufacturing and technology innovation</p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card vision-card">
                            <div className="value-icon">
                                <i className="fas fa-eye"></i>
                            </div>
                            <h3>Our Vision</h3>
                            <p>To be the leading provider of innovative rubber manufacturing solutions, transforming the industry through cutting-edge technology and sustainable practices that empower businesses to achieve operational excellence.</p>
                            <div className="value-highlight">
                                <span>Innovation • Excellence • Sustainability</span>
                            </div>
                        </div>

                        <div className="value-card mission-card">
                            <div className="value-icon">
                                <i className="fas fa-bullseye"></i>
                            </div>
                            <h3>Our Mission</h3>
                            <p>We deliver comprehensive accounting and operations management solutions specifically designed for rubber manufacturing. Our mission is to streamline processes, enhance productivity, and provide real-time insights that drive informed decision-making.</p>
                            <div className="value-highlight">
                                <span>Efficiency • Precision • Growth</span>
                            </div>
                        </div>

                        <div className="value-card about-card">
                            <div className="value-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3>Who We Are</h3>
                            <p>Holy Family Polymers is a trusted name in rubber manufacturing with over 25 years of industry expertise. We combine traditional knowledge with modern technology to deliver solutions that meet the evolving needs of manufacturers worldwide.</p>
                            <div className="value-highlight">
                                <span>Experience • Trust • Innovation</span>
                            </div>
                        </div>
                    </div>

                    {/* Company Stats */}
                    <div className="company-stats">
                        <div className="stat-item">
                            <div className="stat-number">25+</div>
                            <div className="stat-label">Years Experience</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Happy Clients</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Navigation Section */}
            <section className="quick-nav-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Explore Our Platform</h2>
                        <p className="section-subtitle">Discover powerful tools designed for rubber manufacturing excellence</p>
                    </div>
                    <div className="quick-nav-grid">
                        <Link to="/about" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-info-circle"></i>
                            </div>
                            <h3>About Holy Family</h3>
                            <p>Learn about our mission to revolutionize rubber manufacturing operations.</p>
                        </Link>

                        <Link to="/history" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-history"></i>
                            </div>
                            <h3>Our Journey</h3>
                            <p>From humble beginnings to industry leadership in manufacturing solutions.</p>
                        </Link>

                        <Link to="/gallery" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-images"></i>
                            </div>
                            <h3>Platform Gallery</h3>
                            <p>See our dashboard in action across various manufacturing facilities.</p>
                        </Link>

                        <Link to="/contact" className="nav-card">
                            <div className="nav-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h3>Get Support</h3>
                            <p>Connect with our team for demos, support, and integration assistance.</p>
                        </Link>

                        <Link to="/login" className="nav-card login-card" aria-label="Login">
                            <div className="nav-icon">
                                <i className="fas fa-sign-in-alt"></i>
                            </div>
                            <h3>Access Dashboard <span className="nav-cta" aria-hidden="true"><i className="fas fa-arrow-right"></i></span></h3>
                            <p>Login to your Holy Family Polymers management system</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Highlight Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Holy Family Polymers?</h2>
                        <p className="section-subtitle">Comprehensive solutions tailored for rubber manufacturing excellence</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-tachometer-alt"></i>
                            </div>
                            <h3>Precision & Speed</h3>
                            <p>Clean UI and modular design empower you to manage operations with unmatched speed and accuracy.</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-calculator"></i>
                            </div>
                            <h3>Financial Management</h3>
                            <p>Integrated tax filing, profitability analysis, and bank reconciliation for complete financial control.</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-cubes"></i>
                            </div>
                            <h3>Inventory Tracking</h3>
                            <p>Real-time tracking of latex barrels, stock monitoring, and automated shortage alerts.</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-users-cog"></i>
                            </div>
                            <h3>Payroll Management</h3>
                            <p>Automated wage calculations with verification workflows, ensuring fair and timely payments to staff.</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-chart-bar"></i>
                            </div>
                            <h3>Analytics & Reports</h3>
                            <p>Comprehensive reporting and analytics to track performance, costs, and operational efficiency.</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-mobile-alt"></i>
                            </div>
                            <h3>Mobile Ready</h3>
                            <p>Access your dashboard from anywhere with our responsive design and mobile-optimized interface.</p>
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
                                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Manufacturing Update" onError={(e) => e.target.src = 'https://via.placeholder.com/600x400/1e3c72/ffffff?text=Module+Update'} />
                            </div>
                            <div className="news-content">
                                <span className="news-category">System Update</span>
                                <h3>New Profitability Module Live</h3>
                                <p>We've launched the new Profitability Dashboard, allowing you to track margins in real-time across all product lines.</p>
                                <span className="news-time">2 days ago</span>
                            </div>
                        </article>

                        <article className="news-card">
                            <div className="news-image">
                                <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Sustainability Award" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/2a5298/ffffff?text=Award'} />
                            </div>
                            <div className="news-content">
                                <span className="news-category">Awards</span>
                                <h3>Best Industrial UX 2025</h3>
                                <p>Antigravity receives recognition for outstanding user experience in manufacturing software.</p>
                                <span className="news-time">1 week ago</span>
                            </div>
                        </article>

                        <article className="news-card">
                            <div className="news-image">
                                <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Partnership News" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/1e3c72/ffffff?text=Partnership'} />
                            </div>
                            <div className="news-content">
                                <span className="news-category">Partnerships</span>
                                <h3>New Vendor Integrations</h3>
                                <p>Seamlessly connect with top chemical suppliers for automated reordering.</p>
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
                        <h2>Ready to Transform Your Operations?</h2>
                        <p>Join smart manufacturers who trust Holy Family Polymers for their operations.</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Request Demo</Link>
                            <Link to="/login" className="btn btn-secondary">Login to Dashboard</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Footer */}
            <footer className="modern-footer">
                <div className="container">
                    <div className="footer-main">
                        {/* Company Info Section */}
                        <div className="footer-company">
                            <div className="company-logo-section">
                                <div className="footer-logo">
                                    <div className="logo-icon">HF</div>
                                    <div className="logo-text">
                                        <span className="company-name">HOLY FAMILY POLYMERS</span>
                                        <span className="company-tagline">PVT LTD</span>
                                    </div>
                                </div>
                            </div>
                            <p className="company-description">
                                Holy Family Group of companies with its head office in Kottayam have been processing 
                                natural rubber for the last 25 years
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link facebook" aria-label="Facebook">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="social-link twitter" aria-label="Twitter">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links Section */}
                        <div className="footer-links">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/history">Our History</Link></li>
                                <li><Link to="/gallery">Gallery</Link></li>
                                <li><Link to="/contact">Contact Us</Link></li>
                                <li><Link to="/login">Dashboard Login</Link></li>
                            </ul>
                        </div>

                        {/* Office Section */}
                        <div className="footer-office">
                            <h4>Office</h4>
                            <div className="office-info">
                                <p className="office-name">Holy Family Polymers (India) Pvt Ltd.</p>
                                <div className="office-address">
                                    <p>Industrial Estate, Rubber Park</p>
                                    <p>Kottayam, Kerala 686001</p>
                                    <p>India</p>
                                </div>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <i className="fas fa-phone"></i>
                                        <span>+91 481 2345678</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-phone"></i>
                                        <span>+91 9876543210</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>info@holyfamilypolymers.com</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>support@holyfamilypolymers.com</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Factory Section */}
                        <div className="footer-factory">
                            <h4>Factory</h4>
                            <div className="factory-info">
                                <p className="factory-name">Holy Family Polymers (India) Pvt Ltd.</p>
                                <div className="factory-address">
                                    <p>Manufacturing Unit</p>
                                    <p>Rubber Processing Plant</p>
                                    <p>Kottayam District, Kerala, India</p>
                                </div>
                                <div className="contact-info">
                                    <div className="contact-item">
                                        <i className="fas fa-phone"></i>
                                        <span>+91 481 2345679</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-phone"></i>
                                        <span>+91 9876543211</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>factory@holyfamilypolymers.com</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-clock"></i>
                                        <span>Mon-Fri: 9AM-6PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom">
                        <p>&copy; 2025 Holy Family Polymers. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;