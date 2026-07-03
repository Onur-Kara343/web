const express = require('express');
const auth = require('../middleware/auth');

module.exports = (pool) => {
    const router = express.Router();

    router.get('/', auth, async (req, res) => {
        try {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            
            const expenses = await pool.query(
                `SELECT category_id, SUM(amount) as total
                 FROM transactions
                 WHERE user_id = $1 AND type = 'expense' AND transaction_date >= $2
                 GROUP BY category_id
                 ORDER BY total DESC
                 LIMIT 5`,
                [req.user.id, threeMonthsAgo.toISOString().slice(0,10)]
            );

            const categories = await pool.query('SELECT id, name FROM categories');
            const categoryMap = {};
            categories.rows.forEach(c => categoryMap[c.id] = c.name);

            let tip = "🎯 Keine Ausgaben in den letzten 3 Monaten. Gut gemacht!";
            
            if (expenses.rows.length > 0) {
                const topCategory = expenses.rows[0];
                const categoryName = categoryMap[topCategory.category_id] || 'Unbekannt';
                const amount = parseFloat(topCategory.total).toFixed(2);
                
                const tips = [
    // Allgemeine Tipps
    `💡 Du gibst am meisten für "${categoryName}" aus (${amount}€). Versuche hier 10% zu sparen.`,
    `💰 Bei "${categoryName}" gibst du ${amount}€ aus. Ein Sparziel setzen?`,
    `🎯 Deine größte Ausgabe: "${categoryName}" (${amount}€). 5% weniger wäre ein guter Start.`,
    `📊 "${categoryName}" kostet dich ${amount}€. Ein Budget von ${Math.round(amount * 0.9)}€ wäre ein erster Schritt.`,
    `🏆 Spare 10% bei "${categoryName}" – das wären ${Math.round(amount * 0.1)}€ im Monat!`,
    
    // Kategorie-spezifische Tipps
    `🍔 Bei "${categoryName}" könntest du Meal-Prep ausprobieren – spart Zeit und ca. ${Math.round(amount * 0.15)}€!`,
    `🥤 Leitungswasser statt Flaschenwasser – spart ${Math.round(amount * 0.05)}€ im Monat und ist gesünder!`,
    `🚲 Bei "${categoryName}" könnte Fahrrad statt Auto fahren – spart Sprit und hält fit!`,
    `📚 Bei "${categoryName}" lohnt sich ein Blick in die Bibliothek – kostet nichts!`,
    `🎮 Warte bei "${categoryName}" auf Sales oder kaufe gebraucht – bis zu 50% Rabatt!`,
    
    // Motivierende Tipps
    `⭐ Stelle dir vor, du sparst ${Math.round(amount * 0.1)}€ – das wäre ein schöner Restaurantbesuch!`,
    `🎉 Nach 6 Monaten hättest du ${Math.round(amount * 0.6)}€ gespart – genug für einen Kurztrip!`,
    `💪 Challenge: Diesen Monat 20% bei "${categoryName}" sparen – du schaffst das!`,
    `🏦 Leg ${Math.round(amount * 0.05)}€ direkt zu Monatsbeginn aufs Sparkonto – aus den Augen, aus dem Sinn!`,
    
    // Lustige Tipps
    `😂 Frag dich: "Brauche ich das wirklich oder will ich es nur?" – hilft oft!`,
    `🛑 Stopp: Bevor du bei "${categoryName}" kaufst, warte 24h – meist vergeht der Impuls!`,
    `🎯 Mach eine No-Spend-Challenge: 7 Tage nur das Nötigste ausgeben!`,
    `📉 Dein Geldbeutel dankt dir, wenn du bei "${categoryName}" mal die günstigere Eigenmarke probierst!`,
    `💪 Jeder gesparte Euro ist ein Euro für deine Träume – du packst das!`
];
            const randomIndex = Math.floor(Math.random() * tips.length);
            let tip = tips[randomIndex];
        }

            res.json({ tip });
        } catch (error) {
            console.error('Fehler beim KI-Tipp:', error);
            res.status(500).json({ error: 'Interner Serverfehler' });
        }
    });

    return router;
};