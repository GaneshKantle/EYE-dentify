# Face Recognition Dashboard - Production Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Face Recognition Dashboard to production. The system consists of a React frontend, FastAPI backend, MongoDB database, and Cloudinary for image storage.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   Redis         │    │   Cloudinary    │
│   (Reverse      │    │   (Cache)       │    │   (Images)      │
│   Proxy)        │    │   Port: 6379    │    │   (External)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **curl**: For health checks

### External Services
- **MongoDB Atlas** account (or self-hosted MongoDB)
- **Cloudinary** account for image storage
- **Domain name** (optional, for SSL)

## Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd face-recognition-dashboard
```

### 2. Configure Environment
```bash
# Copy environment template
cp env.production.example .env

# Edit configuration
nano .env
```

### 3. Deploy with Docker
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 4. Verify Deployment
```bash
# Check service status
./deploy.sh status

# View logs
./deploy.sh logs
```

## Detailed Configuration

### Environment Variables

#### Backend Configuration
```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=face_recognition_db

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Security
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_ORIGINS=https://yourdomain.com

# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
DEBUG=false
```

#### Frontend Configuration
```bash
# API Connection
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_REPORTING=true
```

### Database Setup

#### MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create new cluster
3. Configure network access (whitelist your server IP)
4. Create database user
5. Get connection string
6. Update `MONGO_URI` in `.env`

#### Self-hosted MongoDB
```bash
# Add to docker-compose.production.yml
mongodb:
  image: mongo:7
  container_name: face-recognition-mongodb
  restart: unless-stopped
  ports:
    - "27017:27017"
  environment:
    - MONGO_INITDB_ROOT_USERNAME=admin
    - MONGO_INITDB_ROOT_PASSWORD=password
  volumes:
    - mongodb_data:/data/db
```

### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name, API key, and API secret
3. Update environment variables
4. Configure upload presets (optional)

## Security Configuration

### SSL/TLS Setup
1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `./ssl/` directory
3. Update nginx configuration
4. Uncomment HTTPS server block in `nginx-proxy.conf`

### Firewall Configuration
```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### Security Headers
The application includes comprehensive security headers:
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff
- Content-Security-Policy
- Strict-Transport-Security (HTTPS)

## Monitoring and Logging

### Health Checks
- **Frontend**: `http://localhost:3000/health`
- **Backend**: `http://localhost:8000/health`
- **API Status**: `http://localhost:8000/api/v1/status`

### Log Locations
- **Application logs**: `./backend/logs/app.log`
- **Nginx logs**: Docker container logs
- **Docker logs**: `docker-compose logs -f`

### Monitoring Commands
```bash
# View all logs
docker-compose -f docker-compose.production.yml logs -f

# View specific service logs
docker-compose -f docker-compose.production.yml logs -f backend

# Check resource usage
docker stats

# Check service status
docker-compose -f docker-compose.production.yml ps
```

## Performance Optimization

### Backend Optimization
- **Workers**: Configured for 4 Gunicorn workers
- **Caching**: Redis for session and data caching
- **Rate Limiting**: 60 requests/minute per IP
- **File Upload**: 10MB limit with optimized processing

### Frontend Optimization
- **Build**: Production-optimized React build
- **Caching**: Static assets cached for 1 year
- **Compression**: Gzip compression enabled
- **CDN**: Ready for CDN integration

### Database Optimization
- **Indexes**: Ensure proper MongoDB indexes
- **Connection Pooling**: Configured in application
- **Backup**: Regular automated backups recommended

## Backup and Recovery

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://..." --out=./backups/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="./backups/$DATE"
tar -czf "./backups/$DATE.tar.gz" "./backups/$DATE"
rm -rf "./backups/$DATE"
```

### Application Backup
```bash
# Backup configuration and uploads
tar -czf "app-backup-$(date +%Y%m%d).tar.gz" \
  .env \
  backend/uploads/ \
  backend/logs/
```

### Recovery Process
1. Restore database from backup
2. Restore application files
3. Update environment variables
4. Restart services

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service-name

# Check configuration
docker-compose config

# Restart service
docker-compose restart service-name
```

#### Database Connection Issues
1. Verify MongoDB URI format
2. Check network connectivity
3. Verify credentials
4. Check firewall rules

#### File Upload Issues
1. Check file size limits
2. Verify Cloudinary configuration
3. Check disk space
4. Review upload logs

#### Performance Issues
1. Monitor resource usage: `docker stats`
2. Check database performance
3. Review application logs
4. Consider scaling resources

### Debug Mode
```bash
# Enable debug mode
export DEBUG=true
export LOG_LEVEL=DEBUG

# Restart services
docker-compose restart
```

## Scaling

### Horizontal Scaling
```yaml
# Scale backend services
docker-compose -f docker-compose.production.yml up -d --scale backend=3
```

### Load Balancer Configuration
```nginx
upstream backend {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}
```

### Database Scaling
- **Read Replicas**: Configure MongoDB read preferences
- **Sharding**: For very large datasets
- **Connection Pooling**: Optimize connection limits

## Maintenance

### Regular Tasks
- **Updates**: Keep Docker images updated
- **Backups**: Daily database backups
- **Log Rotation**: Configure log rotation
- **Security**: Regular security updates
- **Monitoring**: Check health endpoints

### Update Process
```bash
# Pull latest changes
git pull origin main

# Rebuild images
docker-compose -f docker-compose.production.yml build

# Restart services
docker-compose -f docker-compose.production.yml up -d
```

## Support

### Getting Help
1. Check logs first
2. Review this documentation
3. Check GitHub issues
4. Contact support team

### Useful Commands
```bash
# Quick status check
./deploy.sh status

# View logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Stop services
./deploy.sh stop

# Cleanup
./deploy.sh cleanup
```

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Note**: This is a production-ready deployment guide. Always test in a staging environment before deploying to production.
