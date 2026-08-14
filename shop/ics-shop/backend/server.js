const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Routes importieren
const authRoutes = require('./src/routes/authRoutes');
const ebookRoutes = require('./src/routes/ebookRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============
app.use('/api', authRoutes);
app.use('/api', ebookRoutes);

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
        const { Pool } = require('pg');
        const pool = new Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'ebook_empire',
            password: process.env.DB_PASSWORD || 'postgres',
            port: process.env.DB_PORT || 5432,
        });

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