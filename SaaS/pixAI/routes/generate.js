const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

const API_BASE = 'https://image.pollinations.ai/prompt/';

router.post('/', async (req, res) => {
    const { prompt, negativePrompt, width, height, model } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt ist erforderlich' });
    }
    
    // Prompt für Pollinations vorbereiten
    let fullPrompt = encodeURIComponent(prompt);
    if (negativePrompt && negativePrompt.trim()) {
        fullPrompt = encodeURIComponent(`${prompt} | ${negativePrompt}`);
    }
    
    const w = width || 1024;
    const h = height || 1024;
    
    let apiUrl = `${API_BASE}${fullPrompt}?width=${w}&height=${h}`;
    
    if (model === 'turbo') apiUrl += '&model=turbo';
    else if (model === 'realistic') apiUrl += '&model=realistic';
    // flux ist default
    
    console.log('🎨 Generiere Bild:', apiUrl);
    
    try {
        // Bild von Pollinations holen
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`API Fehler: ${response.status}`);
        }
        
        // Bild als Base64 zurückgeben (für einfachere Übertragung)
        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';
        
        res.json({
            success: true,
            image: `data:${mimeType};base64,${base64}`,
            url: apiUrl
        });
        
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Fehler beim Generieren des Bildes' });
    }
});

module.exports = router;