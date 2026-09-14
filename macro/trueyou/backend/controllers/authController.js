const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

async function register(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Alle Felder erforderlich' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Passwort mind. 6 Zeichen' });
    }

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, is_premium',
            [username, email, password_hash]
        );
        const user = result.rows[0];
        
        // 🔥 JWT erstellen
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );
        
        // 🔥 COOKIE SETZEN (statt JSON)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 Jahr
        });
        
        // 🔥 KEIN Token mehr im JSON-Body!
        res.status(201).json({ 
            message: 'Registrierung erfolgreich', 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_premium: user.is_premium
            }
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Benutzername oder Email existiert bereits' });
        }
        console.error('Register Error:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            'SELECT id, username, email, password_hash, is_premium FROM users WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }
        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }
        
        // 🔥 JWT erstellen
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );
        
        // 🔥 COOKIE SETZEN
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000
        });
        
        // 🔥 KEIN Token mehr im JSON!
        res.json({ 
            message: 'Login erfolgreich', 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                is_premium: user.is_premium
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

async function verify(req, res) {
    // 🔥 User kommt aus dem Middleware (wird aus Cookie gelesen)
    res.json({ user: req.user });
}

// 🔥 NEU: Logout
async function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ message: 'Abgemeldet' });
}

module.exports = { register, login, verify, logout };