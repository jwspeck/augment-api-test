// User Authentication Middleware for Azure Easy Auth
require('dotenv').config();

/**
 * Extract user information from Azure Easy Auth headers
 * Azure Easy Auth injects user info into headers when authentication is enabled
 */
const getUserAuth = (req, res, next) => {
    // Skip auth for static files
    if (req.path === '/' ||
        req.path.endsWith('.js') ||
        req.path.endsWith('.css') ||
        req.path.endsWith('.html') ||
        req.path.endsWith('.ico')) {
        return next();
    }

    // Azure Easy Auth headers
    // When Easy Auth is enabled, Azure injects these headers
    const userPrincipal = req.headers['x-ms-client-principal-name']; // email or username
    const userId = req.headers['x-ms-client-principal-id']; // unique user ID
    const userIdp = req.headers['x-ms-client-principal-idp']; // identity provider (google, microsoft, etc)

    // For local development without Azure Easy Auth
    if (process.env.NODE_ENV === 'development' && !userPrincipal) {
        // Use a default test user for local development
        req.user = {
            id: 'dev-user-123',
            name: 'Developer User',
            email: 'dev@localhost',
            provider: 'local'
        };
        console.log('🔓 Development mode: Using test user');
        return next();
    }

    // Check if user is authenticated (Azure Easy Auth enabled)
    if (!userPrincipal || !userId) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required. Please log in.',
            hint: 'Azure Easy Auth must be enabled. See DEPLOYMENT.md for setup instructions.'
        });
    }

    // Attach user info to request object
    req.user = {
        id: userId,
        name: userPrincipal,
        email: userPrincipal,
        provider: userIdp || 'unknown'
    };

    console.log(`✅ Authenticated user: ${req.user.email} (${req.user.provider})`);
    next();
};

module.exports = getUserAuth;

