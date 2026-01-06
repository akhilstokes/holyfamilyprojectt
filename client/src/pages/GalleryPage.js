
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import './GalleryPage.css';

const GalleryPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedImage, setSelectedImage] = useState(null);

    const galleryItems = [
        {
            id: 1,
            title: 'Dashboard Overview',
            category: 'dashboard',
            image: '/images/dashboard-main.jpg',
            description: 'Main dashboard showing real-time analytics and key metrics for rubber manufacturing operations.'
        },
        {
            id: 2,
            title: 'Payroll Management',
            category: 'payroll',
            image: '/images/payroll-interface.jpg',
            description: 'Automated payroll calculation system with wage verification workflows.'
        },
        {
            id: 3,
            title: 'Inventory Tracking',
            category: 'inventory',
            image: '/images/inventory-system.jpg',
            description: 'Real-time latex barrel tracking and stock monitoring system.'
        },
        {
            id: 4,
            title: 'Financial Reports',
            category: 'reports',
            image: '/images/financial-reports.jpg',
            description: 'Comprehensive financial reporting and profitability analysis tools.'
        },
        {
            id: 5,
            title: 'Manufacturing Floor',
            category: 'facility',
            image: '/images/manufacturing-floor.jpg',
            description: 'Holy Family Polymers manufacturing facility with modern equipment.'
        },
        {
            id: 6,
            title: 'Quality Control Lab',
            category: 'facility',
            image: '/images/quality-lab.jpg',
            description: 'State-of-the-art quality control laboratory for rubber testing.'
        },
        {
            id: 7,
            title: 'Mobile Dashboard',
            category: 'dashboard',
            image: '/images/mobile-dashboard.jpg',
            description: 'Responsive mobile interface for on-the-go management.'
        },
        {
            id: 8,
            title: 'Analytics Dashboard',
            category: 'reports',
            image: '/images/analytics-dashboard.jpg',
            description: 'Advanced analytics and business intelligence dashboard.'
        },
        {
            id: 9,
            title: 'Staff Management',
            category: 'payroll',
            image: '/images/staff-management.jpg',
            description: 'Employee management system with attendance tracking.'
        },
        {
            id: 10,
            title: 'Production Line',
            category: 'facility',
            image: '/images/production-line.jpg',
            description: 'Automated rubber production line with quality monitoring.'
        },
        {
            id: 11,
            title: 'Billing System',
            category: 'dashboard',
            image: '/images/billing-system.jpg',
            description: 'Automated latex billing and invoice generation system.'
        },
        {
            id: 12,
            title: 'Warehouse Management',
            category: 'inventory',
            image: '/images/warehouse.jpg',
            description: 'Modern warehouse facility with automated inventory tracking.'
        }
    ];

    const categories = [
        { id: 'all', name: 'All Images', icon: 'fas fa-th' },
        { id: 'dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'payroll', name: 'Payroll', icon: 'fas fa-users' },
        { id: 'inventory', name: 'Inventory', icon: 'fas fa-boxes' },
        { id: 'reports', name: 'Reports', icon: 'fas fa-chart-bar' },
        { id: 'facility', name: 'Facility', icon: 'fas fa-industry' }
    ];

    const filteredItems = selectedCategory === 'all' 
        ? galleryItems 
        : galleryItems.filter(item => item.category === selectedCategory);

    const openModal = (item) => {
        setSelectedImage(item);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    return (
        <div className="gallery-page">
            <Navbar />
            {/* Hero Section */}
            <section className="gallery-hero">
                <div className="container">
                    <div className="hero-content">
                        <h1>Platform Gallery</h1>
                        <p>Explore our comprehensive dashboard and manufacturing facilities through our visual showcase.</p>
                    </div>
                </div>
            </section>

            {/* Gallery Content */}
            <section className="gallery-content">
                <div className="container">
                    {/* Category Filter */}
                    <div className="category-filter">
                        <h2>Browse by Category</h2>
                        <div className="filter-buttons">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(category.id)}
                                >
                                    <i className={category.icon}></i>
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="gallery-grid">
                        {filteredItems.map(item => (
                            <div key={item.id} className="gallery-item" onClick={() => openModal(item)}>
                                <div className="image-container">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        onError={(e) => e.target.src = `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title)}`}
                                    />
                                    <div className="image-overlay">
                                        <div className="overlay-content">
                                            <h3>{item.title}</h3>
                                            <p>{item.description}</p>
                                            <div className="view-btn">
                                                <i className="fas fa-expand"></i>
                                                View Full Size
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats Section */}
                    <div className="gallery-stats">
                        <div className="stats-grid">
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-images"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>50+</h3>
                                    <p>Screenshots</p>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-desktop"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>12</h3>
                                    <p>Dashboard Views</p>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-industry"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>5</h3>
                                    <p>Facility Areas</p>
                                </div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">
                                    <i className="fas fa-chart-line"></i>
                                </div>
                                <div className="stat-content">
                                    <h3>8</h3>
                                    <p>Report Types</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="gallery-cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Experience Our Platform?</h2>
                        <p>See these features in action with a personalized demo of our system.</p>
                        <div className="cta-buttons">
                            <Link to="/contact" className="btn btn-primary">Request Demo</Link>
                            <Link to="/login" className="btn btn-secondary">Login to Dashboard</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {selectedImage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>
                            <i className="fas fa-times"></i>
                        </button>
                        <div className="modal-image">
                            <img
                                src={selectedImage.image}
                                alt={selectedImage.title}
                                onError={(e) => e.target.src = `https://via.placeholder.com/800x600?text=${encodeURIComponent(selectedImage.title)}`}
                            />
                        </div>
                        <div className="modal-info">
                            <h3>{selectedImage.title}</h3>
                            <p>{selectedImage.description}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryPage;

