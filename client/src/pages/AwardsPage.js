import React from 'react';
import Navbar from '../components/common/Navbar';
import './AwardsPage.css';

const AwardsPage = () => {
    return (
        <div className="awards-page">
            <Navbar />
            
            {/* Hero Section */}
            <section className="awards-hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Awards & Recognition</h1>
                        <p>Celebrating excellence in rubber manufacturing innovation and outstanding achievements in industrial technology solutions.</p>
                    </div>
                </div>
            </section>

            {/* Awards Grid */}
            <section className="awards-content">
                <div className="container">
                    <div className="section-header">
                        <h2>Our Achievements</h2>
                        <p>Recognition from industry leaders and organizations worldwide</p>
                    </div>

                    <div className="awards-grid">
                        <div className="award-card featured">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Best Industrial UX Award 2025"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Award+2025'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2025</div>
                                <h3>Best Industrial UX Award</h3>
                                <p>Recognized for outstanding user experience design in manufacturing software solutions.</p>
                                <div className="award-organization">Industrial Design Council</div>
                            </div>
                        </div>

                        <div className="award-card">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Innovation Excellence Award 2024"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Innovation+2024'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2024</div>
                                <h3>Innovation Excellence Award</h3>
                                <p>For breakthrough innovations in rubber manufacturing automation and process optimization.</p>
                                <div className="award-organization">Manufacturing Innovation Forum</div>
                            </div>
                        </div>

                        <div className="award-card">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Technology Leadership Award 2024"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Technology+2024'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2024</div>
                                <h3>Technology Leadership Award</h3>
                                <p>Leading the industry in digital transformation and smart manufacturing solutions.</p>
                                <div className="award-organization">Tech Leaders Association</div>
                            </div>
                        </div>

                        <div className="award-card">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Sustainability Champion 2023"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Sustainability+2023'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2023</div>
                                <h3>Sustainability Champion</h3>
                                <p>Commitment to environmental responsibility and sustainable manufacturing practices.</p>
                                <div className="award-organization">Green Manufacturing Alliance</div>
                            </div>
                        </div>

                        <div className="award-card">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Quality Excellence Award 2023"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Quality+2023'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2023</div>
                                <h3>Quality Excellence Award</h3>
                                <p>Maintaining the highest standards in product quality and customer satisfaction.</p>
                                <div className="award-organization">Quality Assurance Institute</div>
                            </div>
                        </div>

                        <div className="award-card">
                            <div className="award-image">
                                <img 
                                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                                    alt="Industry Pioneer Award 2022"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x300/10b981/ffffff?text=Pioneer+2022'}
                                />
                            </div>
                            <div className="award-content">
                                <div className="award-year">2022</div>
                                <h3>Industry Pioneer Award</h3>
                                <p>25 years of pioneering contributions to the rubber manufacturing industry.</p>
                                <div className="award-organization">Rubber Industry Council</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recognition Stats */}
            <section className="recognition-stats">
                <div className="container">
                    <h2>Recognition by Numbers</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">15+</div>
                            <div className="stat-label">Awards Won</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">8</div>
                            <div className="stat-label">Industry Recognitions</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">25+</div>
                            <div className="stat-label">Years of Excellence</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">100%</div>
                            <div className="stat-label">Customer Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="certifications-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Certifications & Standards</h2>
                        <p>Maintaining the highest industry standards and compliance</p>
                    </div>
                    <div className="certifications-grid">
                        <div className="cert-item">
                            <div className="cert-icon">
                                <i className="fas fa-certificate"></i>
                            </div>
                            <h3>ISO 9001:2015</h3>
                            <p>Quality Management Systems</p>
                        </div>
                        <div className="cert-item">
                            <div className="cert-icon">
                                <i className="fas fa-leaf"></i>
                            </div>
                            <h3>ISO 14001:2015</h3>
                            <p>Environmental Management</p>
                        </div>
                        <div className="cert-item">
                            <div className="cert-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3>ISO 45001:2018</h3>
                            <p>Occupational Health & Safety</p>
                        </div>
                        <div className="cert-item">
                            <div className="cert-icon">
                                <i className="fas fa-award"></i>
                            </div>
                            <h3>ASTM Standards</h3>
                            <p>Material Testing & Quality</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AwardsPage;