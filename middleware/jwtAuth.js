const jwt = require('jsonwebtoken');
require('dotenv').config();


// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  // Get token from headers

    if (!token) return res.status(401).json({ error: 'Token not found' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        
        if (err) {
            return res.status(403).json({ error: 'Token is not valid' });
        }

        req.user = user;  // Store user info in req object
        next();  // Move to the next middleware or route handler
    });
};

module.exports = authenticateToken;