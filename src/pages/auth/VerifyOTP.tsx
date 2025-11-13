import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api';
import { mojoAuthService } from '../../lib/mojoauth';
import { useNotifications } from '../../contexts/NotificationContext';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

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
  
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [stateId, setStateId] = useState('');
  const [registrationData, setRegistrationData] = useState<Omit<LocationState, 'stateId'> | null>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);

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

    // Focus OTP input
    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 100);
  }, [location, navigate]);

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError('');
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!registrationData || !stateId) {
      setError('Registration data missing. Please start over.');
      navigate('/register', { replace: true });
      return;
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

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail || err?.message || 'OTP verification failed. Please try again.';
      setError(errorMessage);
      showError('Verification Failed', errorMessage);
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
      setOtp('');
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Verify Your Email</CardTitle>
          <CardDescription className="text-gray-600">
            Enter the verification code sent to your email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Email Display */}
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">Verification code sent to</p>
              <p className="text-sm sm:text-base font-medium text-gray-700 break-all">{email}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label htmlFor="otp" className="text-sm font-medium text-gray-700 sr-only">
                Verification Code
              </label>
              <Input
                ref={otpInputRef}
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOTPChange}
                maxLength={6}
                className="text-center text-2xl sm:text-3xl tracking-widest font-mono h-16 sm:h-20 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                Check your email for the verification code
              </p>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerifyOTP}
              className="w-full h-11 sm:h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Verifying...
                </span>
              ) : (
                'Verify Code'
              )}
            </Button>

            {/* Resend OTP */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || isLoading}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Resending...' : "Didn't receive code? Resend"}
              </button>
            </div>

            {/* Back Button */}
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              className="w-full text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;

