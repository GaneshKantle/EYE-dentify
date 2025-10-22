/*eslint-disable*/
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, 
  UserPlus, 
  Users, 
  Trash2, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Database,
  LogOut,
  Menu,
  Bell
} from 'lucide-react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import CriminalDatabase from './pages/CriminalDatabase';
import RegisterTab from './pages/registerface.js';
import RecognizeTab from './pages/recognizeface.js';
import ManageTab from './pages/managefaces.js';
import HelpPage from './pages/HelpPage';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check for existing authentication on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchFaces = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/faces`);
      setFaces(response.data);
    } catch (error) {
      showMessage('Failed to fetch faces', 'error');
    }
  }, []);

  useEffect(() => {
    fetchFaces();
  }, [fetchFaces]);

  // CORRECTED: UploadThing Integration for File Upload
  const uploadFileToUploadThing = async (file) => {
    try {
      console.log('🚀 Uploading file to UploadThing:', file.name);
      
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout for large files
      });
      
      console.log('✅ UploadThing response:', response.data);
      
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        return response.data.data[0]; // Return the first uploaded file URL
      } else {
        throw new Error('No file URL returned from UploadThing');
      }
    } catch (error) {
      console.error('❌ UploadThing upload error:', error);
      throw new Error(`File upload failed: ${error.response?.data?.detail || error.message}`);
    }
  };

  // CORRECTED: Handle Registration with UploadThing
  const handleRegister = async (formData) => {
    setLoading(true);
    try {
      console.log('🚀 Starting registration process...');
      console.log('📁 File to upload:', formData.file);
      
      let imageUrl = '';
      
      // Upload file to UploadThing first
      if (formData.file) {
        console.log('📤 Uploading file to UploadThing...');
        const uploadResult = await uploadFileToUploadThing(formData.file);
        imageUrl = uploadResult.url || uploadResult;
        console.log('✅ File uploaded successfully. URL:', imageUrl);
      } else {
        throw new Error('No file provided for upload');
      }
      
      // Now register the criminal with the image URL
      console.log('📝 Registering criminal with image URL...');
      const registrationData = {
        name: formData.name,
        fullName: formData.full_name,
        age: formData.age,
        gender: formData.gender,
        crime: formData.crime,
        description: formData.description,
        status: formData.status,
        image_url: imageUrl
      };
      
      console.log('📋 Registration data:', registrationData);
      
      const response = await axios.post(`${API_BASE_URL}/api/register`, registrationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('✅ Registration response:', response.data);
      showMessage(response.data.message || 'Criminal registered successfully', 'success');
      fetchFaces();
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      showMessage(error.message || error.response?.data?.detail || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecognize = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/api/recognize`, formData);
      
      // Show message based on result
      if (response.data.recognized) {
        showMessage(`Recognized: ${response.data.best_name} (Score: ${(response.data.best_score * 100).toFixed(1)}%)`, 'success');
      } else {
        showMessage('Face not recognized', 'warning');
      }
      
      // Return the result for the component to use
      return response.data;
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Recognition failed', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFace = async (name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/delete/${name}`);
      showMessage(`${name} deleted successfully`, 'success');
      fetchFaces();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear the entire database? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/clear`);
      showMessage('Database cleared successfully', 'success');
      fetchFaces();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Clear failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show authentication if not logged in
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          faces={faces} 
          user={user}
          onLogout={handleLogout}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />
      </div>
      
      {/* Main Content with Sidebar Offset */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} lg:ml-64`}>
        {/* Fixed Top Navbar */}
        <nav className="fixed top-0 right-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20 transition-all duration-300" style={{left: sidebarCollapsed ? '64px' : '256px'}}>
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {activeTab === 'dashboard' ? 'Dashboard' :
               activeTab === 'register' ? 'Register Face' :
               activeTab === 'recognize' ? 'Recognize Face' :
               activeTab === 'manage' ? 'Manage Faces' :
               activeTab === 'database' ? 'Criminal Database' :
               activeTab === 'help' ? 'Help & Guide' : 'Face Recognition System'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto" style={{marginTop: '73px'}}>
          {/* Message */}
          {message && (
            <div className="p-4">
              <div className={`p-4 rounded-md ${
                messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                messageType === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <div className="flex items-center">
                  {messageType === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                  {messageType === 'error' && <XCircle className="h-5 w-5 mr-2" />}
                  {messageType === 'warning' && <AlertCircle className="h-5 w-5 mr-2" />}
                  <span>{message}</span>
                </div>
              </div>
            </div>
          )}

          <main className="p-4 lg:p-8">
            {activeTab === 'dashboard' && (
              <Dashboard faces={faces || []} />
            )}
            {activeTab === 'register' && (
              <RegisterTab onRegister={handleRegister} loading={loading} />
            )}
            {activeTab === 'recognize' && (
              <RecognizeTab onRecognize={handleRecognize} loading={loading} />
            )}
            {activeTab === 'manage' && (
              <ManageTab 
                faces={faces} 
                onDelete={handleDeleteFace} 
                onClear={handleClearDatabase}
                loading={loading}
              />
            )}
            {activeTab === 'database' && (
              <CriminalDatabase />
            )}
            {activeTab === 'help' && (
              <HelpPage />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;