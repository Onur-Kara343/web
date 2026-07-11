const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// Nodemailer Konfiguration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/', async (req, res) => {
    const { name, email, message, honeypot } = req.body;
    
    // Honeypot gegen Spam
    if (honeypot) {
        return res.status(400).json({ error: 'Spam erkannt' });
    }
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }
    
    try {
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: `Neue Kontaktanfrage von ${name}`,
            html: `
                <h3>Neue Kontaktanfrage</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>E-Mail:</strong> ${email}</p>
                <p><strong>Nachricht:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `
        });
        
        res.json({ success: true, message: 'Nachricht gesendet!' });
    } catch (error) {
        console.error('Fehler beim Senden:', error);
        res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden' });
    }
});

module.exports = router;