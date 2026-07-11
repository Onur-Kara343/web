const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const contactRoutes = require('./routes/contact');
const profileRoutes = require('./routes/profile'); // Neu

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate Limiting für Kontaktformular
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }
});

// Routes
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/profile', profileRoutes); // Neu

// Frontend Routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌟 Portfolio läuft auf http://localhost:${PORT}`);
});