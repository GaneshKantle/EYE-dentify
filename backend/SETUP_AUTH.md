# INSTALLATION INSTRUCTIONS
# =========================
# 
# To fix the 404 error on /auth/send-otp, you need to install missing dependencies:
#
# 1. Navigate to the backend directory:
#    cd backend
#
# 2. Install/update dependencies:
#    pip install python-jose[cryptography] resend bcrypt python-dotenv
#
#    OR install all requirements:
#    pip install -r requirements.txt
#
# 3. Restart the FastAPI server:
#    uvicorn main:app --reload
#
# VERIFICATION:
# =============
# After installing dependencies, verify the auth router loads correctly:
# - Check http://localhost:8000/docs - you should see /auth endpoints
# - Test POST /auth/send-otp with { "email": "test@example.com" }
#
# ENVIRONMENT VARIABLES:
# ======================
# Make sure backend/.env file exists with:
# - RESEND_API_KEY=your_resend_api_key_here
# - REGISTRATION_SECRET_KEY=your_registration_secret_key_here
# - JWT_SECRET_KEY=your_jwt_secret_key_here
#
# The .env file should already be created in the backend directory.

