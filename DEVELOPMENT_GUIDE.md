# Face Recognition Dashboard - Development Guide

## Project Structure

```
face-recognition-dashboard/
├── backend/                    # FastAPI backend
│   ├── config.py              # Configuration management
│   ├── main_production.py     # Production server
│   ├── requirements.txt       # Python dependencies
│   ├── Dockerfile.production  # Production Docker image
│   ├── docker-compose.production.yml
│   ├── nginx.conf            # Nginx configuration
│   ├── models/               # Data models
│   │   ├── asset.py
│   │   └── schemas.py
│   ├── routes/               # API routes
│   │   └── assets.py
│   ├── services/             # Business logic
│   │   └── cloudinary_service.py
│   ├── middleware/           # Custom middleware
│   │   └── security.py
│   ├── utils/                # Utility functions
│   │   └── error_handler.py
│   └── logs/                 # Application logs
├── src/                      # React frontend
│   ├── components/           # React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── layout/
│   │   ├── ui/
│   │   └── facesketch/
│   ├── contexts/             # React contexts
│   │   ├── LoadingContext.tsx
│   │   └── NotificationContext.tsx
│   ├── lib/                  # Utility libraries
│   │   └── api.ts
│   ├── types/                # TypeScript types
│   ├── App.tsx
│   └── index.tsx
├── public/                   # Static assets
├── docker-compose.production.yml
├── Dockerfile.production
├── nginx-proxy.conf
├── deploy.sh                # Deployment script
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Server**: Uvicorn + Gunicorn
- **Database**: MongoDB (Atlas/self-hosted)
- **ML**: PyTorch + FaceNet
- **Storage**: Cloudinary
- **Cache**: Redis
- **Proxy**: Nginx

### Frontend
- **Framework**: React 19.2.0
- **Language**: TypeScript 4.9.5
- **Styling**: Tailwind CSS 3.4.18
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Build Tool**: CRACO

### DevOps
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: Gunicorn
- **Monitoring**: Health checks + logging
- **Deployment**: Automated scripts

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

### Backend Development

#### 1. Setup Python Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

#### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your configuration
```

#### 3. Run Development Server
```bash
python main_production.py
# or
uvicorn main_production:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your configuration
```

#### 3. Run Development Server
```bash
npm start
```

### Full Stack Development

#### Using Docker Compose
```bash
# Development with hot reload
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Code Standards

### Python (Backend)
- **Formatter**: Black
- **Linter**: Flake8
- **Type Checker**: MyPy
- **Import Sorter**: isort

```bash
# Format code
black .

# Lint code
flake8 .

# Type check
mypy .

# Sort imports
isort .
```

### TypeScript/React (Frontend)
- **Formatter**: Prettier
- **Linter**: ESLint
- **Type Checker**: TypeScript

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Code Style Guidelines

#### Python
- Use type hints for all functions
- Follow PEP 8 style guide
- Use descriptive variable names
- Add docstrings for all functions/classes
- Use async/await for I/O operations

#### TypeScript/React
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript interfaces for props
- Follow React best practices
- Use custom hooks for reusable logic

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
python -m pytest tests/ --cov=. --cov-report=html
```

### Frontend Testing
```bash
npm test
npm run test:coverage
```

### Integration Testing
```bash
# Run full stack tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## API Development

### Adding New Endpoints

#### 1. Create Route File
```python
# routes/new_feature.py
from fastapi import APIRouter, HTTPException
from models.schemas import NewFeatureRequest, NewFeatureResponse

router = APIRouter(prefix="/new-feature", tags=["new-feature"])

@router.post("/", response_model=NewFeatureResponse)
async def create_new_feature(request: NewFeatureRequest):
    try:
        # Implementation
        return NewFeatureResponse(...)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 2. Add to Main App
```python
# main_production.py
from routes.new_feature import router as new_feature_router

app.include_router(new_feature_router, prefix="/api/v1")
```

#### 3. Create Pydantic Models
```python
# models/schemas.py
class NewFeatureRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class NewFeatureResponse(BaseModel):
    id: str
    name: str
    created_at: datetime
```

