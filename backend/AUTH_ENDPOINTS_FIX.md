# Auth Endpoints Not Showing - Quick Fix Guide

## Issue
The `/auth/*` endpoints are not appearing in the FastAPI documentation at `http://localhost:8000/docs`

## Root Cause
The auth router fails to load when dependencies are missing (`python-jose`, `resend`, `bcrypt`), preventing route registration.

## Solution

### Step 1: Install Missing Dependencies
```bash
cd backend
pip install python-jose[cryptography] resend bcrypt python-dotenv
```

OR install all requirements:
```bash
pip install -r requirements.txt
```

### Step 2: Restart FastAPI Server
**IMPORTANT:** You MUST restart the server for changes to take effect.

1. Stop the current server (Ctrl+C in the terminal running uvicorn)
2. Start it again:
   ```bash
   uvicorn main:app --reload
   ```

### Step 3: Verify Auth Endpoints
After restarting, visit `http://localhost:8000/docs` and you should see:

- ✅ POST `/auth/send-otp` - Send OTP to email
- ✅ POST `/auth/verify-otp` - Verify OTP code  
- ✅ POST `/auth/register` - Register new user
- ✅ POST `/auth/login` - Login with email/password
- ✅ POST `/auth/logout` - Logout
- ✅ GET `/auth/me` - Get current user info

## Verification Test
Test the send-otp endpoint:
```bash
curl -X POST "http://localhost:8000/auth/send-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Should return:
```json
{
  "status": "ok",
  "message": "OTP sent successfully to your email",
  "expires_in_minutes": 10
}
```

## Troubleshooting

If endpoints still don't appear:
1. Check server logs for import errors
2. Verify all dependencies are installed: `pip list | grep -E "jose|resend|bcrypt"`
3. Check that `backend/routes/auth.py` exists and is properly formatted
4. Verify `backend/main.py` includes: `app.include_router(auth_router)`

