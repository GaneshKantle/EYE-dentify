# Production Deployment Guide

This guide covers deploying the Face Recognition Dashboard to production using **Render** for the backend and **Vercel** for the frontend.

## Prerequisites

- GitHub repository with your code
- MongoDB Atlas account with a database
- Render account
- Vercel account

## Backend Deployment (Render)

### 1. Prepare Environment Variables

Before deploying, you'll need to set up these environment variables in Render:

- `MONGO_URI`: Your MongoDB Atlas connection string
- `DATABASE_NAME`: Database name (default: `face_recognition_db`)
- `COLLECTION_NAME`: Collection name (default: `faces`)
- `RECOGNITION_THRESHOLD`: Face recognition threshold (default: `0.50`)
- `REJECTION_THRESHOLD`: Face rejection threshold (default: `0.3`)
- `ENVIRONMENT`: Set to `production`
- `DEBUG`: Set to `False`
- `ALLOWED_ORIGINS`: Your frontend domains (comma-separated)

### 2. Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new **Web Service**
3. Configure the service:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Python 3.11
4. Add all environment variables in the Render dashboard
5. Deploy the service

### 3. Update CORS Settings

After deployment, update the `ALLOWED_ORIGINS` environment variable in Render to include your Vercel frontend URL.

## Frontend Deployment (Vercel)

### 1. Prepare Environment Variables

Set up these environment variables in Vercel:

- `REACT_APP_API_URL`: Your Render backend URL (e.g., `https://your-app-name.onrender.com`)

### 2. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the project:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. Add the `REACT_APP_API_URL` environment variable
4. Deploy

### 3. Update Backend CORS

After Vercel deployment, update the `ALLOWED_ORIGINS` in your Render backend to include your Vercel domain.

## Security Considerations

### Backend Security

- ✅ Environment variables for sensitive data
- ✅ CORS configuration for production domains
- ✅ Health check endpoint for monitoring
- ✅ Proper error handling and logging
- ✅ MongoDB connection with proper error handling

### Frontend Security

- ✅ Environment variables for API URLs
- ✅ No hardcoded credentials
- ✅ Production build optimization

## Monitoring and Maintenance

### Health Checks

- Backend health endpoint: `https://your-backend-url.onrender.com/health`
- Monitor database connectivity
- Check application logs in Render dashboard

### Performance Optimization

- Consider adding Redis for caching
- Implement rate limiting for API endpoints
- Monitor memory usage for face recognition operations
- Set up database connection pooling

## Environment Variables Summary

### Backend (Render)
```
MONGO_URI=mongodb+srv://...
DATABASE_NAME=face_recognition_db
COLLECTION_NAME=faces
RECOGNITION_THRESHOLD=0.50
REJECTION_THRESHOLD=0.3
ENVIRONMENT=production
DEBUG=False
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `ALLOWED_ORIGINS` includes your frontend domain
2. **Database Connection**: Verify MongoDB URI and network access
3. **Build Failures**: Check Python/Node.js versions and dependencies
4. **Memory Issues**: Monitor resource usage in Render dashboard

### Logs and Debugging

- Backend logs: Available in Render dashboard
- Frontend logs: Available in Vercel dashboard
- Database logs: Check MongoDB Atlas logs

## Post-Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] Face recognition functionality tested
- [ ] Error handling working properly
