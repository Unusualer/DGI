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

CREATE TABLE IF NOT EXISTS attestations (
    id SERIAL PRIMARY KEY,
    IF VARCHAR(255) NOT NULL,
    cin VARCHAR(255) NOT NULL,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(255),
    type VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'déposé',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    creator_id BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS type_attestations (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    
    -- Insert default attestation types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM type_attestations WHERE label = 'Attestation de Revenu Globale') THEN
        INSERT INTO type_attestations (label) 
        VALUES ('Attestation de Revenu Globale');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM type_attestations WHERE label = 'Attestation d''Assujettissement au TVA Logement Social') THEN
        INSERT INTO type_attestations (label) 
        VALUES ('Attestation d''Assujettissement au TVA Logement Social');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM type_attestations WHERE label = 'Attestation Renseignement Décès') THEN
        INSERT INTO type_attestations (label) 
        VALUES ('Attestation Renseignement Décès');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM type_attestations WHERE label = 'Attestation Départ Définitif') THEN
        INSERT INTO type_attestations (label) 
        VALUES ('Attestation Départ Définitif');
    END IF;
END
$$;

-- Add status column to attestations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attestations' AND column_name = 'status'
    ) THEN
        ALTER TABLE attestations ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'déposé';
    END IF;
END
$$; 