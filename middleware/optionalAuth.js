const jwt = require('jsonwebtoken');
module.exports = function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
    } catch (err) {
    }

    next();
};