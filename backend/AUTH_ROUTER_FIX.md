# Fix: Auth Endpoints Not Showing

## Problem
Auth endpoints are not appearing in `/docs` because the server is not using the virtual environment where dependencies are installed.

## Solution: Restart Server with Venv

### Step 1: Stop Current Server
Press `Ctrl+C` in the terminal running uvicorn.

### Step 2: Restart with Virtual Environment

**Option A: Using venv Python directly**
```powershell
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

**Option B: Activate venv first, then run**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Step 3: Verify Auth Router Loads
When the server starts, you should see:
```
✓ Auth router imported successfully
✓ Auth router included successfully
```

If you see error messages instead, check the console output.

### Step 4: Check API Docs
Visit `http://localhost:8000/docs` and you should now see:
- POST `/auth/send-otp`
- POST `/auth/verify-otp`
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/me`

## Why This Happens
The dependencies (python-jose, resend, bcrypt) are installed in the virtual environment (`backend/venv`), but if you run `uvicorn` with the system Python instead of the venv Python, it can't find those packages.

## Quick Test
To verify venv has the packages:
```powershell
cd backend
.\venv\Scripts\python.exe -c "import jose; print('python-jose OK')"
```

If this works, use the venv Python to run the server!

