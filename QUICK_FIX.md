# Quick Fix Guide - Ports and Auth Endpoints

## Issue 1: Frontend Opening on Port 8000 Instead of 5000

**Solution:**
1. Stop the frontend server (Ctrl+C)
2. Clear webpack cache:
   ```bash
   Remove-Item -Recurse -Force node_modules\.cache
   ```
3. Restart frontend:
   ```bash
   npm start
   ```
4. Manually navigate to `http://localhost:5000` (don't rely on auto-open)

**Note:** The `craco.config.js` is now configured for port 5000 in CommonJS format.

## Issue 2: Auth Endpoints Returning 404

**Root Cause:** Backend server was started BEFORE dependencies were installed.

**Solution:**
1. **Stop the backend server** (Ctrl+C in the terminal running uvicorn)
2. **Restart the backend server:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

After restart, the auth endpoints should appear at `http://localhost:8000/docs`

## Verification Steps

### Backend (Port 8000)
1. Visit `http://localhost:8000/docs`
2. You should see `/auth` endpoints listed:
   - POST `/auth/send-otp`
   - POST `/auth/verify-otp`
   - POST `/auth/register`
   - POST `/auth/login`
   - POST `/auth/logout`
   - GET `/auth/me`

### Frontend (Port 5000)
1. Open browser to `http://localhost:5000`
2. Should see login/register page
3. Try registering a new account

## Test Auth Endpoint
```bash
curl -X POST "http://localhost:8000/auth/send-otp" -H "Content-Type: application/json" -d "{\"email\": \"test@example.com\"}"
```

Should return:
```json
{
  "status": "ok",
  "message": "OTP sent successfully to your email",
  "expires_in_minutes": 10
}
```

## Summary

✅ Dependencies installed  
✅ Port configuration updated  
✅ CORS configured for port 5000  
⏸️ **Action Required:** Restart both servers!

**Backend:** `uvicorn main:app --reload`  
**Frontend:** `npm start`

