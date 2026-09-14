-- Create database
CREATE DATABASE ebook_empire;

\c ebook_empire;

-- ============ USERS TABLE ============
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    lemon_squeezy_customer_id VARCHAR(255),
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- ============ SHOP EBOOKS (5 Stück: 3 free + 2 paid) ============
CREATE TABLE shop_ebooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    file_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER SHOP EBOOKS ============
CREATE TABLE user_shop_ebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ebook_id INTEGER REFERENCES shop_ebooks(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_token VARCHAR(255) UNIQUE,
    downloaded_at TIMESTAMP,
    UNIQUE(user_id, ebook_id)
);

-- ============ TRANSFORMATION PHASES ============
CREATE TABLE phases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    phase_number INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ PHASE EBOOKS (eBooks pro Phase) ============
CREATE TABLE phase_ebooks (
    id SERIAL PRIMARY KEY,
    phase_id INTEGER REFERENCES phases(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER PHASES ============
CREATE TABLE user_phases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phase_id INTEGER REFERENCES phases(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phase_id)
);

-- ============ USER PHASE EBOOKS (gekaufte eBooks innerhalb einer Phase) ============
CREATE TABLE user_phase_ebooks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phase_ebook_id INTEGER REFERENCES phase_ebooks(id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP,
    download_token VARCHAR(255) UNIQUE,
    UNIQUE(user_id, phase_ebook_id)
);

-- ============ TRANSFORMATION MODULES (Basic, Advanced, Full) ============
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    phase_ids INTEGER[] NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ USER MODULES ============
CREATE TABLE user_modules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- ============ INSERT SHOP EBOOKS ============
-- 3 Kostenlose eBooks
INSERT INTO shop_ebooks (title, slug, description, price, is_free, file_name, sort_order) VALUES
('Die Stille in dir', 'die-stille-in-dir', 'Das Gefühl der Leere und Einsamkeit verstehen und überwinden – 8 Kapitel', 0, true, 'die-stille-in-dir.pdf', 1),
('Tiefencode', 'tiefencode', 'Programmiere dein Unterbewusstsein neu – Die geheimen Skripte deiner Psyche – 11 Kapitel', 0, true, 'der-tiefencode.pdf', 2),
('Hardware Update', 'hardware-update', 'Optimiere dein mentales Betriebssystem für maximale Performance – 12 Kapitel', 0, true, 'hardware-update.pdf', 3);

-- 2 Kostenpflichtige Shop-eBooks (9,99€)
INSERT INTO shop_ebooks (title, slug, description, price, is_free, file_name, sort_order) VALUES
('Das letzte Gefecht', 'das-letzte-gefecht', 'Wie du mit dem Tod lebst – und warum das dein Leben erst wirklich macht', 9.99, false, 'das-letzte-gefecht.pdf', 4),
('Der schlafende Riese', 'der-schlafende-riese', 'Wie du dein volles Potenzial weckst – Die Kraft, die in dir schlummert', 9.99, false, 'der-schlafende-riese.pdf', 5);

-- ============ INSERT TRANSFORMATION PHASES ============
INSERT INTO phases (name, slug, description, phase_number, price, sort_order) VALUES
('Inner Control', 'phase-1', 'Gedanken & Emotionen steuern – Werde Herr deiner inneren Welt', 1, 39.00, 1),
('Presence', 'phase-2', 'Ausstrahlung & Ruhe aufbauen – Zeige Präsenz in jeder Situation', 2, 39.00, 2),
('Human Understanding', 'phase-3', 'Menschen lesen wie ein System – Die Psychologie der Wahrnehmung', 3, 59.00, 3),
('Power', 'phase-4', 'Tiefe Beziehungen + verbale Präzision – Meistere jede Kommunikation', 4, 59.00, 4),
('Mastery', 'phase-5', 'Die vollständige Meisterschaft über deine Psyche – Das Finale', 5, 79.00, 5);

-- ============ INSERT PHASE EBOOKS ============
-- Phase 1: Inner Control (3 eBooks)
INSERT INTO phase_ebooks (phase_id, title, slug, description, file_name, sort_order) VALUES
(1, 'Der Innere Thron', 'der-innere-thron', 'Meistere deine Emotionen und Gefühle – Setze dich auf deinen eigenen Thron', 'der-innere-thron.pdf', 1),
(1, 'Der Gedankenjäger', 'der-gedankenjaeger', 'Jage negative Gedanken und reprogrammiere dein Mindset', 'der-gedankenjaeger.pdf', 2),
(1, 'Ich.exe', 'ich-exe', 'Deine wahre Identität – Wer du wirklich bist, wenn alle Masken fallen', 'ich-exe.pdf', 3);

-- Phase 2: Presence (1 eBook)
INSERT INTO phase_ebooks (phase_id, title, slug, description, file_name, sort_order) VALUES
(2, 'Das Gravitationsfeld', 'das-gravitationsfeld', 'Baue unwiderstehliches Charisma und magnetische Ausstrahlung auf', 'das-gravitationsfeld.pdf', 1);

-- Phase 3: Human Understanding (2 eBooks)
INSERT INTO phase_ebooks (phase_id, title, slug, description, file_name, sort_order) VALUES
(3, 'Der evolutionäre Spieler', 'der-evolutionaere-spieler', 'Verstehe die tiefen evolutionären Treiber des menschlichen Verhaltens', 'der-evolutionaere-spieler.pdf', 1),
(3, 'Der unsichtbare Schlüssel', 'der-unsichtbare-schluessel', 'Lerne Menschen zu lesen wie ein offenes Buch', 'der-unsichtbare-schluessel.pdf', 2);

-- Phase 4: Power (2 eBooks)
INSERT INTO phase_ebooks (phase_id, title, slug, description, file_name, sort_order) VALUES
(4, 'Dark Mirror', 'dark-mirror', 'Erkenne Manipulation – Schütze dich vor psychologischen Angriffen', 'dark-mirror.pdf', 1),
(4, 'Das Schattenband', 'das-schattenband', 'Optimiere dein äußeres Erscheinungsbild – Das Beste aus dir machen', 'das-schattenband.pdf', 2);

-- Phase 5: Mastery (2 eBooks)
INSERT INTO phase_ebooks (phase_id, title, slug, description, file_name, sort_order) VALUES
(5, 'Der geteilte Kreis', 'der-geteilte-kreis', 'Die Psychologie der Frau – Verstehen, verbinden, begeistern', 'der-geteilte-kreis.pdf', 1),
(5, 'Der einsame Jäger', 'der-einsame-jaeger', 'Die Psyche des Mannes – Stärke, Fokus, Entschlossenheit', 'der-einsame-jaeger.pdf', 2);

-- ============ INSERT TRANSFORMATION MODULES ============
INSERT INTO modules (name, slug, description, price, phase_ids, sort_order) VALUES
('Basic', 'module-basic', 'Phase 1 + 2 – Inner Control & Presence', 39.00, ARRAY[1,2], 1),
('Advanced', 'module-advanced', 'Phase 1-4 – Inner Control, Presence, Human Understanding & Power', 59.00, ARRAY[1,2,3,4], 2),
('Full', 'module-full', 'Phase 1-5 – Alle Phasen inkl. Mastery', 79.00, ARRAY[1,2,3,4,5], 3);

-- ============ CREATE INDEXES ============
CREATE INDEX idx_user_shop_ebooks_user ON user_shop_ebooks(user_id);
CREATE INDEX idx_user_shop_ebooks_ebook ON user_shop_ebooks(ebook_id);
CREATE INDEX idx_user_phases_user ON user_phases(user_id);
CREATE INDEX idx_user_phases_phase ON user_phases(phase_id);
CREATE INDEX idx_user_modules_user ON user_modules(user_id);
CREATE INDEX idx_user_modules_module ON user_modules(module_id);
CREATE INDEX idx_shop_ebooks_slug ON shop_ebooks(slug);
CREATE INDEX idx_phases_slug ON phases(slug);
CREATE INDEX idx_modules_slug ON modules(slug);
CREATE INDEX idx_phase_ebooks_phase ON phase_ebooks(phase_id);
CREATE INDEX idx_phase_ebooks_slug ON phase_ebooks(slug);
CREATE INDEX idx_user_phase_ebooks_user ON user_phase_ebooks(user_id);