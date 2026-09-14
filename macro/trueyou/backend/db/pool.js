const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Pool-Logging für Debugging
pool.on('connect', () => console.log('📊 TrueYou DB: Neue Connection'));
pool.on('error', (err) => console.error('📊 TrueYou DB Fehler:', err));

module.exports = pool;