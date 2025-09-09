import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
                    <li className="nav-item">
                        <NavLink to="/buying" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
                            Buying
                        </NavLink>
                    </li>
                </ul>

                {/* Auth Buttons */}
                <div className="nav-auth-buttons">
                    <Link to="/login" className="nav-button btn-login">Login</Link>
                    <Link to="/register" className="nav-button btn-register">Register</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
