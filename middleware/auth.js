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

    // If Azure Easy Auth headers are not present, use a default user
    // This allows the app to work before Azure Easy Auth is configured
    // SECURITY NOTE: Once you enable Azure Easy Auth, all users will have unique IDs
    if (!userPrincipal || !userId) {
        // Use a default user when Easy Auth is not configured
        req.user = {
            id: process.env.NODE_ENV === 'development' ? 'dev-user-123' : 'default-user',
            name: process.env.NODE_ENV === 'development' ? 'Developer User' : 'Anonymous User',
            email: process.env.NODE_ENV === 'development' ? 'dev@localhost' : 'anonymous@example.com',
            provider: 'none'
        };
        console.log('⚠️  No authentication configured - using default user. Enable Azure Easy Auth for multi-user support.');
        return next();
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

