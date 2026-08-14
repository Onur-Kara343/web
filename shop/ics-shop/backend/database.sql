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

-- ============ INSERT FREE EBOOKS ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Die Stille in dir', 'die-stille-in-dir', 'Das Gefühl der Leere und Einsamkeit verstehen und überwinden', 0, 'free', true, 'die-stille-in-dir.pdf', 8, 1),
('Tiefencode', 'tiefencode', 'Programmiere dein Unterbewusstsein neu – Die geheimen Skripte deiner Psyche', 0, 'free', true, 'der-tiefencode.pdf', 11, 2),
('Hardware Update', 'hardware-update', 'Optimiere dein mentales Betriebssystem für maximale Performance', 0, 'free', true, 'hardware-update.pdf', 12, 3);

-- ============ INSERT PHASE 1 (Basic Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der Innere Thron', 'der-innere-thron', 'Meistere deine Emotionen und Gefühle – Setze dich auf deinen eigenen Thron', 1, 'basic', false, 'der-innere-thron.pdf', 15, 4),
('Der Gedankenjäger', 'der-gedankenjaeger', 'Jage negative Gedanken und reprogrammiere dein Mindset', 1, 'basic', false, 'der-gedankenjaeger.pdf', 20, 5),
('Ich.exe', 'ich-exe', 'Deine wahre Identität – Wer du wirklich bist, wenn alle Masken fallen', 1, 'basic', false, 'ich-exe.pdf', 15, 6);

-- ============ INSERT PHASE 2 (Basic Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Das Gravitationsfeld', 'das-gravitationsfeld', 'Baue unwiderstehliches Charisma und magnetische Ausstrahlung auf', 2, 'basic', false, 'das-gravitationsfeld.pdf', 20, 7),
('Looksmaxxing', 'looksmaxxing', 'Optimiere dein äußeres Erscheinungsbild – Das Beste aus dir machen', 2, 'basic', false, 'das-schattenband.pdf', 5, 8);

-- ============ INSERT PHASE 3 (Advanced Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der evolutionäre Spieler', 'der-evolutionaere-spieler', 'Verstehe die tiefen evolutionären Treiber des menschlichen Verhaltens', 3, 'advanced', false, 'der-evolutionaere-spieler.pdf', 15, 9),
('Der unsichtbare Schlüssel', 'der-unsichtbare-schluessel', 'Lerne Menschen zu lesen wie ein offenes Buch', 3, 'advanced', false, 'der-unsichtbare-schluessel.pdf', 20, 10);

-- ============ INSERT PHASE 4 (Advanced Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Verbal Jiu Jitsu', 'verbal-jiu-jitsu', 'Gewinne jede Diskussion – Verbale Hebel und Konter-Techniken', 4, 'advanced', false, 'verbal-jiu-jitsu.pdf', 20, 11),
('Der Resonanzraum', 'der-resonanzraum', 'Baue tiefe, authentische Beziehungen auf', 4, 'advanced', false, 'dark-mirror.pdf', 15, 12),
('Dark Mirror', 'dark-mirror', 'Erkenne Manipulation – Schütze dich vor psychologischen Angriffen', 4, 'advanced', false, 'dark-mirror.pdf', 15, 13);

-- ============ INSERT PHASE 5 (Full Tier) ============
INSERT INTO ebooks (title, slug, description, phase, tier, is_free, file_name, chapter_count, sort_order) VALUES
('Der geteilte Kreis', 'der-geteilte-kreis', 'Die Psychologie der Frau – Verstehen, verbinden, begeistern', 5, 'full', false, 'der-geteilte-kreis.pdf', 30, 14),
('Der einsame Jäger', 'der-einsame-jaeger', 'Die Psyche des Mannes – Stärke, Fokus, Entschlossenheit', 5, 'full', false, 'der-einsame-jaeger.pdf', 30, 15);

-- Create indexes
CREATE INDEX idx_ebooks_tier ON ebooks(tier);
CREATE INDEX idx_ebooks_phase ON ebooks(phase);
CREATE INDEX idx_ebooks_slug ON ebooks(slug);
CREATE INDEX idx_user_downloads_user ON user_downloads(user_id);