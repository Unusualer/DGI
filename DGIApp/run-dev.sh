#!/bin/bash

# Development startup script for DGI Application

# Set environment variables for development
export POSTGRES_DB=dgiapp
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres
export JWT_SECRET=devSecretKeyForTesting
export JWT_EXPIRATION=86400000
export CORS_ALLOWED_ORIGINS=*
export LOG_LEVEL_SPRING_SECURITY=DEBUG
export LOG_LEVEL_APP=DEBUG
export LOG_LEVEL_JWT=DEBUG
export REACT_APP_BACKEND_PORT=8080

# Display configuration
echo "Starting development environment with:"
echo "JWT_SECRET: $JWT_SECRET"
echo "CORS_ALLOWED_ORIGINS: $CORS_ALLOWED_ORIGINS"

# Start the application with Docker Compose
docker-compose up -d

echo ""
echo "Application started in development mode!"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:8080"
echo ""
echo "Use Ctrl+C to stop viewing logs"
echo "Run 'docker-compose down' to stop all services"
echo ""

# Follow logs
docker-compose logs -f 