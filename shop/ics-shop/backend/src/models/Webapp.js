const pool = require('../config/database');
const crypto = require('crypto');

class Webapp {
    static async getUserWebapps(userId) {
        const userTier = await this.getUserTier(userId);
        
        if (userTier === 'free' || userTier === 'basic') {
            return [];
        }
        
        const query = `
            SELECT w.*, 
                   CASE WHEN uwa.id IS NOT NULL THEN uwa.access_token ELSE NULL END as access_token,
                   CASE WHEN uwa.last_accessed IS NOT NULL THEN uwa.last_accessed ELSE NULL END as last_accessed
            FROM webapps w
            LEFT JOIN user_webapp_access uwa ON uwa.webapp_id = w.id AND uwa.user_id = $1
            WHERE w.tier = $2 OR ($2 = 'full' AND w.tier = 'advanced')
            ORDER BY w.sort_order
        `;
        
        const result = await pool.query(query, [userId, userTier]);
        
        // Generate tokens for missing entries
        for (const webapp of result.rows) {
            if (!webapp.access_token) {
                await this.createAccessToken(userId, webapp.id);
            }
        }
        
        // Get updated list with tokens
        const finalResult = await pool.query(`
            SELECT w.*, uwa.access_token, uwa.last_accessed
            FROM webapps w
            JOIN user_webapp_access uwa ON uwa.webapp_id = w.id
            WHERE uwa.user_id = $1 AND (w.tier = $2 OR ($2 = 'full' AND w.tier = 'advanced'))
            ORDER BY w.sort_order
        `, [userId, userTier]);
        
        return finalResult.rows;
    }
    
    static async getUserTier(userId) {
        const result = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.tier || 'free';
    }
    
    static async createAccessToken(userId, webappId) {
        const accessToken = crypto.randomBytes(32).toString('hex');
        await pool.query(`
            INSERT INTO user_webapp_access (user_id, webapp_id, access_token) 
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, webapp_id) DO NOTHING
        `, [userId, webappId, accessToken]);
        return accessToken;
    }
    
    static async findBySlug(slug, userId) {
        const query = `
            SELECT w.*, uwa.access_token
            FROM webapps w
            JOIN user_webapp_access uwa ON uwa.webapp_id = w.id
            WHERE w.slug = $1 AND uwa.user_id = $2
        `;
        const result = await pool.query(query, [slug, userId]);
        return result.rows[0];
    }
    
    static async updateLastAccessed(userId, webappId) {
        await pool.query(`
            UPDATE user_webapp_access 
            SET last_accessed = NOW() 
            WHERE user_id = $1 AND webapp_id = $2
        `, [userId, webappId]);
    }
    
    static hasAccess(userTier) {
        return userTier === 'advanced' || userTier === 'full';
    }
}

module.exports = Webapp;