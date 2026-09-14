const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // ← NEU
require('dotenv').config();

const { handleWebhook } = require('./controllers/premiumController');
const authRoutes = require('./routes/auth');
const testsRoutes = require('./routes/tests');
const premiumRoutes = require('./routes/premium');

const app = express();

// ===== SECURITY =====
app.use(helmet());

// ===== CORS – NUR Frontend erlauben =====
const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:3000'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Nicht erlaubt durch CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // ← WICHTIG für Cookies!
}));

// ===== COOKIE-PARSER =====
app.use(cookieParser()); // ← NEU

// ===== KOMPRIMIERUNG =====
app.use(compression());

// ===== RATE-LIMITING =====
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Zu viele Anfragen, bitte warte 15 Minuten.',
    skipSuccessfulRequests: false,
});
app.use('/api', limiter);

// Strengeres Limit für Auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Zu viele Anmeldeversuche, bitte warte 15 Minuten.',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===== BODY PARSER =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== WEBHOOK (raw Body) =====
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/premium', premiumRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', async (req, res) => {
    let dbStatus = 'OK';
    try {
        const pool = require('./db/pool');
        await pool.query('SELECT 1');
    } catch (error) {
        dbStatus = 'ERROR';
    }
    res.json({
        status: 'OK',
        db: dbStatus,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({ error: 'Route nicht gefunden' });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        error: 'Interner Serverfehler',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`✅ TrueYou Server auf Port ${PORT}`);
    console.log(`🔒 CORS erlaubt: ${allowedOrigins.join(', ')}`);
    console.log(`📊 Rate-Limiting: 100 Anfragen pro 15 Minuten`);
});