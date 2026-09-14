// backend/routes/tests.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getTest, submitTest, getAllResults } = require('../controllers/testsController');
const pool = require('../db/pool');

// 🔥 DEBUG: Alle Requests loggen
router.use((req, res, next) => {
    console.log('📡 Tests Route:', req.method, req.path, 'User:', req.user?.id);
    next();
});

router.use(authenticateToken);

router.get('/:testId', getTest);
router.post('/:testId/submit', submitTest);
router.get('/results/all', getAllResults);

// DELETE Route für Ergebnisse
router.delete('/results/:id', async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    console.log('🗑️ DELETE Ergebnis:', id, 'User:', userId);
    
    try {
        const result = await pool.query(
            'DELETE FROM test_results WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ergebnis nicht gefunden' });
        }
        
        res.json({ message: '✅ Ergebnis gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

module.exports = router;