### Database Operations

#### MongoDB Operations
```python
from pymongo import MongoClient
from config import settings

client = MongoClient(settings.mongo_uri)
db = client[settings.database_name]

# Insert document
result = db.collection.insert_one(document)

# Find documents
documents = list(db.collection.find(query))

# Update document
result = db.collection.update_one(filter, update)

# Delete document
result = db.collection.delete_one(filter)
```

## Frontend Development

### Adding New Components

#### 1. Create Component
```typescript
// components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
        Action
      </button>
    </div>
  );
};
```

#### 2. Add to App
```typescript
// App.tsx
import { NewComponent } from './components/NewComponent';

// Use in routes
<Route path="/new-feature" element={<NewComponent />} />
```

### API Integration

#### Using API Client
```typescript
import { apiClient } from './lib/api';

// GET request
const data = await apiClient.get('/api/v1/endpoint');

// POST request
const result = await apiClient.post('/api/v1/endpoint', { data });

// File upload
const response = await apiClient.uploadFile('/api/v1/upload', file, { name: 'test' });
```

### State Management

#### Using Context
```typescript
// contexts/NewContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface NewContextType {
  data: any[];
  setData: (data: any[]) => void;
}

const NewContext = createContext<NewContextType | undefined>(undefined);

export const useNewContext = () => {
  const context = useContext(NewContext);
  if (!context) {
    throw new Error('useNewContext must be used within NewProvider');
  }
  return context;
};
```

## Deployment

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment
```bash
# Deploy to production
./deploy.sh

# Check status
./deploy.sh status

# View logs
./deploy.sh logs
```

### Environment Management

#### Development
```bash
# .env.development
REACT_APP_API_URL=http://localhost:8000
REACT_APP_DEBUG=true
```

#### Production
```bash
# .env.production
REACT_APP_API_URL=https://yourdomain.com
REACT_APP_DEBUG=false
```

## Debugging

### Backend Debugging
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Use debugger
import pdb; pdb.set_trace()

# Check logs
tail -f logs/app.log
```

### Frontend Debugging
```typescript
// Use React DevTools
// Enable debug mode
console.log('Debug info:', data);

// Use error boundaries
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### Docker Debugging
```bash
# Enter container
docker exec -it container_name bash

# View container logs
docker logs container_name

# Check container status
docker ps
```

## Performance Optimization

### Backend Optimization
- Use connection pooling
- Implement caching with Redis
- Optimize database queries
- Use async/await properly
- Monitor memory usage

### Frontend Optimization
- Use React.memo for expensive components
- Implement code splitting
- Optimize bundle size
- Use lazy loading
- Implement proper caching

### Database Optimization
- Create proper indexes
- Use aggregation pipelines
- Optimize query patterns
- Monitor query performance
- Implement data archiving

## Security Considerations

### Backend Security
- Validate all inputs
- Use environment variables for secrets
- Implement rate limiting
- Add security headers
- Use HTTPS in production
- Regular security updates

### Frontend Security
- Sanitize user inputs
- Use HTTPS
- Implement CSP headers
- Validate file uploads
- Use secure authentication

## Monitoring and Logging

### Application Monitoring
```python
# Add custom metrics
from prometheus_client import Counter, Histogram

request_count = Counter('requests_total', 'Total requests')
request_duration = Histogram('request_duration_seconds', 'Request duration')
```

### Logging Configuration
```python
# Structured logging
import structlog

logger = structlog.get_logger()
logger.info("User action", user_id=user_id, action="login")
```

## Contributing

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Run linting/formatting
5. Commit changes
6. Create pull request
7. Code review
8. Merge to main

### Commit Messages
```
feat: add new face recognition endpoint
fix: resolve image upload issue
docs: update API documentation
test: add unit tests for face service
refactor: improve error handling
```

## Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [Docker Desktop](https://www.docker.com/products/docker-desktop) - Container management

---

This development guide provides comprehensive information for contributing to the Face Recognition Dashboard project. Follow these guidelines to maintain code quality and project consistency.
