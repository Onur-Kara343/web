const Module = require('../models/Module');
const Phase = require('../models/Phase');
const PhaseEbook = require('../models/PhaseEbook');

class ModuleController {
    static async getAll(req, res) {
        try {
            const modules = await Module.getAll();
            res.json(modules);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch modules' });
        }
    }
    
    static async purchase(req, res) {
        try {
            const { moduleId } = req.body;
            const userId = req.user.id;
            
            const module = await Module.getById(moduleId);
            if (!module) {
                return res.status(404).json({ error: 'Module not found' });
            }
            
            const alreadyPurchased = await Module.hasUserPurchased(userId, moduleId);
            if (alreadyPurchased) {
                return res.status(400).json({ error: 'Already purchased' });
            }
            
            // Alle Phasen des Moduls laden
            const phases = await Module.getPhasesForModule(moduleId);
            
            // Phase für Phase kaufen
            for (const phase of phases) {
                await Phase.purchase(userId, phase.id);
            }
            
            await Module.purchase(userId, moduleId);
            
            // Alle Phase-Ebooks für den User verfügbar machen
            for (const phase of phases) {
                const ebooks = await PhaseEbook.getByPhaseId(phase.id);
                for (const ebook of ebooks) {
                    await PhaseEbook.recordDownload(userId, ebook.id, req.ip);
                }
            }
            
            res.json({ 
                success: true, 
                message: `${module.name} erfolgreich freigeschaltet!`,
                phases: phases.map(p => p.name)
            });
        } catch (error) {
            console.error('Purchase error:', error);
            res.status(500).json({ error: 'Purchase failed' });
        }
    }
    
    static async getUserModules(req, res) {
        try {
            const userId = req.user.id;
            const modules = await Module.getUserModules(userId);
            res.json(modules);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user modules' });
        }
    }
}

module.exports = ModuleController;