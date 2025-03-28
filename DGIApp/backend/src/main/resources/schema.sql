-- Drop existing tables if they exist
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create tables
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