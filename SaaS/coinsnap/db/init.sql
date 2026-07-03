-- Benutzer Tabelle
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kategorien Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense'))
);

-- Transaktionen Tabelle
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Spar-Challenges Tabelle
CREATE TABLE IF NOT EXISTS savings_challenges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Beispiel-Kategorien
INSERT INTO categories (name, type) VALUES 
    ('Gehalt', 'income'),
    ('Nebeneinkünfte', 'income'),
    ('Lebensmittel', 'expense'),
    ('Miete', 'expense'),
    ('Transport', 'expense'),
    ('Freizeit', 'expense'),
    ('Spar-Challenge', 'expense')
ON CONFLICT (name) DO NOTHING;