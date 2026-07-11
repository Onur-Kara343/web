const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Statische Dateien serven
app.use(express.static(path.join(__dirname, 'public')));

// Index-Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
app.listen(port, () => {
    console.log(`⚽ Fußball-Performance-Bewertung läuft auf http://localhost:${port}`);
});