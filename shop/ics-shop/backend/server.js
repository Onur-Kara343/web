const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ DATABASE ============
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ebook_empire',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
    } else {
        console.log('✅ PostgreSQL connected');
    }
});

// ============ JWT MIDDLEWARE ============
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ============ AUTH ROUTES ============
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        let existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        let userId;
        
        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
        } else {
            const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
            const result = await pool.query(
                'INSERT INTO users (email, password_hash, tier) VALUES ($1, $2, $3) RETURNING id',
                [email, hashedPassword, 'free']
            );
            userId = result.rows[0].id;
        }
        
        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        const userTier = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        
        res.json({ 
            token, 
            user: { id: userId, email, tier: userTier.rows[0].tier }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        if (user.password_hash) {
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
        
        res.json({ 
            token, 
            user: { id: user.id, email: user.email, tier: user.tier }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/update-tier', authenticateToken, async (req, res) => {
    try {
        const { tier } = req.body;
        const userId = req.user.id;
        
        if (!['basic', 'advanced', 'full'].includes(tier)) {
            return res.status(400).json({ error: 'Invalid tier' });
        }
        
        await pool.query('UPDATE users SET tier = $1 WHERE id = $2', [tier, userId]);
        res.json({ success: true, tier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update tier' });
    }
});

// ============ EBOOK ROUTES ============
app.get('/api/my-ebooks', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const userResult = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        const userTier = userResult.rows[0].tier;
        
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
        
        const freeEbooks = result.rows.filter(e => e.is_free === true);
        const basicEbooks = result.rows.filter(e => e.tier === 'basic');
        const advancedEbooks = result.rows.filter(e => e.tier === 'advanced');
        const fullEbooks = result.rows.filter(e => e.tier === 'full');
        
        res.json({
            userTier,
            ebooks: result.rows,
            grouped: {
                free: freeEbooks,
                basic: basicEbooks,
                advanced: advancedEbooks,
                full: fullEbooks
            }
        });
    } catch (error) {
        console.error('Error fetching eBooks:', error);
        res.status(500).json({ error: 'Failed to fetch eBooks' });
    }
});

app.get('/api/download/:ebookSlug', authenticateToken, async (req, res) => {
    try {
        const { ebookSlug } = req.params;
        const userId = req.user.id;
        
        const userResult = await pool.query('SELECT tier FROM users WHERE id = $1', [userId]);
        const userTier = userResult.rows[0].tier;
        
        const ebookResult = await pool.query(`
            SELECT * FROM ebooks 
            WHERE slug = $1 
            AND (tier = 'free' 
                 OR (tier = 'basic' AND $2 IN ('basic', 'advanced', 'full'))
                 OR (tier = 'advanced' AND $2 IN ('advanced', 'full'))
                 OR (tier = 'full' AND $2 = 'full'))
        `, [ebookSlug, userTier]);
        
        if (ebookResult.rows.length === 0) {
            return res.status(403).json({ error: 'You do not have access to this eBook' });
        }
        
        const ebook = ebookResult.rows[0];
        
        let filePath;
        if (ebook.is_free) {
            filePath = path.join(__dirname, 'uploads', 'free-ebooks', ebook.file_name);
        } else {
            filePath = path.join(__dirname, 'uploads', 'paid-ebooks', ebook.file_name);
        }
        
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).json({ error: 'File not found' });
        }
        
        const downloadToken = crypto.randomBytes(32).toString('hex');
        await pool.query(`
            INSERT INTO user_downloads (user_id, ebook_id, download_token, ip_address) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, ebook_id) DO UPDATE 
            SET downloaded_at = CURRENT_TIMESTAMP, download_token = $3
        `, [userId, ebook.id, downloadToken, req.ip]);
        
        res.download(filePath, `${ebook.slug}.pdf`, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

// ============ FREE EBOOK DOWNLOAD (per E-Mail) ============
app.post('/api/download-free-ebook', async (req, res) => {
    try {
        const { email, ebookSlug } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        let userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        let userId;
        
        if (userResult.rows.length === 0) {
            const newUser = await pool.query(
                'INSERT INTO users (email, tier) VALUES ($1, $2) RETURNING id',
                [email, 'free']
            );
            userId = newUser.rows[0].id;
        } else {
            userId = userResult.rows[0].id;
        }
        
        if (ebookSlug) {
            const ebookResult = await pool.query(
                'SELECT * FROM ebooks WHERE slug = $1 AND is_free = true',
                [ebookSlug]
            );
            
            if (ebookResult.rows.length === 0) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            const ebook = ebookResult.rows[0];
            
            await pool.query(
                `INSERT INTO user_downloads (user_id, ebook_id, download_token, ip_address) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id, ebook_id) DO NOTHING`,
                [userId, ebook.id, crypto.randomBytes(32).toString('hex'), req.ip]
            );
            
            res.json({ 
                success: true, 
                message: `Download-Link für "${ebook.title}" wurde gesendet`,
                downloadUrl: `/uploads/free-ebooks/${ebook.file_name}`
            });
        } else {
            const freeEbooks = await pool.query(
                'SELECT * FROM ebooks WHERE is_free = true'
            );
            
            for (const ebook of freeEbooks.rows) {
                await pool.query(
                    `INSERT INTO user_downloads (user_id, ebook_id, download_token, ip_address) 
                     VALUES ($1, $2, $3, $4)
                     ON CONFLICT (user_id, ebook_id) DO NOTHING`,
                    [userId, ebook.id, crypto.randomBytes(32).toString('hex'), req.ip]
                );
            }
            
            res.json({ 
                success: true, 
                message: 'Download-Links wurden an deine E-Mail gesendet!',
                downloadUrls: freeEbooks.rows.map(e => `/uploads/free-ebooks/${e.file_name}`)
            });
        }
        
    } catch (error) {
        console.error('Free download error:', error);
        res.status(500).json({ error: 'Failed to process free download' });
    }
});

// ============ BONUS TOOLS ENDPOINT ============
app.get('/api/bonus-tools', (req, res) => {
    const tools = [
        {
            id: 'emora',
            name: 'Emora',
            icon: 'fa-comment-dots',
            description: 'Emotionsrad mit 60+ Emotionen + Chatbot + Trigger-Landkarte für deine Gefühle',
            type: 'Android App',
            url: process.env.EMORA_URL || null,
            available: !!process.env.EMORA_URL
        },
        {
            id: 'calmmind',
            name: 'CalmMind',
            icon: 'fa-book',
            description: 'Tagebuch mit Kalenderansicht, ToDos, Briefe an dein Zukunfts-Ich & KI-Reflexion',
            type: 'Android App',
            url: process.env.CALMMIND_URL || null,
            available: !!process.env.CALMMIND_URL
        },
        {
            id: 'dreamweaver',
            name: 'Dreamweaver',
            icon: 'fa-moon',
            description: 'Traumtagebuch + KI-Analyse, Lucid Dream Tipps, Schlaf-Tracking & mehr',
            type: 'Android App',
            url: process.env.DREAMWEAVER_URL || null,
            available: !!process.env.DREAMWEAVER_URL
        }
    ];
    
    res.json(tools);
});

// ============ CHECKOUT LINKS ============
app.get('/api/checkout-links', (req, res) => {
    res.json({
        basic: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || 'demo'}`,
        advanced: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID || 'demo'}`,
        full: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_FULL_VARIANT_ID || 'demo'}`
    });
});

// ============ LEMON SQUEEZY WEBHOOK ============
app.post('/api/webhook/lemon-squeezy', async (req, res) => {
    try {
        const event = req.body;
        
        if (event.meta && event.meta.event_name === 'order_created') {
            const order = event.data.attributes;
            const customerEmail = order.attributes.customer_email;
            const variantId = order.attributes.first_order_item.variant_id;
            
            let tier = 'basic';
            if (variantId === process.env.LEMONSQUEEZY_BASIC_VARIANT_ID) tier = 'basic';
            else if (variantId === process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID) tier = 'advanced';
            else if (variantId === process.env.LEMONSQUEEZY_FULL_VARIANT_ID) tier = 'full';
            
            await pool.query(
                'UPDATE users SET tier = $1, lemon_squeezy_customer_id = $2 WHERE email = $3',
                [tier, order.attributes.customer_id, customerEmail]
            );
            
            console.log(`✅ User ${customerEmail} upgraded to ${tier}`);
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// ============ SERVE FRONTEND ============
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============ CREATE UPLOAD DIRECTORIES ============
const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/free-ebooks'),
    path.join(__dirname, 'uploads/paid-ebooks')
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created: ${dir}`);
    }
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
    ═══════════════════════════════════════════════════
    🚀 Server gestartet: http://localhost:${PORT}
    ═══════════════════════════════════════════════════
    📁 Frontend: ${frontendPath}
    📁 Free eBooks: ${path.join(__dirname, 'uploads/free-ebooks')}
    📁 Paid eBooks: ${path.join(__dirname, 'uploads/paid-ebooks')}
    ═══════════════════════════════════════════════════
    `);
});