import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Login from '../pages/Login';
import Register from '../pages/Register';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleLogin = async (formData) => {
    setLoading(true);
    setMessage(''); // Clear previous messages
    
    try {
      console.log('🚀 Attempting login...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📡 Login response:', data);

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login successful');
        showMessage('Login successful!', 'success');
        
        // Call success callback with user data
        onAuthSuccess(data.user);
      } else {
        console.error('❌ Login failed:', data);
        showMessage(data.detail || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setLoading(true);
    setMessage(''); // Clear previous messages
    
    try {
      console.log('🚀 Attempting registration...');
      
      // Validate form data
      if (!formData.fullName || !formData.email || !formData.password) {
        showMessage('Please fill in all required fields.', 'error');
        return;
      }

      if (formData.password.length < 6) {
        showMessage('Password must be at least 6 characters long.', 'error');
        return;
      }

      const registrationData = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log('📡 Registration response:', data);

      if (response.ok) {
        console.log('✅ Registration successful');
        showMessage('Registration successful! Please sign in with your credentials.', 'success');
        setIsLogin(true); // Switch to login form
      } else {
        console.error('❌ Registration failed:', data);
        
        // Handle specific error cases
        if (data.detail && data.detail.includes('already registered')) {
          showMessage('This email is already registered. Please try logging in instead.', 'error');
        } else if (data.detail && data.detail.includes('Email already registered')) {
          showMessage('This email is already registered. Please try logging in instead.', 'error');
        } else {
          showMessage(data.detail || 'Registration failed. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg border ${
            messageType === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
            messageType === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
            'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {messageType === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {messageType === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                {messageType === 'info' && <AlertCircle className="h-5 w-5 text-blue-500" />}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{message}</p>
              </div>
              <button
                onClick={() => setMessage('')}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auth Forms */}
      {isLogin ? (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsLogin(false)}
          loading={loading}
        />
      ) : (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsLogin(true)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Auth;