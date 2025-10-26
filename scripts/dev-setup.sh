#!/bin/bash

# Local Development Setup Script

set -e

echo "=== Setting up GenAI Chat Application for Local Development ==="

# Check if Docker is installed
if ! command -v docker >/dev/null 2>&1; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version >/dev/null 2>&1; then
    echo "Error: Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Create .env file for backend if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
    cat <<EOF > backend/.env
# Environment variables for local development
ENV=development
GROQ_API_KEY=your_groq_api_key_here
# Add other API keys as needed
# TOGETHER_API_KEY=your_together_api_key_here
EOF
    echo "⚠️  Please update backend/.env with your actual API keys"
fi

# Build and start services
echo "Building and starting services..."
docker compose up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check if services are running
echo "Checking service status..."
if docker compose ps | grep -q "Up"; then
    echo "✅ Services are running"
else
    echo "❌ Some services failed to start"
    docker compose logs
    exit 1
fi

# Health check
echo "Performing health check..."
sleep 5

# Check backend health
if curl -f http://localhost:8000/health >/dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -f http://localhost:80 >/dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

echo ""
echo "=== Local Development Environment Ready! ==="
echo ""
echo "Application URLs:"
echo "Frontend: http://localhost"
echo "Backend API: http://localhost:8000"
echo "Backend Docs: http://localhost:8000/docs"
echo "Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "View logs: docker compose logs -f"
echo "Stop services: docker compose down"
echo "Rebuild: docker compose up --build"
echo "View status: docker compose ps"