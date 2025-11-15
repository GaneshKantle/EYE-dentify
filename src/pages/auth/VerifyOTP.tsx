import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api';
import { mojoAuthService } from '../../lib/mojoauth';
import { useNotifications } from '../../contexts/NotificationContext';
import { ArrowLeft } from 'lucide-react';
import { OTPVerification } from '../../components/ui/otp-input';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://eye-dentify.onrender.com';
  }
  return 'http://localhost:8000';
};

interface LocationState {
  email: string;
  username: string;
  password: string;
  secretKey: string;
  stateId: string;
}

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setLoading } = useAuthStore();
  const { success, error: showError } = useNotifications();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [stateId, setStateId] = useState('');
  const [registrationData, setRegistrationData] = useState<Omit<LocationState, 'stateId'> | null>(null);

  useEffect(() => {
    // Get data from location state
    const state = location.state as LocationState;
    
    if (!state || !state.email || !state.stateId) {
      // Redirect back to register if no data
      navigate('/register', { replace: true });
      return;
    }

    setEmail(state.email);
    setStateId(state.stateId);
    setRegistrationData({
      email: state.email,
      username: state.username,
      password: state.password,
      secretKey: state.secretKey,
    });
  }, [location, navigate]);

  const handleVerifyOTP = async (otp: string) => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }

    if (!registrationData || !stateId) {
      setError('Registration data missing. Please start over.');
      navigate('/register', { replace: true });
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      // First verify OTP with MojoAuth
      const verifyResponse = await fetch(`${getApiBaseUrl()}/auth/verify-mojoauth-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state_id: stateId, otp }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Invalid OTP code');
      }

      // OTP verified, now register user
      const { token, user } = await apiClient.registerWithMojoAuth(
        registrationData.email,
        registrationData.username,
        registrationData.password,
        registrationData.secretKey,
        stateId
      );

      apiClient.setAuthToken(token);
      setAuth(user, token);

      // Show success toast
      success('Registration Successful', 'Your account has been created successfully!');

      // Navigate to dashboard after short delay with showWelcome flag
      setTimeout(() => {
        navigate('/', { replace: true, state: { showWelcome: true } });
      }, 500);
      return true;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      showError('Verification Failed', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError('Email not found. Please start over.');
      navigate('/register', { replace: true });
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const response = await mojoAuthService.initiateOTP(email);
      setStateId(response.state_id);
      success('OTP Resent', 'A new verification code has been sent to your email.');
      setError('');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
      showError('Resend Failed', errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigate('/register', { replace: true });
  };

  if (!email || !registrationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {/* OTP Verification Component */}
        <OTPVerification
          email={email}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          isLoading={isLoading || isResending}
          error={error}
        />

        {/* Back Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          className="w-full max-w-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default VerifyOTP;

