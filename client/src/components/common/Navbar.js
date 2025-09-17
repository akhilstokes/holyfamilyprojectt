import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
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
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <div className="navbar-logo">
                        <img 
                            src="/images/logo.png" 
                            alt="Company Logo" 
                            className="company-logo" 
                        />
                        <span className="company-name">Holy Family Polymers</span>
                    </div>
                </Link>

                {/* Menu Links */}
                <ul className="nav-menu">
                    <li className="nav-item">
                        <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/about" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            About
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/history" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            History
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/gallery" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Gallery
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/contact" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Contact
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/administration" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Administration
                        </NavLink>
                    </li>
                </ul>

                {/* Auth Buttons / Profile */}
                {!isAuthenticated ? (
                    <div className="nav-auth-buttons">
                        <Link to="/login" className="nav-button btn-login">Login</Link>
                    </div>
                ) : (
                    <div className="nav-auth-buttons">
                        <div className="profile-menu" ref={menuRef}>
                            <button type="button" className="nav-button btn-login" onClick={() => setMenuOpen(v => !v)}>
                                <i className="fas fa-user-circle" style={{ marginRight: 6 }}></i>
                                {user?.name ? `Hi, ${user.name.split(' ')[0]}` : 'Profile'}
                                <i className="fas fa-caret-down" style={{ marginLeft: 6 }}></i>
                            </button>
                            {menuOpen && (
                                <div className="profile-dropdown">
                                    <NavLink to="/user/profile/view" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                                        <i className="fas fa-eye"></i>
                                        <span>View Profile</span>
                                    </NavLink>
                                    <NavLink to="/user/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                                        <i className="fas fa-pen"></i>
                                        <span>Edit Profile</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                        <button className="nav-button btn-register" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
