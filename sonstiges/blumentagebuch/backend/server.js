const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ===== TREFLE API =====
const TREFLE_API_KEY = 'usr-mDN6LEb_4JoYl8MgZaBTXtyzaKpAr69QqybWBPn9PVs';
const TREFLE_BASE_URL = 'https://trefle.io/api/v1';

// Cache
let flowerCache = [];
let lastFetchTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// ===== BLUMEN DURCH VOLLTEXTSUCHE LADEN =====
async function fetchFlowersBySearch(searchTerm = 'flower', page = 1) {
    try {
        const response = await axios.get(`${TREFLE_BASE_URL}/plants/search`, {
            params: {
                token: TREFLE_API_KEY,
                q: searchTerm,
                limit: 100,
                page: page
            }
        });
        return response.data.data || [];
    } catch (error) {
        console.error(`Fehler bei Suche "${searchTerm}":`, error.message);
        return [];
    }
}

// ===== ALLE BLUMEN LADEN =====
async function fetchAllFlowers() {
    try {
        console.log('🌿 Lade ALLE Blumen über Volltextsuche...');
        
        let allFlowers = [];
        
        // 🌸 Suchbegriffe für schöne Blumen
        const searchTerms = [
            'rose', 'tulip', 'daisy', 'orchid', 'lily', 'sunflower', 
            'lavender', 'peony', 'iris', 'dahlia', 'poppy', 'carnation',
            'hydrangea', 'geranium', 'petunia', 'marigold', 'zinnia',
            'cosmos', 'snapdragon', 'pansy', 'violet', 'primrose',
            'bluebell', 'buttercup', 'forget-me-not', 'anemone',
            'begonia', 'camellia', 'clematis', 'gerbera', 'hibiscus',
            'jasmine', 'lilac', 'magnolia', 'narcissus', 'oleander',
            'protea', 'ranunculus', 'sweet pea', 'verbena', 'wisteria',
            'yarrow', 'zantedeschia', 'aster', 'buddleja', 'coreopsis',
            'delphinium', 'echinacea', 'freesia', 'gardenia', 'heliotrope',
            'impatiens', 'kalanchoe', 'lantana', 'mimosa', 'nasturtium',
            'osteospermum', 'paeonia', 'quince', 'rudbeckia', 'salvia'
        ];
        
        let totalLoaded = 0;
        let page = 1;
        
        // Erstmal: Direkte Suche nach "flower"
        console.log('  🔍 Suche nach "flower"...');
        const flowerResults = await fetchFlowersBySearch('flower', 1);
        allFlowers = allFlowers.concat(flowerResults);
        console.log(`    ✅ ${flowerResults.length} Blumen gefunden`);
        
        // Dann: Alle Suchbegriffe durchgehen
        for (const term of searchTerms) {
            console.log(`  🔍 Suche nach "${term}"...`);
            
            try {
                const results = await fetchFlowersBySearch(term, 1);
                
                // Nur neue Blumen hinzufügen (keine Duplikate)
                const existingIds = new Set(allFlowers.map(f => f.id));
                const newFlowers = results.filter(f => !existingIds.has(f.id));
                
                if (newFlowers.length > 0) {
                    allFlowers = allFlowers.concat(newFlowers);
                    console.log(`    ✅ ${newFlowers.length} neue Blumen (${allFlowers.length} insgesamt)`);
                } else {
                    console.log(`    ⏭️ Keine neuen Blumen`);
                }
                
                // Kurze Pause für Rate Limit
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`  ❌ Fehler bei "${term}":`, error.message);
            }
        }
        
        // ===== FILTER: NUR ECHTE BLUMEN! =====
        console.log('\n🔍 Filtere Bäume, Gräser und Unkraut heraus...');
        
        const filteredFlowers = allFlowers.filter(plant => {
            const name = (plant.common_name || plant.scientific_name || '').toLowerCase();
            
            // ❌ AUSSCHLIESSEN: Bäume, Gräser, Farne, etc.
            const excludeTerms = [
                'tree', 'grass', 'fern', 'shrub', 'conifer', 'pine', 'oak', 
                'maple', 'birch', 'spruce', 'fir', 'cedar', 'cypress', 
                'juniper', 'palm', 'bamboo', 'reed', 'sedge', 'rush', 
                'moss', 'lichen', 'algae', 'fungi', 'mushroom', 'weed',
                'acacia', 'eucalyptus', 'willow', 'ash', 'beech', 'elm',
                'hickory', 'walnut', 'chestnut', 'poplar', 'cottonwood',
                'sycamore', 'ginkgo', 'redwood', 'sequoia', 'hemlock',
                'larch', 'yew', 'arborvitae', 'spruce', 'fraser'
            ];
            
            const isExcluded = excludeTerms.some(term => name.includes(term));
            
            // ✅ Nur Blumen mit Namen (keine leeren Einträge)
            const hasName = name.length > 0;
            
            // ✅ Bevorzuge Pflanzen mit Bildern (aber nicht ausschließen)
            const hasImage = plant.image_url || plant.image?.url;
            
            // ✅ Nur wenn NICHT ausgeschlossen und ein Name existiert
            return !isExcluded && hasName;
        });
        
        console.log(`  ✅ Vor Filter: ${allFlowers.length} Pflanzen`);
        console.log(`  ✅ Nach Filter: ${filteredFlowers.length} echte Blumen`);
        
        return filteredFlowers;
        
    } catch (error) {
        console.error('Fehler beim Laden der Blumen:', error.message);
        return [];
    }
}

