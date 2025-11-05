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
# - RESEND_API_KEY=re_dGRPT8mR_HaN7mPPwfy7oXNETssmVa3Un
# - REGISTRATION_SECRET_KEY=Eyedentify@#25
# - JWT_SECRET_KEY=your-secret-key-here
#
# The .env file should already be created in the backend directory.

