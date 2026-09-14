const pool = require('../config/database');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class ShopEbook {
    static async getAll() {
        const result = await pool.query('SELECT * FROM shop_ebooks ORDER BY sort_order');
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getFreeEbooks() {
        const result = await pool.query('SELECT * FROM shop_ebooks WHERE is_free = true ORDER BY sort_order');
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getPaidEbooks() {
        const result = await pool.query('SELECT * FROM shop_ebooks WHERE is_free = false ORDER BY sort_order');
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getById(id) {
        const result = await pool.query('SELECT * FROM shop_ebooks WHERE id = $1', [id]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
        }
        return row;
    }
    
    static async getBySlug(slug) {
        const result = await pool.query('SELECT * FROM shop_ebooks WHERE slug = $1', [slug]);
        const row = result.rows[0];
        if (row) {
            row.price = parseFloat(row.price) || 0;
        }
        return row;
    }
    
    static async getUserEbooks(userId) {
        // FIX: LEFT JOIN statt JOIN - zeigt auch kostenlose eBooks an
        const result = await pool.query(`
            SELECT se.*, 
                   CASE WHEN use.id IS NOT NULL THEN true ELSE false END as is_purchased,
                   use.downloaded_at, 
                   use.download_token
            FROM shop_ebooks se
            LEFT JOIN user_shop_ebooks use ON use.ebook_id = se.id AND use.user_id = $1
            WHERE se.is_free = true OR use.id IS NOT NULL
            ORDER BY se.sort_order
        `, [userId]);
        return result.rows.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async purchase(userId, ebookId) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        const result = await pool.query(`
            INSERT INTO user_shop_ebooks (user_id, ebook_id, download_token)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, ebook_id) DO UPDATE
            SET purchased_at = CURRENT_TIMESTAMP, download_token = $3
            RETURNING *
        `, [userId, ebookId, downloadToken]);
        return result.rows[0];
    }
    
    static async hasUserPurchased(userId, ebookId) {
        const result = await pool.query(
            'SELECT id FROM user_shop_ebooks WHERE user_id = $1 AND ebook_id = $2',
            [userId, ebookId]
        );
        return result.rows.length > 0;
    }
    
    static async recordDownload(userId, ebookId, ipAddress) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        await pool.query(`
            INSERT INTO user_shop_ebooks (user_id, ebook_id, download_token)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, ebook_id) DO UPDATE
            SET downloaded_at = CURRENT_TIMESTAMP, download_token = $3
        `, [downloadToken, userId, ebookId]);
        return downloadToken;
    }
    
    static getFilePath(ebook) {
        return path.join(__dirname, '../../uploads/shop_eb', ebook.file_name);
    }
}

module.exports = ShopEbook;