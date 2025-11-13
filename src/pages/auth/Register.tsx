/*eslint-disable*/
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { mojoAuthService } from '../../lib/mojoauth';
import { Eye, EyeOff, Lock, Mail, User, Key } from 'lucide-react';

// OTP-related code commented out for future reference
// type Step = 'form' | 'otp';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  // OTP step state commented out - registration is now single-step
  // const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  // OTP-related state variables commented out
  // const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // OTP state variables commented out
  // const [otpSent, setOtpSent] = useState(false);
  // const [otpVerified, setOtpVerified] = useState(false);

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePassword = (password: string): { valid: boolean; message: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true, message: '' };
  };

  // Username validation
  const validateUsername = (username: string): { valid: boolean; message: string } => {
    if (username.length < 3) {
      return { valid: false, message: 'Username must be at least 3 characters' };
    }
    if (username.length > 20) {
      return { valid: false, message: 'Username must be less than 20 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
    }
    return { valid: true, message: '' };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Comprehensive validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.message);
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.secretKey) {
      setError('Registration secret key is required');
      return;
    }

    if (formData.secretKey !== 'Eyedentify@#25') {
      setError('Invalid registration secret key');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // Initiate MojoAuth OTP flow
      const mojoAuthResponse = await mojoAuthService.initiateOTP(formData.email);
      
      // Navigate to OTP verification page with registration data
      navigate('/register/verify-otp', {
        state: {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          secretKey: formData.secretKey,
          stateId: mojoAuthResponse.state_id,
        },
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send verification code. Please try again.';
      setError(errorMessage);
      setIsLoading(false);
      setLoading(false);
    }
  };

  // OTP verification functions commented out for future reference
  /*
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      await apiClient.verifyOtp(formData.email, otp);
      setOtpVerified(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otpVerified) {
      setError('Please verify OTP first');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      const { token, user } = await apiClient.register(
        formData.email,
        formData.username,
        formData.password,
        formData.secretKey,
        otp
      );
      apiClient.setAuthToken(token);
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await apiClient.sendOtp(formData.email);
      setOtpSent(true);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Register for Eye-Dentify Forensic System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError('');
                  }}
                  required
                  className="pl-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username (3-20 characters)"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setError('');
                  }}
                  required
                  className="pl-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                  minLength={3}
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-gray-500">Letters, numbers, and underscores only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError('');
                  }}
                  required
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setError('');
                  }}
                  required
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secretKey" className="text-gray-700 font-medium">Registration Secret Key</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="secretKey"
                  type="password"
                  placeholder="Enter registration secret key"
                  value={formData.secretKey}
                  onChange={(e) => {
                    setFormData({ ...formData, secretKey: e.target.value });
                    setError('');
                  }}
                  required
                  className="pl-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Only authorized personnel can register
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Sign in here
              </Link>
            </div>
          </form>

          {/* OTP verification UI commented out - registration is now single-step */}
          {/*
          {step === 'otp' ? (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {otpSent && !otpVerified && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                  OTP sent to {formData.email}
                </div>
              )}

              {otpVerified && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Email verified successfully!
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      setError('');
                    }}
                    maxLength={6}
                    className="pl-10 text-center text-2xl tracking-widest font-mono"
                    disabled={otpVerified}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Check your email for the verification code
                </p>
              </div>

              <div className="flex gap-2">
                {!otpVerified ? (
                  <>
                    <Button
                      onClick={handleVerifyOtp}
                      className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Resend
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Complete Registration'}
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                  setOtpVerified(false);
                  setOtpSent(false);
                  setError('');
                }}
                className="w-full"
              >
                Back to Form
              </Button>
            </div>
          ) : null
          */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
