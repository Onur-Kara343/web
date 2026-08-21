const ShopEbook = require('../models/ShopEbook');

class LibraryController {
    static async getLibrary(req, res) {
        try {
            const userId = req.user.id;
            
            // Gekaufte + kostenlose eBooks (bereits heruntergeladen)
            const ebooks = await ShopEbook.getUserEbooks(userId);
            
            res.json({
                success: true,
                library: {
                    ebooks: ebooks
                }
            });
        } catch (error) {
            console.error('Library error:', error);
            res.status(500).json({ error: 'Failed to fetch library' });
        }
    }
    
    static async getEbooks(req, res) {
        try {
            const userId = req.user.id;
            const ebooks = await ShopEbook.getUserEbooks(userId);
            res.json({
                success: true,
                ebooks: ebooks
            });
        } catch (error) {
            console.error('Library ebooks error:', error);
            res.status(500).json({ error: 'Failed to fetch library ebooks' });
        }
    }
}

module.exports = LibraryController;