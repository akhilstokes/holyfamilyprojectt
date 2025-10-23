import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserModule.css';

const UserModule = ({ showIcons = true, showProfile = true, showLogout = true }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            navigate('/login');
        }
    };

    return (
        <div className="user-module">

            {/* Right: actions + profile */}
            <div className="user-module-right">
                {showIcons && (
                    <div className="user-module-icons">
                        <button className="icon-btn notification-btn" title="Notifications" onClick={() => navigate('/user/notifications')}>
                            <i className="fas fa-bell"></i>
                            <span className="notification-badge"></span>
                        </button>
                        
                    </div>
                )}

                {/* Profile Section */}
                {showProfile && (
                    <div className="user-module-profile">
                        <div className="profile-info" onClick={() => navigate('/user/profile/view')}>
                            <div className="profile-avatar">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" />
                                ) : (
                                    <i className="fas fa-user"></i>
                                )}
                            </div>
                            <div className="profile-details">
                                <span className="profile-name">
                                    {user?.name ? user.name.toUpperCase() : 'USER'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="profile-menu" ref={menuRef}>
                            <button 
                                type="button" 
                                className="profile-dropdown-btn"
                                onClick={() => setMenuOpen(!menuOpen)}
                            >
                                <i className="fas fa-ellipsis-v"></i>
                            </button>
                            
                            {menuOpen && (
                                <div className="profile-dropdown">
                                    <NavLink 
                                        to="/user/profile/view" 
                                        className="dropdown-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <i className="fas fa-eye"></i>
                                        <span>View Profile</span>
                                    </NavLink>
                                    <NavLink 
                                        to="/user/profile" 
                                        className="dropdown-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <i className="fas fa-pen"></i>
                                        <span>Edit Profile</span>
                                    </NavLink>
                                    {showLogout && (
                                        <button 
                                            className="dropdown-item logout-item"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                handleLogout();
                                            }}
                                        >
                                            <i className="fas fa-unlock"></i>
                                            <span>Logout</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserModule;
