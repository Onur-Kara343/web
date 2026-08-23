const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = (pool) => {
    const router = express.Router();

    // Registrierung
    router.post('/register', async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
        }

        try {
            const existing = await pool.query(
                'SELECT id FROM users WHERE email = $1 OR username = $2',
                [email, username]
            );
            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'Benutzer existiert bereits' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
                [username, email, hashedPassword]
            );

            const token = jwt.sign(
                { id: result.rows[0].id, username: result.rows[0].username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'Registrierung erfolgreich',
                token,
                user: result.rows[0]
            });

        } catch (error) {
            console.error('Registrierungsfehler:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    // Login
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
        }

        try {
            const result = await pool.query(
                'SELECT id, username, email, password_hash FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
            }

            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password_hash);

            if (!validPassword) {
                return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login erfolgreich',
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });

        } catch (error) {
            console.error('Login-Fehler:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    return router;
};