const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const generateRoutes = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.use('/api/generate', generateRoutes);

// Frontend Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎨 AI Image Generator läuft auf http://localhost:${PORT}`);
});