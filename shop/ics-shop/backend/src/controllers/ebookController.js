const Ebook = require('../models/Ebook');
const fs = require('fs');

class EbookController {
    static async getMyEbooks(req, res) {
        try {
            const userId = req.user.id;
            const userTier = await Ebook.getUserTier(userId);
            const grouped = await Ebook.getGroupedEbooks(userId);
            
            res.json({
                userTier,
                grouped
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch eBooks' });
        }
    }
    
    static async downloadEbook(req, res) {
        try {
            const { ebookSlug } = req.params;
            const userId = req.user.id;
            const userTier = await Ebook.getUserTier(userId);
            
            const ebook = await Ebook.findBySlug(ebookSlug, userTier);
            
            if (!ebook) {
                return res.status(403).json({ error: 'You do not have access to this eBook' });
            }
            
            const filePath = Ebook.getFilePath(ebook);
            
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                return res.status(404).json({ error: 'File not found' });
            }
            
            await Ebook.recordDownload(userId, ebook.id, req.ip);
            
            res.download(filePath, `${ebook.slug}.pdf`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Download failed' });
        }
    }
}

module.exports = EbookController;