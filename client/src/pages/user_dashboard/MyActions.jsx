import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './userDashboardTheme.css';

const MyActions = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Mock data for user actions - replace with API calls
    const [actions, setActions] = useState([]);

    useEffect(() => {
        // Simulate loading actions
        setTimeout(() => {
            setActions([
                {
                    id: 1,
                    type: 'sell_request',
                    title: 'Sell Barrel Request',
                    description: 'Submit barrels for sale and get paid',
                    icon: 'fas fa-truck-loading',
                    link: '/user/requests',
                    color: '#10b981',
                    status: 'available'
                },
                {
                    id: 2,
                    type: 'barrel_request',
                    title: 'Request Barrels',
                    description: 'Request empty barrels for latex collection',
                    icon: 'fas fa-box-open',
                    link: '/user/requests',
                    color: '#3b82f6',
                    status: 'available'
                },
                {
                    id: 3,
                    type: 'view_rate',
                    title: 'View Live Rate',
                    description: 'Check current market rate for latex',
                    icon: 'fas fa-chart-line',
                    link: '/user/live-rate',
                    color: '#f59e0b',
                    status: 'available'
                },
                {
                    id: 4,
                    type: 'transactions',
                    title: 'View Transactions',
                    description: 'Browse your payment history and bills',
                    icon: 'fas fa-receipt',
                    link: '/user/transactions',
                    color: '#8b5cf6',
                    status: 'available'
                },
                {
                    id: 5,
                    type: 'complaint',
                    title: 'Report Issue',
                    description: 'Submit a complaint or report a problem',
                    icon: 'fas fa-exclamation-triangle',
                    link: '/user/requests',
                    color: '#ef4444',
                    status: 'available'
                },
                {
                    id: 6,
                    type: 'profile',
                    title: 'Update Profile',
                    description: 'View and edit your profile information',
                    icon: 'fas fa-user-edit',
                    link: '/user/profile',
                    color: '#06b6d4',
                    status: 'available'
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

    if (loading) {
        return (
            <div className="my-actions-page" style={{ padding: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#10b981' }}></i>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading your actions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-actions-page" style={{ padding: '1.5rem 2rem' }}>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: '0 0 0.5rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <i className="fas fa-tasks" style={{ color: '#10b981' }}></i>
                    My Actions
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                    Welcome back, <strong>{user?.name || 'Customer'}</strong>! Here's what you can do:
                </p>
            </div>

            {/* Actions Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem'
            }}>
                {actions.map((action) => (
                    <NavLink
                        key={action.id}
                        to={action.link}
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            className="action-card"
                            style={{
                                background: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '14px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                                e.currentTarget.style.borderColor = action.color;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            {/* Icon */}
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${action.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <i className={action.icon} style={{ fontSize: '1.25rem', color: action.color }}></i>
                            </div>

                            {/* Content */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    margin: '0 0 6px 0'
                                }}>
                                    {action.title}
                                </h3>
                                <p style={{
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    margin: 0,
                                    lineHeight: '1.5'
                                }}>
                                    {action.description}
                                </p>
                            </div>

                            {/* Arrow */}
                            <div style={{
                                position: 'absolute',
                                right: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#cbd5e1',
                                fontSize: '1rem'
                            }}>
                                <i className="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </NavLink>
                ))}
            </div>

            {/* Quick Stats */}
            <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '14px',
                color: 'white'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
                    <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                    Quick Tips
                </h3>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.8' }}>
                    <li>Check the <strong>Live Rate</strong> before submitting sell requests</li>
                    <li>Keep your phone number updated for notifications</li>
                    <li>Track your request status in <strong>Transactions</strong></li>
                </ul>
            </div>
        </div>
    );
};

export default MyActions;
