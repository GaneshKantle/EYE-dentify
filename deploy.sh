#!/bin/bash

# Production Deployment Script for Face Recognition Dashboard
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="face-recognition-dashboard"
BACKEND_DIR="backend"
FRONTEND_DIR="."
DOCKER_COMPOSE_FILE="docker-compose.production.yml"
ENV_FILE=".env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env file not found. Please copy env.production.example to .env and configure it."
        exit 1
    fi
    
    log_success "All requirements met"
}

validate_environment() {
    log_info "Validating environment configuration..."
    
    # Check required environment variables
    required_vars=(
        "MONGO_URI"
        "CLOUDINARY_CLOUD_NAME"
        "CLOUDINARY_API_KEY"
        "CLOUDINARY_API_SECRET"
        "SECRET_KEY"
        "ALLOWED_ORIGINS"
    )
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE" || grep -q "^${var}=$" "$ENV_FILE" || grep -q "^${var}=your-" "$ENV_FILE"; then
            log_error "Environment variable $var is not properly configured in .env file"
            exit 1
        fi
    done
    
    log_success "Environment configuration validated"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build backend image
    log_info "Building backend image..."
    docker build -f "$BACKEND_DIR/Dockerfile.production" -t "$PROJECT_NAME-backend" "$BACKEND_DIR"
    
    # Build frontend image
    log_info "Building frontend image..."
    docker build -f "Dockerfile.production" -t "$PROJECT_NAME-frontend" .
    
    log_success "Docker images built successfully"
}

deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    # Start services
    log_info "Starting services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log_success "Services deployed successfully"
}

wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for backend
    log_info "Waiting for backend service..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health &> /dev/null; then
            log_success "Backend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "Backend service failed to start within 60 seconds"
        exit 1
    fi
    
    # Wait for frontend
    log_info "Waiting for frontend service..."
    timeout=30
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            log_success "Frontend service is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        log_warning "Frontend service may not be ready yet"
    fi
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    echo "Services:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
    echo ""
    echo "Access URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/docs"
    echo ""
    echo "Health Checks:"
    echo "  Frontend: http://localhost:3000/health"
    echo "  Backend: http://localhost:8000/health"
    echo ""
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting production deployment for $PROJECT_NAME"
    echo ""
    
    check_requirements
    validate_environment
    build_images
    deploy_services
    wait_for_services
    show_status
    
    log_success "Deployment completed successfully!"
    echo ""
    log_info "To view logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
    log_info "To stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
    log_info "To restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart"
}

# Handle script arguments
case "${1:-}" in
    "cleanup")
        cleanup
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
        ;;
    "stop")
        docker-compose -f "$DOCKER_COMPOSE_FILE" down
        ;;
    "restart")
        docker-compose -f "$DOCKER_COMPOSE_FILE" restart
        ;;
    *)
        main
        ;;
esac
