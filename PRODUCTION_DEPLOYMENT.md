# EYE-dentify Production Deployment

## Production URLs

- **Frontend**: `https://eye-dentify.vercel.app`
- **Backend**: `https://eye-dentify.onrender.com`
- **API Docs**: `https://eye-dentify.onrender.com/docs`
- **ReDoc**: `https://eye-dentify.onrender.com/redoc`

## Architecture

```
Frontend (Vercel)
    ↓
Backend (Render) → MongoDB Atlas
    ↓
Cloudinary (Images)
```

## Backend Deployment (Render)

### Setup
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables
```env
MONGO_URI=mongodb+srv://...
DATABASE_NAME=eye_dentify
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SECRET_KEY=your_secret_key
ALLOWED_ORIGINS=https://eye-dentify.vercel.app,https://eye-dentify.vercel.app/
ENVIRONMENT=production
```

### Health Check
- Endpoint: `/health`
- Interval: 30 seconds

## Frontend Deployment (Vercel)

### Setup
1. Connect GitHub repository
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`

### Environment Variables
```env
REACT_APP_API_URL=https://eye-dentify.onrender.com
REACT_APP_API_VERSION=v1
REACT_APP_ENVIRONMENT=production
```

## Database (MongoDB Atlas)

### Setup
1. Create cluster
2. Configure network access (whitelist IPs)
3. Create database user
4. Get connection string
5. Update `MONGO_URI` in backend

## Cloudinary Setup

1. Create account
2. Get cloud name, API key, API secret
3. Update backend environment variables

## SSL/HTTPS

- **Vercel**: Automatic SSL certificates
- **Render**: Automatic SSL certificates

## Monitoring

### Health Checks
- Frontend: `https://eye-dentify.vercel.app`
- Backend: `https://eye-dentify.onrender.com/health`
- API Status: `https://eye-dentify.onrender.com/api/v1/status`

### Logs
- **Vercel**: Dashboard → Logs
- **Render**: Dashboard → Logs

## Updates

### Backend
1. Push to GitHub
2. Render auto-deploys
3. Monitor logs

### Frontend
1. Push to GitHub
2. Vercel auto-deploys
3. Monitor logs

## Backup

### Database
- MongoDB Atlas automatic backups
- Manual backup: `mongodump --uri="..." --out=./backup`

### Application
- GitHub repository is the source of truth
- Environment variables stored in deployment platforms

## Performance

### Backend
- Gunicorn workers: 4
- Rate limiting: 60 req/min
- File upload: 10MB max

### Frontend
- Static assets cached
- Gzip compression
- CDN via Vercel

## Security

### Backend
- JWT authentication
- CORS configured
- Security headers
- Rate limiting
- Input validation

### Frontend
- HTTPS only
- Environment variables for API URL
- Error boundaries

## Troubleshooting

### Backend Issues
1. Check Render logs
2. Verify environment variables
3. Test health endpoint
4. Check MongoDB connection

### Frontend Issues
1. Check Vercel logs
2. Verify API URL
3. Test API connectivity
4. Check browser console

---

**Production**: `https://eye-dentify.vercel.app` | `https://eye-dentify.onrender.com`
