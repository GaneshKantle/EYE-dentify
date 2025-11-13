import os
import random
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

class EmailService:
    def __init__(self):
        # Load from environment variables - require RESEND_API_KEY
        self.api_key = os.getenv('RESEND_API_KEY')
        if not self.api_key:
            raise RuntimeError(
                "RESEND_API_KEY environment variable is required. "
                "Copy backend/env.example to backend/.env and set RESEND_API_KEY before starting the server."
            )
        self.from_email = os.getenv('RESEND_FROM_EMAIL', 'onboarding@resend.dev')
        
        # Initialize Resend - version 2.1.0 uses module-level API
        if RESEND_AVAILABLE:
            try:
                resend.api_key = self.api_key
                self.resend_available = True
            except Exception as e:
                print(f"Warning: Failed to initialize Resend: {e}")
                self.resend_available = False
        else:
            print("Warning: Resend library not available")
            self.resend_available = False
    
    def generate_otp(self) -> str:
        """Generate a random 6-digit OTP"""
        return str(random.randint(100000, 999999))
    
    def hash_otp(self, otp: str) -> str:
        """Hash OTP for secure storage"""
        return hashlib.sha256(otp.encode()).hexdigest()
    
    async def send_otp_email(self, email: str, otp: str) -> Dict[str, Any]:
        """Send OTP email to user"""
        if not self.resend_available:
            return {
                "success": False,
                "message": "Resend service not initialized"
            }
        
        # Resend testing limitation: In testing mode, can only send to verified email
        # For production, need to verify domain at resend.com/domains
        test_email = os.getenv('RESEND_TEST_EMAIL')
        if not test_email:
            raise RuntimeError(
                "RESEND_TEST_EMAIL environment variable is required. "
                "Set RESEND_TEST_EMAIL in your .env file."
            )
        is_production = os.getenv('RESEND_PRODUCTION', 'false').lower() == 'true'
        
        # In testing mode, check if email matches test email
        if not is_production:
            if email.lower() != test_email.lower():
                return {
                    "success": False,
                    "message": f"Resend Testing Mode: You can only send emails to your verified email address ({test_email}). To send to other emails, verify a domain at https://resend.com/domains and set RESEND_PRODUCTION=true in your .env file."
                }
        
        try:
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Eye-Dentify Forensic</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                    <h2 style="color: #333; margin-top: 0;">Email Verification Code</h2>
                    <p>Hello,</p>
                    <p>Your verification code for Eye-Dentify Forensic is:</p>
                    <div style="background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">{otp}</h1>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
                </div>
            </body>
            </html>
            """
            
            print(f"Attempting to send OTP email to: {email}")  # Debug log
            print(f"From email: {self.from_email}")  # Debug log
            
            # Resend SDK 2.1.0 uses module-level API: resend.Emails.send()
            response = resend.Emails.send({
                "from": self.from_email,
                "to": email,
                "subject": "Eye-Dentify Forensic - Email Verification Code",
                "html": html_content
            })
            
            print(f"Resend response: {response}")  # Debug log
            
            # Check response format
            if isinstance(response, dict):
                if "id" in response:
                    print(f"✓ Email sent successfully! Email ID: {response.get('id')}")  # Debug log
                    return {
                        "success": True,
                        "message": "OTP sent successfully",
                        "email_id": response.get("id")
                    }
                elif "error" in response:
                    error_msg = response.get("error", {}).get("message", "Unknown error")
                    print(f"✗ Resend API error: {error_msg}")  # Debug log
                    # Check if it's the testing email limitation
                    if "only send testing emails" in error_msg.lower() or "verify a domain" in error_msg.lower():
                        error_msg = f"Resend Testing Mode: {error_msg}. In testing mode, you can only send emails to your verified email address ({test_email}). For production, verify a domain at https://resend.com/domains"
                    return {
                        "success": False,
                        "message": f"Resend API error: {error_msg}"
                    }
            
            # If response is successful (might be None or other format)
            print(f"✓ Email sent (response format unclear): {response}")  # Debug log
            return {
                "success": True,
                "message": "OTP sent successfully",
                "email_id": None
            }
        except Exception as e:
            error_msg = str(e)
            print(f"✗ Error sending email via Resend: {error_msg}")  # Debug log
            import traceback
            traceback.print_exc()
            
            # Check if it's the testing email limitation
            if "only send testing emails" in error_msg.lower() or "verify a domain" in error_msg.lower():
                error_msg = f"Resend Testing Mode: {error_msg}. In testing mode, you can only send emails to your verified email address ({test_email}). For production, verify a domain at https://resend.com/domains"
            
            return {
                "success": False,
                "message": f"Failed to send email: {error_msg}"
            }

