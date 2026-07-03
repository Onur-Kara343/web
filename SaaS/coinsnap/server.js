const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Verbindungspool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE || 'finance_tracker',
});

// Teste Datenbankverbindung
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Datenbankverbindung fehlgeschlagen:', err.stack);
    } else {
        console.log('✅ Datenbankverbindung erfolgreich');
        release();
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Test-Endpunkt
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// ========== AUTH ROUTES ==========
app.use('/api/auth', require('./routes/auth')(pool));

// ========== API ROUTES (mit Auth) ==========
const auth = require('./middleware/auth');

// Alle Kategorien abrufen (öffentlich)
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Kategorien Fehler:', err);
        res.status(500).json({ error: 'Datenbankfehler', details: err.message });
    }
});

// Neue Kategorie erstellen (mit Auth)
app.post('/api/categories', auth, async (req, res) => {
    const { name, type } = req.body;
    
    if (!name || !type || !['income', 'expense'].includes(type)) {
        return res.status(400).json({ error: 'Ungültige Daten' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
            [name, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Kategorie erstellen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Speichern der Kategorie' });
    }
});

// Kategorie löschen (mit Auth)
app.delete('/api/categories/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }
    
    try {
        await pool.query('UPDATE transactions SET category_id = NULL WHERE category_id = $1', [id]);
        const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Kategorie nicht gefunden' });
        }
        
        res.json({ message: 'Kategorie gelöscht', id: id });
    } catch (err) {
        console.error('❌ Kategorie löschen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

// Transaktionen abrufen (mit Auth)
app.get('/api/transactions', auth, async (req, res) => {
    const { start, end } = req.query;
    
    let query = `
        SELECT t.*, c.name as category_name 
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;
    
    if (start && end) {
        query += ` AND t.transaction_date BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(start, end);
        paramIndex += 2;
    }
    
    query += ` ORDER BY t.transaction_date DESC, t.id DESC`;
    
    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Transaktionen Fehler:', err);
        res.status(500).json({ error: 'Datenbankfehler', details: err.message });
    }
});

// Neue Transaktion hinzufügen (mit Auth)
app.post('/api/transactions', auth, async (req, res) => {
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
    } catch (err) {
        console.error('❌ Transaktion erstellen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

// Transaktion löschen (mit Auth)
app.delete('/api/transactions/:id', auth, async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }
    
    try {
        const result = await pool.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Transaktion nicht gefunden' });
        }
        
        res.json({ message: 'Transaktion gelöscht', id: id });
    } catch (err) {
        console.error('❌ Transaktion löschen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

// Zusammenfassung (mit Auth)
app.get('/api/summary', auth, async (req, res) => {
    const { start, end } = req.query;
    
    let query = `
        SELECT 
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
            COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
            COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as balance
        FROM transactions
        WHERE user_id = $1
    `;
    const params = [req.user.id];
    
    if (start && end) {
        query += ` AND transaction_date BETWEEN $2 AND $3`;
        params.push(start, end);
    }
    
    try {
        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Summary Fehler:', err);
        res.status(500).json({ error: 'Datenbankfehler', details: err.message });
    }
});

app.use('/api/ai-tips', require('./routes/aiTips')(pool));

// ========== SPARBUCH ENDPUNKTE (bleiben bestehen) ==========
app.get('/api/savings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM savings ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Sparbücher Fehler:', err);
        res.status(500).json({ error: 'Datenbankfehler', details: err.message });
    }
});

app.post('/api/savings', async (req, res) => {
    const { name, target_amount, current_amount } = req.body;
    
    if (!name) {
        return res.status(400).json({ error: 'Name ist erforderlich' });
    }
    
    try {
        const result = await pool.query(
            'INSERT INTO savings (name, target_amount, current_amount) VALUES ($1, $2, $3) RETURNING *',
            [name, target_amount || 0, current_amount || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Sparbuch erstellen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

app.put('/api/savings/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, target_amount, current_amount } = req.body;
    
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }
    
    try {
        const result = await pool.query(
            'UPDATE savings SET name = $1, target_amount = $2, current_amount = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, target_amount, current_amount, id]
        );
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Sparbuch nicht gefunden' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Sparbuch aktualisieren Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

app.delete('/api/savings/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }
    
    try {
        const result = await pool.query('DELETE FROM savings WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Sparbuch nicht gefunden' });
        }
        
        res.json({ message: 'Sparbuch gelöscht', id: id });
    } catch (err) {
        console.error('❌ Sparbuch löschen Fehler:', err);
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

app.post('/api/savings/transaction', async (req, res) => {
    const { id, amount, type } = req.body;
    
    console.log('🔍 Sparbuch Transaktion:', { id, amount, type });
    
    const parsedId = parseInt(id);
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedId) || isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ error: 'Ungültige Daten' });
    }
    
    if (type !== 'add' && type !== 'remove') {
        return res.status(400).json({ error: 'Ungültiger Transaktionstyp' });
    }
    
    try {
        const current = await pool.query('SELECT current_amount FROM savings WHERE id = $1', [parsedId]);
        
        if (current.rowCount === 0) {
            return res.status(404).json({ error: 'Sparbuch nicht gefunden' });
        }
        
        // Bereinige den aktuellen Wert
        let currentAmount = parseFloat(current.rows[0].current_amount);
        if (isNaN(currentAmount)) currentAmount = 0;
        
        // Runde auf 2 Dezimalstellen
        currentAmount = Math.round(currentAmount * 100) / 100;
        
        let newAmount = currentAmount;
        
        if (type === 'add') {
            newAmount = currentAmount + parsedAmount;
        } else {
            if (currentAmount - parsedAmount < -0.01) { // Toleranz wegen Rundung
                return res.status(400).json({ error: 'Nicht genug Geld auf dem Sparbuch' });
            }
            newAmount = currentAmount - parsedAmount;
        }
        
        // Runde auf 2 Dezimalstellen
        newAmount = Math.round(newAmount * 100) / 100;
        
        console.log(`💰 Sparbuch ${parsedId}: ${currentAmount}€ -> ${newAmount}€ (${type})`);
        
        const result = await pool.query(
            'UPDATE savings SET current_amount = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [newAmount, parsedId]
        );
        
        res.json(result.rows[0]);
        
    } catch (err) {
        console.error('❌ Sparbuch Transaktion Fehler:', err);
        res.status(500).json({ error: 'Fehler bei Transaktion: ' + err.message });
    }
});

// Server starten
app.listen(PORT, () => {
    console.log(`
    🚀 Finanz-Tracker Server gestartet!
    📁 App: http://localhost:${PORT}
    🐘 PostgreSQL: ${process.env.DB_DATABASE || 'finance_tracker'}
    `);
});