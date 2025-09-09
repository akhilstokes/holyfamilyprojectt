import React from 'react';
import './AboutPage.css'; // Import the new CSS

const AboutPage = () => {
    return (
        <div className="about-page">
            <header className="about-header">
                <h1>About Holy Family Polymers</h1>
                <p>Pioneering quality and trust in the natural rubber latex industry since our inception.</p>
            </header>

            <main className="about-content">
                <section className="about-section">
                    <h2>Our Story</h2>
                    <div className="story-grid">
                       
                     <div className="story-image">
    {/* Change the src to the new public path */}
                       <img src="/images/images2.jpeg" alt="Rubber Plantation" />
                        </div>
                        
                        <div className="story-text">
                            <p>
                                Founded in the heart of Kerala's rubber country, Kottayam, Holy Family Polymers was born from a desire to create a transparent and efficient link between local rubber farmers and the global market.
                            </p>
                            <p>
                                We saw the hard work of our community and built a platform that not only ensures fair pricing but also streamlines the entire process through technology. Our commitment is to uphold the values of integrity, quality, and community in every transaction.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>Our Values</h2>
                    <div className="values-grid">
                        <div className="value-card">
                            <i className="fas fa-check-circle value-icon"></i>
                            <h3>Quality First</h3>
                            <p>We are dedicated to providing the highest grade of natural rubber latex, meeting stringent quality standards.</p>
                        </div>
                        <div className="value-card">
                            <i className="fas fa-handshake value-icon"></i>
                            <h3>Integrity & Trust</h3>
                            <p>Our business is built on transparent pricing and honest relationships with our valued suppliers and clients.</p>
                        </div>
                        <div className="value-card">
                            <i className="fas fa-users value-icon"></i>
                            <h3>Community Focused</h3>
                            <p>We are committed to empowering local farmers and contributing to the growth of our community in Kottayam.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;

