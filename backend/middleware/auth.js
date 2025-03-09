const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (roles = []) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({ 
                    message: 'Authorization header is missing'
                });
            }

            // Fix double Bearer issue
            const token = authHeader.replace(/^Bearer\s+Bearer\s+/, 'Bearer ').split(' ')[1];
            
            if (!token || token === 'undefined' || token === 'null') {
                return res.status(401).json({ 
                    message: 'Valid token not provided' 
                });
            }

            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not defined in environment variables');
                return res.status(500).json({ 
                    message: 'Server configuration error' 
                });
            }

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Admin always has access
                if (decoded.role && decoded.role.toLowerCase() === 'admin') {
                    req.user = decoded;
                    return next();
                }

                // Role-based access check
                if (roles.length && !roles.includes(decoded.role?.toLowerCase())) {
                    console.log('Access denied - User role not in allowed roles');
                    return res.status(403).json({ 
                        message: 'Access denied - Insufficient privileges'
                    });
                }

                req.user = decoded;
                next();
            } catch (jwtError) {
                console.error('JWT verification failed:', jwtError);
                return res.status(401).json({ 
                    message: 'Invalid token format or signature'
                });
            }
        } catch (error) {
            console.error('Authentication middleware error:', error);
            res.status(500).json({ 
                message: 'Internal server error during authentication'
            });
        }
    };
};

module.exports = auth;