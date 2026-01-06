import React from 'react';
import { Link } from 'react-router-dom';

const VerifySidebar = () => {
    return (
        <div style={{ padding: '20px', background: 'white', height: '100vh' }}>
            <h1>Router Verification Page</h1>
            <p>If you see this, React Router is working correctly.</p>
            <p>Current URL: {window.location.href}</p>
            <Link to="/accountant" style={{ display: 'block', marginTop: '20px', color: 'blue' }}>
                Go Back to Accountant Dashboard
            </Link>
        </div>
    );
};

export default VerifySidebar;
