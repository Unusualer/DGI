# Gestion BACT System

A full-stack application for managing document requests with role-based state transitions and ownership tracking for administrative processes.

## Features

- **Request Management**: Creation, tracking, and processing of document requests
- **Role-Based Access Control**:
  - **Frontdesk**: Submit and track requests, deliver completed requests
  - **Processing**: Process requests, update request status
  - **Manager**: Access to dashboard with analytics and reporting
  - **Admin**: User management and system configuration
- **Ownership Tracking**: Automatic and manual assignment of requests to appropriate agents
- **Workflow Management**: Structured state transitions (PENDING → IN_PROGRESS → COMPLETED → DELIVERED)
- **Analytics Dashboard**: Performance metrics and request statistics
- **Request Tracking**: Public tracking interface for submitters to check request status

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.1.3 with Java 17
- **Security**: Spring Security with JWT authentication
- **Database**: PostgreSQL with JPA/Hibernate
- **API**: RESTful API with JSON payloads

### Frontend
- **Framework**: React 18 with React Router for navigation
- **UI Components**: Material-UI (MUI) with responsive design
- **State Management**: Context API and React Hooks
- **HTTP Client**: Axios for API communication
- **Charts**: Chart.js for analytics visualization

### Deployment
- **Containerization**: Docker and Docker Compose
- **Web Server**: Nginx for serving frontend static assets

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Java 17](https://adoptium.net/) (for local development)
- [Node.js 16+](https://nodejs.org/) (for local development)
- [PostgreSQL 14+](https://www.postgresql.org/) (for local development)

## Running with Docker

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd DGIApp

# Start all services
docker-compose up -d

# The application will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080/api
```

## Windows Hosting Guide

For deployment on Windows machines with data persistence:

### Prerequisites
1. Install PostgreSQL
   - Download from: https://www.postgresql.org/download/windows/
   - During installation, set password to "postgres" (or update in script)
   - Note: Compatible with PostgreSQL 12 or 17

2. Install Docker Desktop
   - Download from: https://www.docker.com/products/docker-desktop/
   - Complete installation and ensure it's running

### Deployment Steps

1. **Configure environment variables**
   - Set the following variables for production:
   ```
   set POSTGRES_DB=dgiapp
   set POSTGRES_USER=postgres
   set POSTGRES_PASSWORD=postgres
   set JWT_SECRET=your_strong_secret_key
   set JWT_EXPIRATION=86400000
   set CORS_ALLOWED_ORIGINS=http://localhost:3000
   set LOG_LEVEL_SPRING_SECURITY=INFO
   set LOG_LEVEL_APP=INFO
   set LOG_LEVEL_JWT=INFO
   set REACT_APP_BACKEND_PORT=8080
   ```

2. **Configure Firewall** (First-time setup)
   - Run the following commands in an Administrator command prompt to allow traffic:
   ```
   netsh advfirewall firewall add rule name="DGI Frontend" dir=in action=allow protocol=TCP localport=3000
   netsh advfirewall firewall add rule name="DGI Backend" dir=in action=allow protocol=TCP localport=8080
   ```

3. **Build and Start the Application**
   - To build and start all containers:
   ```
   docker-compose up -d --build
   ```

4. **Managing the Application**
   - Start/restart the backend service:
   ```
   docker-compose stop backend
   docker-compose up -d backend
   ```
   - Start/restart the frontend service:
   ```
   docker-compose stop frontend
   docker-compose up -d frontend
   ```
   - Stop all services:
   ```
   docker-compose down
   ```
   - View logs:
   ```
   docker-compose logs -f          # All services
   docker-compose logs -f backend  # Backend only
   docker-compose logs -f frontend # Frontend only
   ```

5. **Accessing the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

### Persistent Data Storage
The application uses your local PostgreSQL installation rather than a Docker container for the database. This ensures all data persists between restarts of Docker or your computer.

### Development Mode (Optional)
For development purposes, you can set the following environment variables:
```
set POSTGRES_DB=dgiapp
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres
set JWT_SECRET=devSecretKeyForTesting
set JWT_EXPIRATION=86400000
set CORS_ALLOWED_ORIGINS=*
set LOG_LEVEL_SPRING_SECURITY=DEBUG
set LOG_LEVEL_APP=DEBUG
set LOG_LEVEL_JWT=DEBUG
set REACT_APP_BACKEND_PORT=8080
```
Note that in development mode, data may not persist when Docker closes.

## Local Development Setup

### Backend

```bash
cd DGIApp/backend

# Run the Spring Boot application
./gradlew bootRun
```

The backend will start on http://localhost:8080.

### Frontend

```bash
cd DGIApp/frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on http://localhost:3000.

### Database

Make sure PostgreSQL is running and create a database named `dgiapp`:

```sql
CREATE DATABASE dgiapp;
```

## Default User Accounts

The system comes with the following pre-configured user accounts:

| Username    | Password | Role       | Capabilities                                            |
|-------------|----------|------------|--------------------------------------------------------|
| admin       | password | Admin      | User management, system configuration                   |
| manager     | password | Manager    | Request processing, analytics, reporting                |
| processing  | password | Processing | Request processing and status updates                   |
| frontdesk   | password | Frontdesk  | Request creation, tracking, and delivery management     |

## Request Workflow

1. **Submission**: 
   - **Frontdesk** creates a new request (status: PENDING)
   - System assigns a tracking ID for the request

2. **Processing**:
   - **Processing** user claims the request (status: IN_PROGRESS)
   - Request ownership transfers to the processing agent

3. **Completion**:
   - **Processing** user completes the request (status: COMPLETED)
   - Ownership transfers back to Frontdesk

4. **Delivery**:
   - **Frontdesk** user delivers the completed request (status: DELIVERED)
   - Request lifecycle is completed

## Deployment on Linux/Unix Server (Ubuntu)

### Prerequisites

1. Install Docker and Docker Compose:
```bash
# Update the package list
sudo apt update

# Install required dependencies
sudo apt install -y curl wget git vim unzip net-tools ca-certificates gnupg

# Add Docker's official GPG key
sudo apt install -y apt-transport-https
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.16.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start and enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Add your user to the docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
# Log out and back in for this to take effect
```

2. Install PostgreSQL:
```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Database Setup

1. Create the database and user:
```bash
# Connect to PostgreSQL as postgres user and create database and user
sudo -u postgres psql
```

Run these commands in the PostgreSQL prompt:
```sql
CREATE DATABASE dgiapp;
CREATE USER dgiapp WITH ENCRYPTED PASSWORD 'your_secure_password';
ALTER DATABASE dgiapp OWNER TO dgiapp;
GRANT ALL ON SCHEMA public TO dgiapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dgiapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dgiapp;
ALTER USER dgiapp CREATEDB;
\q
```

2. Set proper permissions for the database user:
```bash
# Connect to PostgreSQL and grant permissions
sudo -u postgres psql -d dgiapp
```

Run these commands in the PostgreSQL prompt if you encounter permission issues:
```sql
-- These commands are crucial to prevent "permission denied" errors with Hibernate
GRANT ALL PRIVILEGES ON SCHEMA public TO dgiapp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dgiapp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dgiapp;
ALTER USER dgiapp CREATEDB;
\q
```

3. Configure PostgreSQL to allow connections from Docker containers:
```bash
# Edit postgresql.conf to listen on all interfaces
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Add entry to pg_hba.conf to allow connections from all hosts
echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL to apply changes
sudo systemctl restart postgresql
```

### Application Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd DGIApp
```

2. Create database schema and default users:
```bash
# Create a SQL script for database initialization
# Create a SQL script for database initialization
cat > init-db.sql << EOF
-- =============================================
-- DGI Application Database Setup
-- Schema and data initialization
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
    creator_id BIGINT NOT NULL REFERENCES users(id),
    delivered_by BIGINT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS type_attestations (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data initialization (default users, will only be inserted if they don't exist)
DO \$\$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('admin', 'admin@example.com', '\$2a\$10\$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_ADMIN');
    END IF;
    
    -- Check if manager user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('manager', 'manager@example.com', '\$2a\$10\$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_MANAGER');
    END IF;
    
    -- Check if processing user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'processing') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('processing', 'processing@example.com', '\$2a\$10\$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_PROCESSING');
    END IF;
    
    -- Check if frontdesk user exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'frontdesk') THEN
        INSERT INTO users (username, email, password, role) 
        VALUES ('frontdesk', 'frontdesk@example.com', '\$2a\$10\$TM3PAYG3b.H98cbRrHqWa.BM7YyCqV92e/kUTBfj85AjayxGZU7d6', 'ROLE_FRONTDESK');
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
\$\$;

-- Add status column to attestations table if it doesn't exist
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attestations' AND column_name = 'status'
    ) THEN
        ALTER TABLE attestations ADD COLUMN status VARCHAR(255) NOT NULL DEFAULT 'déposé';
    END IF;
END
\$\$;
EOF

# Execute the SQL script
cat init-db.sql | sudo -u postgres psql -d dgiapp
```


```

4. Build and start the application:
```bash
# Build and start all services in detached mode
sudo docker-compose up -d --build
```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

6. Log in with one of the default accounts:
   - admin / password
   - manager / password
   - processing / password
   - frontdesk / password

### Troubleshooting

1. **Backend container keeps restarting**
   - Check backend logs: `sudo docker-compose logs backend`
   - Verify database permissions: If you see "permission denied for table" errors, run:
     ```bash
     sudo -u postgres psql -d dgiapp -c "GRANT ALL PRIVILEGES ON SCHEMA public TO dgiapp; GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dgiapp; GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dgiapp; ALTER USER dgiapp CREATEDB;"
     ```
   - Check database connectivity: `psql -h localhost -U dgiapp -d dgiapp`
   - If schema validation errors persist, consider temporarily setting `SPRING_JPA_HIBERNATE_DDL_AUTO: update` in your docker-compose.yml file

2. **Network connection issues**
   - For WSL environments, replace `host.docker.internal` with the actual IP address of your WSL instance:
     ```bash
     export WSL_IP=$(ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
     sed -i "s|jdbc:postgresql://host.docker.internal:5432/dgiapp|jdbc:postgresql://${WSL_IP}:5432/dgiapp|g" docker-compose.yml
     ```

3. **"Permission denied for schema public" error**
   - Ensure you've granted all necessary permissions to the dgiapp user:
     ```bash
     sudo -u postgres psql -c "GRANT ALL ON SCHEMA public TO dgiapp;"
     sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dgiapp;"
     sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dgiapp;"
     ```

4. **Frontend can't connect to backend**
   - Check that both containers are running: `sudo docker-compose ps`
   - Verify the frontend's nginx.conf file points to the correct backend URL
   - Test backend directly: `curl http://localhost:8080/api/health`

### Managing the Application

```bash
# Start/restart the backend service
sudo docker-compose stop backend
sudo docker-compose up -d backend

# Start/restart the frontend service
sudo docker-compose stop frontend
sudo docker-compose up -d frontend

# Stop all services
sudo docker-compose down

# View logs
sudo docker-compose logs -f          # All services
sudo docker-compose logs -f backend  # Backend only
sudo docker-compose logs -f frontend # Frontend only

# Check the status of running containers
sudo docker-compose ps

# Access container shell (useful for debugging)
sudo docker-compose exec backend sh
sudo docker-compose exec frontend sh
```

### Security Considerations

1. **Change default passwords**:
   After successful deployment, use the admin account to change the default passwords for all users.

2. **Firewall configuration**:
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 8080/tcp
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

3. **Secure the database**:
   - Remove direct internet access to PostgreSQL if not needed
   - Use strong passwords
   - Consider implementing regular database backups

4. **Set up HTTPS**:
   For production environments, configure Nginx with Let's Encrypt for HTTPS.

## PostgreSQL Database Management

### Database Backup

```bash
# Create a backup of the database
sudo -u postgres pg_dump dgiapp > dgiapp_backup_$(date +%Y%m%d).sql

# Automate backups with cron
sudo nano /etc/cron.d/dgi-backup
# Add line:
0 2 * * * postgres pg_dump dgiapp > /path/to/backups/dgiapp_backup_$(date +%Y%m%d).sql
```

### Database Restore

```bash
# Restore from a backup
sudo -u postgres psql dgiapp < dgiapp_backup_YYYYMMDD.sql
```

### Migration From Another Database System

If you need to migrate data from another database system:

1. Export data from the source database (e.g., MySQL, H2, etc.)
2. Convert the data format if needed
3. Import into PostgreSQL:
```bash
sudo -u postgres psql dgiapp < imported_data.sql
```

### Database Tuning

For production environments, consider these PostgreSQL performance optimizations:

1. Edit postgresql.conf to adjust these key settings:
```
# Memory settings
shared_buffers = 1GB  # 25% of available RAM, up to 8GB
work_mem = 64MB       # Adjust based on query complexity
maintenance_work_mem = 256MB

# Write-Ahead Log
wal_buffers = 16MB

# Background Writer
bgwriter_delay = 200ms
bgwriter_lru_maxpages = 100

# Query Planner
effective_cache_size = 3GB  # 50-75% of available RAM
```

2. Create appropriate indexes for common queries in your application

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request 

## Database Schema

### Attestations Table
The attestations table stores information about attestation requests. Key fields include:

- `id`: Unique identifier
- `IF`: Tax identification number
- `cin`: National ID number
- `nom`: Last name
- `prenom`: First name
- `email`: Email address (optional)
- `phone`: Phone number (optional)
- `type`: Type of attestation
- `status`: Current status ('déposé' or 'livré')
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp
- `creator_id`: Reference to the user who created the attestation
- `delivered_by`: Reference to the user who marked the attestation as delivered (null if not delivered)

The table includes foreign key constraints to ensure data integrity:
- `creator_id` references the users table (required)
- `delivered_by` references the users table (optional)

## 🚀 Production Deployment with Docker Compose

To build and run the application in production mode using Docker Compose:

```bash
docker-compose up -d --build
```

- This command will:
  - Build the Docker images for all services (frontend, backend, etc.) using the production configuration.
  - Start the containers in the background.
  - Serve the production build of the frontend (and backend, if applicable).

**Note:**
- Make sure your `Dockerfile` and `docker-compose.yml` are configured for production (the Dockerfile should use `npm run build` for React and serve the static build with a production server like nginx).
- You do **not** need to run any manual build or start commands inside the containers.

To stop the application:

```bash
docker-compose down
```

