import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { validateTokenFormat, clearCorruptedToken as clearToken } from '../utils/tokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(true);

    // Validate token on app start
    useEffect(() => {
        validateToken();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateToken = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setLoading(false);
            setIsAuthenticated(false);
            return;
        }

        // Validate token format using utility
        const tokenValidation = validateTokenFormat(token);
        if (!tokenValidation.valid) {
            console.error('Invalid token format in localStorage:', tokenValidation.reason);
            clearToken();
            logout();
            return;
        }

        try {
            // Set default authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/validate-token`);
            
            if (response.data.valid) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                
                // Check if registration is complete but don't log out; store status for UI flows
                const regResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/registration-status`);
                setRegistrationComplete(!!regResponse.data.isComplete);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            
            // Handle specific error types
            if (error.response?.status === 401) {
                // Token is invalid, clear it
                logout();
            } else {
                // Network or other error, keep token but mark as not authenticated
                setIsAuthenticated(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                email,
                password
            });

            const { token, user: userData } = response.data;
            
            // Validate token format before storing
            const tokenValidation = validateTokenFormat(token);
            if (!tokenValidation.valid) {
                throw new Error(`Invalid token received from server: ${tokenValidation.reason}`);
            }
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Check registration status (do not log out on incomplete; allow partial login and let UI guide)
            const regResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/registration-status`);
            setRegistrationComplete(!!regResponse.data.isComplete);

            setUser(userData);
            setIsAuthenticated(true);
            
            return { success: true, user: userData };
        } catch (error) {
            throw error;
        }
    };

    const staffLogin = async (staffId) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/staff-login`, {
                staffId,
            });

            const { token, user: userData } = response.data;

            const tokenValidation = validateTokenFormat(token);
            if (!tokenValidation.valid) {
                throw new Error(`Invalid token received from server: ${tokenValidation.reason}`);
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(userData);
            setIsAuthenticated(true);

            return { success: true, user: userData };
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, userData);
            
            const { token, user: newUser } = response.data;
            
            // Validate token format before storing
            const tokenValidation = validateTokenFormat(token);
            if (!tokenValidation.valid) {
                throw new Error(`Invalid token received from server: ${tokenValidation.reason}`);
            }
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(newUser));
            
            // Set authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(newUser);
            setIsAuthenticated(true);
            setRegistrationComplete(true);
            
            return { success: true, user: newUser };
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setRegistrationComplete(true);
    };

    // Utility function to clear corrupted tokens
    const clearCorruptedToken = () => {
        clearToken();
        logout();
    };

    const googleSignIn = async (credential) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google-signin`, {
                token: credential
            });

            const { token, user: userData } = response.data;
            
            // Validate token format before storing
            const tokenValidation = validateTokenFormat(token);
            if (!tokenValidation.valid) {
                throw new Error(`Invalid token received from server: ${tokenValidation.reason}`);
            }
            
            // Store token and user data
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set authorization header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(userData);
            setIsAuthenticated(true);
            
            return { success: true, user: userData };
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        registrationComplete,
        login,
        register,
        staffLogin,
        logout,
        googleSignIn,
        validateToken,
        clearCorruptedToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
