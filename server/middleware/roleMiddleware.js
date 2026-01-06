// Role-based authorization middleware
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No user found.'
            });
        }

        // Convert single role to array
        if (typeof roles === 'string') {
            roles = [roles];
        }

        // Check if user has required role
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

// Specific role middleware functions
const requireAdmin = authorize(['admin']);
const requireManager = authorize(['manager']);
const requireAccountant = authorize(['accountant']);
const requireManagerOrAdmin = authorize(['manager', 'admin']);
const requireAccountantOrManager = authorize(['accountant', 'manager']);
const requireAccountantManagerOrAdmin = authorize(['accountant', 'manager', 'admin']);

module.exports = {
    authorize,
    requireAdmin,
    requireManager,
    requireAccountant,
    requireManagerOrAdmin,
    requireAccountantOrManager,
    requireAccountantManagerOrAdmin
};