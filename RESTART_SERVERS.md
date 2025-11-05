# IMPORTANT: Restart Backend Server

The dependencies are installed, but the backend server needs to be restarted to load the auth router.

## Steps to Fix:

1. **Stop the current backend server** (Press Ctrl+C in the terminal running uvicorn)

2. **Make sure you're using the virtual environment** (if you have one):
   ```powershell
   cd backend
   .\venv\Scripts\activate.ps1  # Activate venv
   ```

3. **Install dependencies in venv** (if not already done):
   ```powershell
   pip install python-jose[cryptography] resend bcrypt python-dotenv
   ```

4. **Restart backend server**:
   ```powershell
   uvicorn main:app --reload
   ```

5. **Verify auth endpoints**:
   - Visit `http://localhost:8000/docs`
   - You should see `/auth` endpoints listed

## For Frontend Port Issue:

1. Stop frontend (Ctrl+C)
2. Clear cache:
   ```powershell
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```
3. Restart:
   ```powershell
   npm start
   ```
4. Manually navigate to `http://localhost:5000`

