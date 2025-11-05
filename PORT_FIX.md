# Port Configuration - Quick Fix

## Issue
Frontend opens on port 8000 instead of 5000.

## Solution

### Step 1: Fix Auth Endpoints (404 Error)
The auth endpoints are returning 404 because dependencies aren't installed:

```bash
cd backend
pip install python-jose[cryptography] resend bcrypt python-dotenv
```

**Then restart the backend server.**

### Step 2: Verify Frontend Port
The `craco.config.js` has been updated to use CommonJS format (required by craco).

**Restart the frontend**:
1. Stop current frontend (Ctrl+C)
2. Clear cache: `npm start` or delete `node_modules/.cache`
3. Start again: `npm start`

The frontend should now start on `http://localhost:5000`

### Step 3: Clear Browser Cache
If browser still opens port 8000:
1. Clear browser cache
2. Try incognito/private window
3. Manually navigate to `http://localhost:5000`

### Verification
- Frontend: `http://localhost:5000` ✅
- Backend: `http://localhost:8000` ✅
- API Docs: `http://localhost:8000/docs` should show auth endpoints ✅

