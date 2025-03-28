# DGI Request Management System

A full-stack application for managing requests with state transitions and ownership tracking.

## Features

- Request submission and tracking
- Role-based access control (Frontdesk, Processing, Manager, Admin)
- Automatic and manual owner transfers
- Dashboard for monitoring requests
- Tracking receipts for request lookup

## Technology Stack

- **Backend**: Spring Boot, Spring Security, JPA/Hibernate, PostgreSQL
- **Frontend**: React, Material-UI
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker, Docker Compose

## Prerequisites

- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Java 17](https://adoptium.net/) (for local development)
- [Node.js](https://nodejs.org/) (for local development)
- [PostgreSQL](https://www.postgresql.org/) (for local development)

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

When you first run the application, you might want to set up the following user accounts:

- **Admin**: admin/password
- **Manager**: manager/password
- **Processing**: processing/password
- **Frontdesk**: frontdesk/password

## Workflow

1. **Frontdesk User** submits requests (status: PENDING) and provides a tracking receipt ID.
2. **Processing User** updates the state to IN_PROGRESS (ownership transfers automatically).
3. Once processed, **Processing User** marks it as COMPLETED (ownership transfers back to Frontdesk).
4. **Frontdesk User** updates the status to DELIVERED when the request is delivered to the submitter.

## Deployment on Ubuntu Server

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

3. Start the application:
```bash
sudo docker-compose up -d
```

4. Access the application:
   - Frontend: http://<your-server-ip>:3000
   - Backend API: http://<your-server-ip>:8080/api 