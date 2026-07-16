-- Create database
CREATE DATABASE ebook_empire;

\c ebook_empire;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    lemon_squeezy_customer_id VARCHAR(255),
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- eBooks table
CREATE TABLE ebooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    phase INTEGER CHECK (phase BETWEEN 0 AND 5),
    tier VARCHAR(50) CHECK (tier IN ('free', 'basic', 'advanced', 'full')),
    is_free BOOLEAN DEFAULT false,
    file_name VARCHAR(255),
    chapter_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User downloads tracking
CREATE TABLE user_downloads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ebook_id INTEGER REFERENCES ebooks(id),
    download_token VARCHAR(255) UNIQUE,
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    UNIQUE(user_id, ebook_id)
);

-- WebApps table
CREATE TABLE webapps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    external_url VARCHAR(500),
    tier VARCHAR(50) CHECK (tier IN ('advanced', 'full')),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User webapp access
CREATE TABLE user_webapp_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    webapp_id INTEGER REFERENCES webapps(id),
    access_token VARCHAR(255) UNIQUE,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, webapp_id)
);

-- ============ INSERT FREE EBOOKS ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der eine Schalter', 'der-eine-schalter', 'Was dich wirklich blockiert und wie du es in 10 Minuten umlegst', 0, 'free', true, 'free-ebook-1-der-eine-schalter.pdf', 23, 1),
('Tiefencode', 'tiefencode', 'Programmiere dein Unterbewusstsein neu – Die geheimen Skripte deiner Psyche', 0, 'free', true, 'free-ebook-2-tiefencode.pdf', 15, 2),
('Hardware Update', 'hardware-update', 'Optimiere dein mentales Betriebssystem für maximale Performance', 0, 'free', true, 'free-ebook-3-hardware-update.pdf', 18, 3);

-- ============ INSERT PHASE 1 (Basic Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Innere Thron', 'innere-thron', 'Meistere deine Emotionen und Gefühle – Setze dich auf deinen eigenen Thron', 1, 'basic', false, 'phase-1-1-innere-thron.pdf', 15, 4),
('Der Gedankenjäger', 'gedankenjaeger', 'Jage negative Gedanken und reprogrammiere dein Mindset', 1, 'basic', false, 'phase-1-2-gedankenjaeger.pdf', 20, 5),
('Ich.exe', 'ich-exe', 'Deine wahre Identität – Wer du wirklich bist, wenn alle Masken fallen', 1, 'basic', false, 'phase-1-3-ich-exe.pdf', 15, 6);

-- ============ INSERT PHASE 2 (Basic Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Das Gravitationsfeld', 'gravitationsfeld', 'Baue unwiderstehliches Charisma und magnetische Ausstrahlung auf', 2, 'basic', false, 'phase-2-1-gravitationsfeld.pdf', 20, 7),
('Looksmaxxing', 'looksmaxxing', 'Optimiere dein äußeres Erscheinungsbild – Das Beste aus dir machen', 2, 'basic', false, 'phase-2-2-looksmaxxing.pdf', 5, 8);

-- ============ INSERT PHASE 3 (Advanced Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der evolutionäre Spieler', 'evolutionaerer-spieler', 'Verstehe die tiefen evolutionären Treiber des menschlichen Verhaltens', 3, 'advanced', false, 'phase-3-1-evolutionaerer-spieler.pdf', 15, 9),
('Der unsichtbare Schlüssel', 'unsichtbare-schluessel', 'Lerne Menschen zu lesen wie ein offenes Buch', 3, 'advanced', false, 'phase-3-2-unsichtbare-schluessel.pdf', 20, 10);

-- ============ INSERT PHASE 4 (Advanced Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Verbal Jiu Jitsu', 'verbal-jiu-jitsu', 'Gewinne jede Diskussion – Verbale Hebel und Konter-Techniken', 4, 'advanced', false, 'phase-4-1-verbal-jiu-jitsu.pdf', 20, 11),
('Der Resonanzraum', 'resonanzraum', 'Baue tiefe, authentische Beziehungen auf', 4, 'advanced', false, 'phase-4-2-resonanzraum.pdf', 15, 12),
('Dark Mirror', 'dark-mirror', 'Erkenne Manipulation – Schütze dich vor psychologischen Angriffen', 4, 'advanced', false, 'phase-4-3-dark-mirror.pdf', 15, 13);

-- ============ INSERT PHASE 5 (Full Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der geteilte Kreis', 'geteilter-kreis', 'Die Psychologie der Frau – Verstehen, verbinden, begeistern', 5, 'full', false, 'phase-5-geteilter-kreis.pdf', 30, 14),
('Der einsame Jäger', 'einsamer-jaeger', 'Die Psyche des Mannes – Stärke, Fokus, Entschlossenheit', 5, 'full', false, 'phase-5-einsamer-jaeger.pdf', 30, 15);

-- ============ INSERT WEBAPPS ============
INSERT INTO webapps (name, slug, description, external_url, tier, sort_order) VALUES
('State Scanner', 'state-scanner', 'Checkt in 2 Minuten deine aktuelle innere Verfassung', '/webapps/state-scanner.html', 'advanced', 1),
('Daily Control Check', 'daily-control', '5 Fragen – trackst du deine Gedanken und Emotionen', '/webapps/daily-control.html', 'advanced', 2),
('The Mirror Tool', 'mirror-tool', 'Simuliert, wie andere deine Ausstrahlung wahrnehmen', '/webapps/mirror-tool.html', 'advanced', 3),
('Conversation Sim', 'conversation-sim', 'Trainiere verbale Präzision mit Jiu-Jitsu-Übungen', '/webapps/conversation-sim.html', 'advanced', 4),
('Progress Tracker', 'progress-tracker', 'Zeigt deinen Fortschritt durch Phasen 1–4', '/webapps/progress-tracker.html', 'full', 5);

-- Create indexes
CREATE INDEX idx_ebooks_tier ON ebooks(tier);
CREATE INDEX idx_ebooks_phase ON ebooks(phase);
CREATE INDEX idx_ebooks_slug ON ebooks(slug);
CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);
CREATE INDEX idx_user_webapp_access_user ON user_webapp_access(user_id);