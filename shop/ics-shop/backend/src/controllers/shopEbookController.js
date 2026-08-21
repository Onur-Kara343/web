const ShopEbook = require('../models/ShopEbook');
const fs = require('fs');

class ShopEbookController {
    static async getAll(req, res) {
        try {
            const ebooks = await ShopEbook.getAll();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch eBooks' });
        }
    }
    
    static async getFreeEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getFreeEbooks();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch free eBooks' });
        }
    }
    
    static async getPaidEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getPaidEbooks();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch paid eBooks' });
        }
    }
    
    static async purchase(req, res) {
        try {
            const { ebookId } = req.body;
            const userId = req.user.id;
            
            const ebook = await ShopEbook.getById(ebookId);
            if (!ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            if (ebook.is_free) {
                return res.status(400).json({ error: 'This eBook is free' });
            }
            
            const alreadyPurchased = await ShopEbook.hasUserPurchased(userId, ebookId);
            if (alreadyPurchased) {
                return res.status(400).json({ error: 'Already purchased' });
            }
            
            const purchase = await ShopEbook.purchase(userId, ebookId);
            
            res.json({ 
                success: true, 
                message: 'eBook purchased successfully',
                downloadToken: purchase.download_token
            });
        } catch (error) {
            console.error('Purchase error:', error);
            res.status(500).json({ error: 'Purchase failed' });
        }
    }
    
    static async downloadFreeEbook(req, res) {
        try {
            const { slug } = req.params;
            
            const ebook = await ShopEbook.getBySlug(slug);
            if (!ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            if (!ebook.is_free) {
                return res.status(403).json({ error: 'This eBook is not free' });
            }
            
            const filePath = ShopEbook.getFilePath(ebook);
            
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                return res.status(404).json({ error: 'File not found' });
            }
            
            // Auch für nicht eingeloggte User Download ermöglichen
            // Aber wenn eingeloggt, in user_shop_ebooks speichern
            if (req.user) {
                await ShopEbook.recordDownload(req.user.id, ebook.id, req.ip);
            }
            
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
    
    static async downloadPurchasedEbook(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;
            
            const ebook = await ShopEbook.getBySlug(slug);
            if (!ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            // Prüfen: Ist es ein kostenloses eBook? Dann immer erlaubt
            if (ebook.is_free) {
                const filePath = ShopEbook.getFilePath(ebook);
                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({ error: 'File not found' });
                }
                await ShopEbook.recordDownload(userId, ebook.id, req.ip);
                return res.download(filePath, ebook.file_name);
            }
            
            // Kostenpflichtiges eBook: Prüfen ob gekauft
            const hasPurchased = await ShopEbook.hasUserPurchased(userId, ebook.id);
            if (!hasPurchased) {
                return res.status(403).json({ error: 'You have not purchased this eBook' });
            }
            
            const filePath = ShopEbook.getFilePath(ebook);
            
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                return res.status(404).json({ error: 'File not found' });
            }
            
            await ShopEbook.recordDownload(userId, ebook.id, req.ip);
            
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
    
    static async getUserEbooks(req, res) {
        try {
            const userId = req.user.id;
            const ebooks = await ShopEbook.getUserEbooks(userId);
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user eBooks' });
        }
    }
}

module.exports = ShopEbookController;