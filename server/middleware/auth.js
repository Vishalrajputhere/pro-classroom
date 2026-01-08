const jwt = require('jsonwebtoken');
<<<<<<< HEAD

module.exports = function (req, res, next) {
    const token = req.header('x-auth-token');

=======
require('dotenv').config();

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
>>>>>>> 073f7c55b2eb5c86d7b785dc51a71b800e35acf3
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

<<<<<<< HEAD
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Attach directly
        req.user = {
            id: decoded.user.id,
            role: decoded.user.role
        };

=======
    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user to the request object
        req.user = decoded.user;
>>>>>>> 073f7c55b2eb5c86d7b785dc51a71b800e35acf3
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> 073f7c55b2eb5c86d7b785dc51a71b800e35acf3
