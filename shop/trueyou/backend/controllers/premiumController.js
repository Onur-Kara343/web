const pool = require('../db/pool');

// Premium-Status prüfen
async function getPremiumStatus(req, res) {
    const userId = req.user.id;
    
    try {
        const result = await pool.query(
            'SELECT is_premium, premium_activated_at FROM users WHERE id = $1',
            [userId]
        );
        res.json({
            is_premium: result.rows[0]?.is_premium || false,
            activated_at: result.rows[0]?.premium_activated_at || null
        });
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

// Premium aktivieren (für Admin oder Webhook)
async function activatePremium(req, res) {
    const userId = req.user.id;
    
    try {
        await pool.query(
            'UPDATE users SET is_premium = true, premium_activated_at = NOW() WHERE id = $1',
            [userId]
        );
        res.json({ message: 'Premium erfolgreich aktiviert' });
    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
}

// Lemon Squeezy Checkout erstellen
async function createCheckout(req, res) {
    const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
    const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
    const VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID;
    
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    try {
        const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            email: userEmail,
                            custom: {
                                user_id: userId.toString()
                            }
                        }
                    },
                    relationships: {
                        store: { data: { type: 'stores', id: STORE_ID.toString() } },
                        variant: { data: { type: 'variants', id: VARIANT_ID.toString() } }
                    }
                }
            })
        });
        
        const data = await response.json();
        
        if (data.errors) {
            console.error('Lemon Squeezy Error:', data.errors);
            return res.status(500).json({ error: 'Fehler beim Erstellen des Checkouts' });
        }
        
        res.json({ url: data.data.attributes.url });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ error: 'Checkout konnte nicht erstellt werden' });
    }
}

// Webhook für erfolgreiche Zahlungen
async function handleWebhook(req, res) {
    const crypto = require('crypto');
    const WEBHOOK_SECRET = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    
    const signature = req.headers['x-signature'];
    const hash = crypto.createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest('hex');
    
    if (signature !== hash) {
        console.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const eventName = req.body.meta?.event_name;
    
    if (eventName === 'order_created') {
        const userId = req.body.data?.attributes?.custom?.user_id;
        const orderId = req.body.data?.id;
        
        if (userId) {
            await pool.query(
                'UPDATE users SET is_premium = true, premium_activated_at = NOW() WHERE id = $1',
                [userId]
            );
            console.log(`✅ Premium aktiviert für User ${userId}, Order ${orderId}`);
        }
    }
    
    res.status(200).json({ received: true });
}

module.exports = { getPremiumStatus, activatePremium, createCheckout, handleWebhook };