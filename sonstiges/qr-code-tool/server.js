const express = require('express');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// QR-Code generieren (als Base64)
app.post('/api/generate', async (req, res) => {
    const { content, type, ssid, password, encryption, phone } = req.body;
    
    let qrContent = '';
    
    switch(type) {
        case 'url':
            qrContent = content;
            break;
        case 'text':
            qrContent = content;
            break;
        case 'wifi':
            qrContent = `WIFI:T:${encryption || 'WPA'};S:${ssid};P:${password};;`;
            break;
        case 'phone':
            qrContent = `tel:${phone}`;
            break;
        default:
            qrContent = content;
    }
    
    try {
        const qrImage = await QRCode.toDataURL(qrContent, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });
        res.json({ success: true, qrImage, qrContent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`📱 QR-Code Tool läuft auf http://localhost:${PORT}`);
});