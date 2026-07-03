const express = require('express');
const auth = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();

    // Alle Transaktionen eines Benutzers laden
    router.get('/', auth, async (req, res) => {
        try {
            const result = await pool.query(
                `SELECT t.*, c.name as category_name 
                 FROM transactions t
                 LEFT JOIN categories c ON t.category_id = c.id
                 WHERE t.user_id = $1
                 ORDER BY t.transaction_date DESC`,
                [req.user.id]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Fehler beim Laden der Transaktionen:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    // Neue Transaktion erstellen
    router.post('/', auth, async (req, res) => {
        const { amount, description, transaction_date, category_id, type } = req.body;

        if (!amount || !type || amount <= 0) {
            return res.status(400).json({ error: 'Ungültige Daten' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO transactions (user_id, amount, description, transaction_date, category_id, type)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [req.user.id, amount, description || null, transaction_date || new Date(), category_id || null, type]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Fehler beim Erstellen der Transaktion:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    // Transaktion löschen
    router.delete('/:id', auth, async (req, res) => {
        const id = parseInt(req.params.id);

        try {
            const result = await pool.query(
                'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, req.user.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Transaktion nicht gefunden' });
            }

            res.json({ message: 'Transaktion gelöscht', id });
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    return router;
};