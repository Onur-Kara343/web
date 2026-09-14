const pool = require('../config/database');
const crypto = require('crypto');

class Module {
    static async getAll() {
        const result = await pool.query('SELECT * FROM modules ORDER BY sort_order');
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0,
            phase_ids: row.phase_ids || []
        }));
    }
    
    static async getById(id) {
        const result = await pool.query('SELECT * FROM modules WHERE id = $1', [id]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
            row.phase_ids = row.phase_ids || [];
        }
        return row;
    }
    
    static async getBySlug(slug) {
        const result = await pool.query('SELECT * FROM modules WHERE slug = $1', [slug]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
            row.phase_ids = row.phase_ids || [];
        }
        return row;
    }
    
    static async getUserModules(userId) {
        const result = await pool.query(`
            SELECT m.*, um.purchased_at
            FROM modules m
            JOIN user_modules um ON um.module_id = m.id
            WHERE um.user_id = $1
            ORDER BY m.sort_order
        `, [userId]);
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0,
            phase_ids: row.phase_ids || []
        }));
    }
    
    static async purchase(userId, moduleId) {
        const result = await pool.query(`
            INSERT INTO user_modules (user_id, module_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, module_id) DO NOTHING
            RETURNING *
        `, [userId, moduleId]);
        return result.rows[0];
    }
    
    static async hasUserPurchased(userId, moduleId) {
        const result = await pool.query(
            'SELECT id FROM user_modules WHERE user_id = $1 AND module_id = $2',
            [userId, moduleId]
        );
        return result.rows.length > 0;
    }
    
    static async getPhasesForModule(moduleId) {
        const module = await this.getById(moduleId);
        if (!module || !module.phase_ids || module.phase_ids.length === 0) {
            return [];
        }
        
        const result = await pool.query(
            'SELECT * FROM phases WHERE id = ANY($1) ORDER BY sort_order',
            [module.phase_ids]
        );
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
}

module.exports = Module;