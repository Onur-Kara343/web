const Phase = require('../models/Phase');
const PhaseEbook = require('../models/PhaseEbook');
const fs = require('fs');
const pool = require('../config/database');

class PhaseController {
    static async getAll(req, res) {
        try {
            const phases = await Phase.getAll();
            
            // Für jede Phase die enthaltenen eBooks laden
            const phasesWithEbooks = await Promise.all(phases.map(async (phase) => {
                const ebooks = await PhaseEbook.getByPhaseId(phase.id);
                return {
                    ...phase,
                    ebooks: ebooks
                };
            }));
            
            res.json(phasesWithEbooks);
        } catch (error) {
            console.error('Get phases error:', error);
            res.status(500).json({ error: 'Failed to fetch phases' });
        }
    }
    
    static async getPhaseEbooks(req, res) {
        try {
            const { phaseId } = req.params;
            const ebooks = await PhaseEbook.getByPhaseId(phaseId);
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch phase eBooks' });
        }
    }
    
    static async downloadPhaseEbook(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;
            
            const ebook = await PhaseEbook.getBySlug(slug);
            if (!ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            // Prüfen ob User die Phase gekauft hat
            const phaseResult = await pool.query(
                'SELECT id FROM user_phases WHERE user_id = $1 AND phase_id = $2',
                [userId, ebook.phase_id]
            );
            
            if (phaseResult.rows.length === 0) {
                return res.status(403).json({ error: 'You have not purchased this phase' });
            }
            
            const filePath = PhaseEbook.getFilePath(ebook);
            
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                return res.status(404).json({ error: 'File not found' });
            }
            
            await PhaseEbook.recordDownload(userId, ebook.id, req.ip);
            
            res.download(filePath, ebook.file_name, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
            });
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Download failed' });
        }
    }
    
    static async getUserPhases(req, res) {
        try {
            const userId = req.user.id;
            const phases = await Phase.getUserPhases(userId);
            res.json(phases);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user phases' });
        }
    }
}

module.exports = PhaseController;