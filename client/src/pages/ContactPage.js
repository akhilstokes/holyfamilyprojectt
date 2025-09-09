import React from "react";
import "./ContactPage.css";

const ContactPage = () => {
    return (
        <div className="contact-page">
            <h1>Contact Holy Family Polymers</h1>
            <p>
                Have questions about our products, orders, or services? 
                We’re here to help. Reach out to us through any of the options below.
            </p>

            <div className="contact-grid">
                {/* Phone */}
                <a href="tel:+919876543210" className="contact-card">
                    <i className="fas fa-phone-alt contact-icon"></i>
                    <h3>Call Us</h3>
                    <p>+91 98765 43210</p>
                </a>

                {/* Email */}
                <a href="mailto:holyfamilypolymers@gmail.com" className="contact-card">
                    <i className="fas fa-envelope contact-icon"></i>
                    <h3>Email Us</h3>
                    <p>holyfamilypolymers@gmail.com</p>
                </a>

                {/* Location */}
                <a
                    href="https://maps.google.com/?q=HolyFamily+Polymers,Kottayam,Kerala"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-card"
                >
                    <i className="fas fa-map-marker-alt contact-icon"></i>
                    <h3>Visit Us</h3>
                    <p>Holy Family Polymers, Kottayam, Kerala</p>
                </a>
            </div>
        </div>
    );
};

export default ContactPage;