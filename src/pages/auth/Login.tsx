import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../lib/api';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const Login: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Email validation helper - memoized
  const isValidEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Health check before login
  const checkBackendHealth = useCallback(async (): Promise<boolean> => {
    setIsCheckingHealth(true);
    try {
      const health = await apiClient.healthCheck();
      return health.healthy;
    } catch {
      return false;
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Password is required');
      return;
    }

    if (formData.password.length < 1) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    setLoading(true);

    try {
      // Check backend health before login (with timeout handling)
      const isHealthy = await checkBackendHealth();
      if (!isHealthy) {
        // Health check failed but proceed anyway (graceful degradation)
        // The retry logic in apiClient.login will handle cold starts
      }

      const { token, user } = await apiClient.login(formData.email.trim(), formData.password);
      apiClient.setAuthToken(token);
      setAuth(user, token);
      navigate('/');
    } catch (err: any) {
      // Better error handling with specific messages
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err?.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err?.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a moment and try again.';
      } else if (err?.response?.status === 503) {
        errorMessage = 'Server is starting up. Please wait a moment and try again.';
      } else if (err?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [formData, isValidEmail, checkBackendHealth, setAuth, setLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-2 sm:p-4">
      <Card className="w-full max-w-md shadow-xl border-0 mx-auto">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            Sign in to Eye-Dentify Forensic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || isCheckingHealth) && (
              <>
                {isCheckingHealth && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Waking up server... Please wait
                  </div>
                )}
                {error && !isCheckingHealth && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
              </>
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
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    setError('');
                  }}
                  required
                  className="pl-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading || isCheckingHealth}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, password: e.target.value }));
                    setError('');
                  }}
                  required
                  className="pl-10 pr-10 h-11 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  disabled={isLoading || isCheckingHealth}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full min-h-[44px] bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isCheckingHealth}
            >
              {isLoading || isCheckingHealth ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isCheckingHealth ? 'Checking server...' : 'Signing in...'}
                </span>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 pt-2">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
});

Login.displayName = 'Login';

export default Login;
