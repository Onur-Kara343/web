const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
    
    static async create(email, password = null) {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, tier) VALUES ($1, $2, $3) RETURNING id, email, tier',
            [email, hashedPassword, 'free']
        );
        return result.rows[0];
    }
    
    static async updateTier(userId, tier) {
        const result = await pool.query(
            'UPDATE users SET tier = $1 WHERE id = $2 RETURNING tier',
            [tier, userId]
        );
        return result.rows[0];
    }
    
    static async getTier(userId) {
        const result = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.tier;
    }
    
    static async updateLastLogin(userId) {
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
    }
}

module.exports = User;