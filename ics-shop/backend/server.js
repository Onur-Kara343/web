const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const ebookRoutes = require('./src/routes/ebookRoutes');
const webappRoutes = require('./src/routes/webappRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));
app.use('/css', express.static(path.join(frontendPath, 'css')));
app.use('/js', express.static(path.join(frontendPath, 'js')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============
app.use('/api', authRoutes);
app.use('/api', ebookRoutes);
app.use('/api', webappRoutes);

// LemonSqueezy checkout links
app.get('/api/checkout-links', (req, res) => {
    res.json({
        basic: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_BASIC_VARIANT_ID || 'demo'}`,
        advanced: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_ADVANCED_VARIANT_ID || 'demo'}`,
        full: `https://your-store.lemonsqueezy.com/checkout/buy/${process.env.LEMONSQUEEZY_FULL_VARIANT_ID || 'demo'}`
    });
});

// Serve frontend
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

// ============ BONUS TOOLS ENDPOINT ============
app.get('/api/bonus-tools', (req, res) => {
    const tools = [
        {
            id: 'kopfarena',
            name: 'KopfArena',
            icon: 'fa-brain',
            description: '40+ Spiele die dein Gehirn trainieren – Logik, Aufmerksamkeit, Reaktion & mehr',
            url: process.env.KOPFARENA_URL || null,
            available: !!process.env.KOPFARENA_URL
        },
        {
            id: 'trueyou',
            name: 'TrueYou',
            icon: 'fa-chart-line',
            description: '15 Tests für deine tiefen psychologischen Eigenschaften – Schattenseiten, Bindungstyp, Big 5 & mehr',
            url: process.env.TRUEYOU_URL || null,
            available: !!process.env.TRUEYOU_URL
        },
        {
            id: 'emora',
            name: 'Emora',
            icon: 'fa-comment-dots',
            description: 'Emotionsrad mit 60+ Emotionen + Chatbot + Trigger-Landkarte für deine Gefühle',
            url: process.env.EMORA_URL || null,
            available: !!process.env.EMORA_URL
        },
        {
            id: 'calmmind',
            name: 'CalmMind',
            icon: 'fa-book',
            description: 'Tagebuch mit Kalenderansicht, ToDos, Briefe an dein Zukunfts-Ich & KI-Reflexion',
            url: process.env.CALMMIND_URL || null,
            available: !!process.env.CALMMIND_URL
        },
        {
            id: 'dreamweaver',
            name: 'Dreamweaver',
            icon: 'fa-moon',
            description: 'Traumtagebuch + KI-Analyse, Lucid Dream Tipps, Schlaf-Tracking & mehr',
            url: process.env.DREAMWEAVER_URL || null,
            available: !!process.env.DREAMWEAVER_URL
        }
    ];
    
    res.json(tools);
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