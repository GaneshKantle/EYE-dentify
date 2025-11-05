import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api';
import { Eye, EyeOff, Lock, Mail, User, Key, Shield, CheckCircle2 } from 'lucide-react';

type Step = 'form' | 'otp';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    secretKey: ''
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (formData.secretKey !== 'Eyedentify@#25') {
      setError('Invalid registration secret key');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      await apiClient.sendOtp(formData.email);
      setOtpSent(true);
      setStep('otp');
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === 'form' ? 'Create Account' : 'Verify Email'}
          </CardTitle>
          <CardDescription>
            {step === 'form' 
              ? 'Register for Eye-Dentify Forensic' 
              : 'Enter the OTP sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'form' ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 8 characters)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secretKey">Registration Secret Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="secretKey"
                    type="password"
                    placeholder="Enter registration secret key"
                    value={formData.secretKey}
                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                    required
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only authorized personnel can register
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send Verification Code'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

