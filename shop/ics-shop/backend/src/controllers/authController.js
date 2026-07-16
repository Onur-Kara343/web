const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            
            let user = await User.findByEmail(email);
            
            if (!user) {
                user = await User.create(email, password);
            }
            
            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '30d' }
            );
            
            res.json({ 
                token, 
                user: { id: user.id, email: user.email, tier: user.tier }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
    
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            
            const user = await User.findByEmail(email);
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // If user has password, verify it
            if (user.password_hash) {
                const bcrypt = require('bcrypt');
                const validPassword = await bcrypt.compare(password, user.password_hash);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
            }
            
            await User.updateLastLogin(user.id);
            
            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '30d' }
            );
            
            res.json({ 
                token, 
                user: { id: user.id, email: user.email, tier: user.tier }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
    
    static async updateTier(req, res) {
        try {
            const { tier } = req.body;
            const userId = req.user.id;
            
            if (!['basic', 'advanced', 'full'].includes(tier)) {
                return res.status(400).json({ error: 'Invalid tier' });
            }
            
            await User.updateTier(userId, tier);
            
            res.json({ success: true, tier });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update tier' });
        }
    }
}

module.exports = AuthController;