import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

const PublicLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet /> {/* This will render the specific page content */}
            </main>
        </>
    );
};

export default PublicLayout;