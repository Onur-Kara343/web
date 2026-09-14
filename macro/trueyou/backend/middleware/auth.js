const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // 🔥 Token aus Cookie statt Header
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ error: 'Nicht eingeloggt' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token ungültig oder abgelaufen' });
    }
}

module.exports = { authenticateToken };