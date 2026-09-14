const pool = require('../config/database');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

class PhaseEbook {
    static async getByPhaseId(phaseId) {
        const result = await pool.query(
            'SELECT * FROM phase_ebooks WHERE phase_id = $1 ORDER BY sort_order',
            [phaseId]
        );
        return result.rows;
    }
    
    static async getBySlug(slug) {
        const result = await pool.query('SELECT * FROM phase_ebooks WHERE slug = $1', [slug]);
        return result.rows[0];
    }
    
    static async getUserPhaseEbooks(userId, phaseId) {
        const result = await pool.query(`
            SELECT pe.*, upe.downloaded_at, upe.download_token
            FROM phase_ebooks pe
            LEFT JOIN user_phase_ebooks upe ON upe.phase_ebook_id = pe.id AND upe.user_id = $1
            WHERE pe.phase_id = $2
            ORDER BY pe.sort_order
        `, [userId, phaseId]);
        return result.rows;
    }
    
    static async recordDownload(userId, phaseEbookId, ipAddress) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        await pool.query(`
            INSERT INTO user_phase_ebooks (user_id, phase_ebook_id, download_token)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, phase_ebook_id) DO UPDATE
            SET downloaded_at = CURRENT_TIMESTAMP, download_token = $3
        `, [userId, phaseEbookId, downloadToken]);
        return downloadToken;
    }
    
    static async hasUserDownloaded(userId, phaseEbookId) {
        const result = await pool.query(
            'SELECT id FROM user_phase_ebooks WHERE user_id = $1 AND phase_ebook_id = $2',
            [userId, phaseEbookId]
        );
        return result.rows.length > 0;
    }
    
    static getFilePath(ebook) {
        return path.join(__dirname, '../../uploads/transformation_eb', ebook.file_name);
    }
}

module.exports = PhaseEbook;