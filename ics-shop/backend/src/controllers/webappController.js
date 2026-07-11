const Webapp = require('../models/Webapp');

class WebappController {
    static async getMyWebapps(req, res) {
        try {
            const userId = req.user.id;
            const userTier = await Webapp.getUserTier(userId);
            const hasAccess = Webapp.hasAccess(userTier);
            
            if (!hasAccess) {
                return res.json({ 
                    hasAccess: false, 
                    requiredTier: 'advanced',
                    webapps: [] 
                });
            }
            
            const webapps = await Webapp.getUserWebapps(userId);
            
            res.json({ 
                hasAccess: true, 
                userTier,
                webapps
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch webapps' });
        }
    }
    
    static async getWebappAccess(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;
            
            const webapp = await Webapp.findBySlug(slug, userId);
            
            if (!webapp) {
                return res.status(403).json({ error: 'Access denied' });
            }
            
            await Webapp.updateLastAccessed(userId, webapp.id);
            
            res.json({
                name: webapp.name,
                description: webapp.description,
                accessUrl: webapp.external_url,
                token: webapp.access_token
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to get webapp access' });
        }
    }
}

module.exports = WebappController;