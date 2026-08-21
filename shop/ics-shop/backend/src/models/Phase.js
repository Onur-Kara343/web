const pool = require('../config/database');
const crypto = require('crypto');

class Phase {
    static async getAll() {
        const result = await pool.query('SELECT * FROM phases ORDER BY sort_order');
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getById(id) {
        const result = await pool.query('SELECT * FROM phases WHERE id = $1', [id]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
        }
        return row;
    }
    
    static async getBySlug(slug) {
        const result = await pool.query('SELECT * FROM phases WHERE slug = $1', [slug]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
        }
        return row;
    }
    
    static async getUserPhases(userId) {
        const result = await pool.query(`
            SELECT p.*, up.purchased_at
            FROM phases p
            JOIN user_phases up ON up.phase_id = p.id
            WHERE up.user_id = $1
            ORDER BY p.sort_order
        `, [userId]);
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async purchase(userId, phaseId) {
        const result = await pool.query(`
            INSERT INTO user_phases (user_id, phase_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, phase_id) DO NOTHING
            RETURNING *
        `, [userId, phaseId]);
        return result.rows[0];
    }
    
    static async hasUserPurchased(userId, phaseId) {
        const result = await pool.query(
            'SELECT id FROM user_phases WHERE user_id = $1 AND phase_id = $2',
            [userId, phaseId]
        );
        return result.rows.length > 0;
    }
}

module.exports = Phase;