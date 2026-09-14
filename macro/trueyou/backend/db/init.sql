-- Datenbank
CREATE DATABASE trueyou;

\c trueyou;

-- ===== USERS =====
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_activated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== TEST RESULTS =====
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    test_id VARCHAR(50) NOT NULL,
    results JSONB NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== INDIZES FÜR PERFORMANCE =====
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_id ON test_results(test_id);
CREATE INDEX idx_test_results_taken_at ON test_results(taken_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ===== TEST-USER (für Development) =====
-- Passwort: test123
-- INSERT INTO users (username, email, password_hash, is_premium) 
-- VALUES ('testuser', 'test@test.de', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mr/.cZxqB2eB5YPLl7s4Vn5XKxQzKfK', true);