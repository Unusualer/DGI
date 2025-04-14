# DGI Request Management System

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

1. **Run the application**
   - Execute `run-dgi.bat` as Administrator
   - You'll see two options:
     1. Start the application normally (preserves existing data)
     2. Initialize/reset the database (WARNING: deletes existing data)
   - First-time users should select option 2 to initialize the database
   - For subsequent runs, select option 1 to preserve your data

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

4. **What the script does**
   - Checks/starts PostgreSQL service
   - Verifies/creates the database
   - Checks if Docker is running
   - Configures environment to use local PostgreSQL
   - Starts the application using Docker Compose

5. **Accessing the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

### Persistent Data Storage
The application uses your local PostgreSQL installation rather than a Docker container for the database. This ensures all data persists between restarts of Docker or your computer.

### Development Mode (Optional)
For development purposes, use `run-dev.bat` instead. This uses Docker for all components (including PostgreSQL) but note that data will not persist when Docker closes.

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

## Deployment on Linux/Unix Server

1. Install Docker and Docker Compose:
```bash
sudo apt update
sudo apt install docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

2. Clone the repository:
```bash
git clone <repository-url>
cd DGIApp
```

3. Configure environment variables (optional):
```bash
# Create a .env file (optional for custom configuration)
touch .env
```

4. Start the application:
```bash
sudo docker-compose up -d
```

5. Access the application:
   - Frontend: http://<your-server-ip>:3000
   - Backend API: http://<your-server-ip>:8080/api

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request 