// Cache verwenden
async function getFlowers() {
    const now = Date.now();
    
    if (flowerCache.length > 0 && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
        console.log(`📦 Verwende gecachte ${flowerCache.length} Blumen`);
        return flowerCache;
    }

    const flowers = await fetchAllFlowers();
    
    if (flowers.length > 0) {
        // Nach Bildern sortieren (mit Bildern zuerst)
        flowers.sort((a, b) => {
            const aHasImage = a.image_url || a.image?.url ? 1 : 0;
            const bHasImage = b.image_url || b.image?.url ? 1 : 0;
            return bHasImage - aHasImage;
        });
        
        flowerCache = flowers;
        lastFetchTime = now;
        console.log(`💾 ${flowers.length} Blumen gecacht`);
    }
    
    return flowerCache;
}

// ============ ROUTES ============

// 1. Alle Blumen
app.get('/api/flowers', async (req, res) => {
    try {
        const { search } = req.query;
        let flowers = await getFlowers();
        
        if (search && search.length > 1) {
            const searchLower = search.toLowerCase();
            flowers = flowers.filter(f => {
                const name = (f.common_name || f.scientific_name || '').toLowerCase();
                return name.includes(searchLower);
            });
        }
        
        const formattedFlowers = flowers.map(f => ({
            id: f.id,
            name: f.common_name || f.scientific_name || 'Unbekannte Blume',
            scientificName: f.scientific_name || '',
            family: f.family_common_name || f.family || '',
            imageUrl: f.image_url || f.image?.url || null,
            description: f.description || `Die ${f.common_name || f.scientific_name} ist eine wunderschöne Blume.`,
            year: f.year || 0
        }));
        
        res.json({
            success: true,
            count: formattedFlowers.length,
            data: formattedFlowers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Blumen',
            error: error.message
        });
    }
});

// 2. Blumen-Details
app.get('/api/flowers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Erst im Cache suchen
        let flower = flowerCache.find(f => f.id == id);
        
        if (!flower) {
            const response = await axios.get(`${TREFLE_BASE_URL}/plants/${id}`, {
                params: { token: TREFLE_API_KEY }
            });
            flower = response.data.data;
        }
        
        if (!flower) {
            return res.status(404).json({
                success: false,
                message: 'Blume nicht gefunden'
            });
        }
        
        const formatted = {
            id: flower.id,
            name: flower.common_name || flower.scientific_name || 'Unbekannte Blume',
            scientificName: flower.scientific_name || '',
            family: flower.family_common_name || flower.family || '',
            imageUrl: flower.image_url || flower.image?.url || null,
            description: flower.description || `Die ${flower.common_name || flower.scientific_name} ist eine wunderschöne Blume.`,
            year: flower.year || 0,
            genus: flower.genus || '',
            edible: flower.edible || false,
            medicinal: flower.medicinal || false
        };
        
        res.json({
            success: true,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Blumendetails',
            error: error.message
        });
    }
});

// 3. Blume des Tages
app.get('/api/flower-of-the-day', async (req, res) => {
    try {
        const flowers = await getFlowers();
        if (flowers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Keine Blumen verfügbar'
            });
        }
        
        const flowersWithImages = flowers.filter(f => f.image_url || f.image?.url);
        const pool = flowersWithImages.length > 0 ? flowersWithImages : flowers;
        
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        const index = dayOfYear % pool.length;
        const flower = pool[index];
        
        res.json({
            success: true,
            data: {
                id: flower.id,
                name: flower.common_name || flower.scientific_name || 'Unbekannte Blume',
                scientificName: flower.scientific_name || '',
                imageUrl: flower.image_url || flower.image?.url || null,
                description: flower.description || `Die ${flower.common_name || flower.scientific_name} ist eine wunderschöne Blume.`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Fehler beim Abrufen der Blume des Tages',
            error: error.message
        });
    }
});

// 4. Cache neu laden
app.post('/api/refresh', async (req, res) => {
    try {
        flowerCache = [];
        lastFetchTime = null;
        await getFlowers();
        res.json({
            success: true,
            message: 'Cache erfolgreich neu geladen',
            count: flowerCache.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Fehler beim Neuladen des Caches',
            error: error.message
        });
    }
});

// 5. Health-Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        cacheSize: flowerCache.length
    });
});

// 6. Cache-Status
app.get('/api/cache-status', (req, res) => {
    res.json({
        success: true,
        cacheSize: flowerCache.length,
        lastFetch: lastFetchTime ? new Date(lastFetchTime).toISOString() : null,
        cacheAge: lastFetchTime ? Math.floor((Date.now() - lastFetchTime) / 1000 / 60) : null
    });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 Blumentagebuch Backend läuft auf http://0.0.0.0:${PORT}`);
    console.log(`📊 API-Endpunkte:`);
    console.log(`   - GET  /api/flowers           (Alle Blumen)`);
    console.log(`   - GET  /api/flowers/:id       (Detailansicht)`);
    console.log(`   - GET  /api/flower-of-the-day (Blume des Tages)`);
    console.log(`   - POST /api/refresh           (Cache neu laden)`);
    console.log(`   - GET  /api/cache-status      (Cache-Info)`);
    console.log(`   - GET  /health                (Health-Check)`);
    
    getFlowers().then(flowers => {
        console.log(`🌺 ${flowers.length} Blumen im Cache bereit`);
    });
});