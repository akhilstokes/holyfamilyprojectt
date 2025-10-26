// Utility functions for token management and debugging

export const validateTokenFormat = (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
        return { valid: false, reason: 'Token is empty or not a string' };
    }
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        return { valid: false, reason: `JWT should have 3 parts, got ${tokenParts.length}` };
    }
    
    // Check if each part is base64-like (basic validation)
    for (let i = 0; i < tokenParts.length; i++) {
        if (!tokenParts[i] || tokenParts[i].length === 0) {
            return { valid: false, reason: `Part ${i + 1} is empty` };
        }
    }
    
    return { valid: true };
};

export const clearCorruptedToken = () => {
    console.log('Clearing corrupted token from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear axios default header
    if (window.axios && window.axios.defaults) {
        delete window.axios.defaults.headers.common['Authorization'];
    }
};

export const debugToken = () => {
    const token = localStorage.getItem('token');
    console.log('Current token in localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
    
    if (token) {
        const validation = validateTokenFormat(token);
        console.log('Token validation:', validation);
        
        if (!validation.valid) {
            console.log('Token is corrupted, clearing...');
            clearCorruptedToken();
        }
    }
};

// Add to window for debugging in browser console
if (typeof window !== 'undefined') {
    window.debugToken = debugToken;
    window.clearCorruptedToken = clearCorruptedToken;
}















































