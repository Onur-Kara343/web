const pool = require('../config/database');
const path = require('path');
const fs = require('fs');

class Ebook {
    static async getUserEbooks(userId) {
        const userTier = await this.getUserTier(userId);
        
        const query = `
            SELECT e.*, 
                   CASE WHEN ud.id IS NOT NULL THEN true ELSE false END as is_downloaded
            FROM ebooks e
            LEFT JOIN user_downloads ud ON ud.ebook_id = e.id AND ud.user_id = $1
            WHERE (e.tier = 'free' 
                   OR (e.tier = 'basic' AND $2 IN ('basic', 'advanced', 'full'))
                   OR (e.tier = 'advanced' AND $2 IN ('advanced', 'full'))
                   OR (e.tier = 'full' AND $2 = 'full'))
            ORDER BY e.sort_order
        `;
        
        const result = await pool.query(query, [userId, userTier]);
        return result.rows;
    }
    
    static async getUserTier(userId) {
        const result = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        return result.rows[0]?.tier || 'free';
    }
    
    static async findBySlug(slug, userTier) {
        const query = `
            SELECT * FROM ebooks 
            WHERE slug = $1 
            AND (tier = 'free' 
                 OR (tier = 'basic' AND $2 IN ('basic', 'advanced', 'full'))
                 OR (tier = 'advanced' AND $2 IN ('advanced', 'full'))
                 OR (tier = 'full' AND $2 = 'full'))
        `;
        const result = await pool.query(query, [slug, userTier]);
        return result.rows[0];
    }
    
    static async recordDownload(userId, ebookId, ipAddress) {
        const downloadToken = require('crypto').randomBytes(32).toString('hex');
        await pool.query(`
            INSERT INTO user_downloads (user_id, ebook_id, download_token, ip_address) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, ebook_id) DO UPDATE 
            SET downloaded_at = CURRENT_TIMESTAMP, download_token = $3
        `, [userId, ebookId, downloadToken, ipAddress]);
        return downloadToken;
    }
    
    static getFilePath(ebook) {
        const basePath = path.join(__dirname, '../../uploads');
        if (ebook.is_free) {
            return path.join(basePath, 'free-ebooks', ebook.file_name);
        }
        return path.join(basePath, 'paid-ebooks', ebook.file_name);
    }
    
    static async getGroupedEbooks(userId) {
        const ebooks = await this.getUserEbooks(userId);
        return {
            free: ebooks.filter(e => e.is_free === true),
            basic: ebooks.filter(e => e.tier === 'basic'),
            advanced: ebooks.filter(e => e.tier === 'advanced'),
            full: ebooks.filter(e => e.tier === 'full')
        };
    }
}

module.exports = Ebook;