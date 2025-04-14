-- =============================================
-- DGI Application Database Setup
-- Combined schema and data initialization
-- =============================================

-- Schema creation (tables will only be created if they don't exist)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(255) CHECK (role IN ('ROLE_FRONTDESK', 'ROLE_PROCESSING', 'ROLE_MANAGER', 'ROLE_ADMIN'))
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    raison_sociale_noms_prenoms VARCHAR(255) NOT NULL,
    pm_pp VARCHAR(255),
    cin VARCHAR(255),
    tp VARCHAR(255),
    IF VARCHAR(255),
    ICE VARCHAR(255),
    secteur VARCHAR(255),
    gsm VARCHAR(255),
    fix VARCHAR(255),
    email VARCHAR(255),
    objet TEXT,
    remarque TEXT,
    etat VARCHAR(255),
    motif_rejet TEXT,
    date_entree DATE,
    date_traitement DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    creator_id BIGINT NOT NULL REFERENCES users(id),
    agent_id BIGINT REFERENCES users(id)
);

-- Data initialization (default users, will only be inserted if they don't exist)
DO $$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('admin', 'admin@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_ADMIN');
    END IF;
    
    -- Check if manager user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('manager', 'manager@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_MANAGER');
    END IF;
    
    -- Check if processing user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'processing') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('processing', 'processing@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_PROCESSING');
    END IF;
    
    -- Check if frontdesk user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'frontdesk') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('frontdesk', 'frontdesk@example.com', '$2a$10$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_FRONTDESK');
    END IF;
END
$$; 