/*eslint-disable*/
import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Command, 
  Users, 
  Camera, 
  Database, 
  Shield, 
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code,
  Settings,
  Lock,
  Eye,
  Search,
  Upload,
  Download,
  Trash2,
  Edit,
  Plus,
  Minus
} from 'lucide-react';

const HelpPage = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const helpSections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            The Face Recognition Criminal Database System is an advanced AI-powered platform designed for law enforcement and security agencies. 
            It provides comprehensive facial recognition capabilities, criminal database management, and real-time monitoring tools.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-500" />
                Security Features
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• End-to-end encryption</li>
                <li>• Role-based access control</li>
                <li>• Audit trail logging</li>
                <li>• Secure data transmission</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h4 className="font-semibold text-white mb-2 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                AI Capabilities
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 99.7% recognition accuracy</li>
                <li>• Real-time processing</li>
                <li>• Multi-face detection</li>
                <li>• Age and gender estimation</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Command,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h4 className="font-semibold text-white mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              Quick Start Guide
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h5 className="font-medium text-white">Register a New Criminal</h5>
                  <p className="text-sm text-gray-300">Go to "Register Face" and upload a clear photo with criminal details</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h5 className="font-medium text-white">Recognize Faces</h5>
                  <p className="text-sm text-gray-300">Use "Recognize Face" to identify suspects from uploaded images</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h5 className="font-medium text-white">Manage Database</h5>
                  <p className="text-sm text-gray-300">View, edit, or delete records in "Criminal Database"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'System Features',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Camera className="h-6 w-6 text-blue-500 mr-2" />
                <h4 className="font-semibold text-white">Face Recognition</h4>
              </div>
              <p className="text-sm text-gray-300">Advanced AI-powered facial recognition with 99.7% accuracy for identifying suspects and criminals.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Database className="h-6 w-6 text-green-500 mr-2" />
                <h4 className="font-semibold text-white">Criminal Database</h4>
              </div>
              <p className="text-sm text-gray-300">Comprehensive database storing criminal profiles, case details, and investigation records.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Search className="h-6 w-6 text-purple-500 mr-2" />
                <h4 className="font-semibold text-white">Advanced Search</h4>
              </div>
              <p className="text-sm text-gray-300">Powerful search capabilities with filters for name, age, gender, crime type, and status.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Target className="h-6 w-6 text-red-500 mr-2" />
                <h4 className="font-semibold text-white">Real-time Monitoring</h4>
              </div>
              <p className="text-sm text-gray-300">Live activity feed and system status monitoring for operational awareness.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Shield className="h-6 w-6 text-yellow-500 mr-2" />
                <h4 className="font-semibold text-white">Security</h4>
              </div>
              <p className="text-sm text-gray-300">Enterprise-grade security with encryption, access controls, and audit logging.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center mb-3">
                <Zap className="h-6 w-6 text-cyan-500 mr-2" />
                <h4 className="font-semibold text-white">AI Processing</h4>
              </div>
              <p className="text-sm text-gray-300">Machine learning algorithms for facial analysis, age estimation, and pattern recognition.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'commands',
      title: 'Keyboard Shortcuts & Commands',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h4 className="font-semibold text-white mb-4">Keyboard Shortcuts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Navigate to Dashboard</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + D</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Register New Face</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + R</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Recognize Face</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + F</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Manage Database</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + M</kbd>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Toggle Sidebar</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + B</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Search Database</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Help & Guide</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + H</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Sign Out</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">Ctrl + Q</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h4 className="font-semibold text-white mb-4">Common Issues & Solutions</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h5 className="font-medium text-white mb-2">Recognition Accuracy Issues</h5>
                <p className="text-sm text-gray-300 mb-2">If face recognition is not working properly:</p>
                <ul className="text-sm text-gray-300 space-y-1 ml-4">
                  <li>• Ensure the image is clear and well-lit</li>
                  <li>• Face should be directly facing the camera</li>
                  <li>• Avoid blurry or low-resolution images</li>
                  <li>• Check if the person is already in the database</li>
                </ul>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h5 className="font-medium text-white mb-2">Upload Failures</h5>
                <p className="text-sm text-gray-300 mb-2">If image uploads are failing:</p>
                <ul className="text-sm text-gray-300 space-y-1 ml-4">
                  <li>• Check file format (JPG, PNG supported)</li>
                  <li>• Ensure file size is under 10MB</li>
                  <li>• Verify internet connection</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium text-white mb-2">Performance Issues</h5>
                <p className="text-sm text-gray-300 mb-2">If the system is running slowly:</p>
                <ul className="text-sm text-gray-300 space-y-1 ml-4">
                  <li>• Clear browser cache and cookies</li>
                  <li>• Close unnecessary browser tabs</li>
                  <li>• Check system requirements</li>
                  <li>• Contact system administrator</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: ExternalLink,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
            <h4 className="font-semibold text-white mb-4">REST API Endpoints</h4>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono mr-2">POST</span>
                  <code className="text-blue-400 font-mono">/api/register</code>
                </div>
                <p className="text-sm text-gray-300">Register a new criminal face with details</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono mr-2">GET</span>
                  <code className="text-blue-400 font-mono">/api/faces</code>
                </div>
                <p className="text-sm text-gray-300">Retrieve all criminal records</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-mono mr-2">POST</span>
                  <code className="text-blue-400 font-mono">/api/recognize</code>
                </div>
                <p className="text-sm text-gray-300">Recognize a face from uploaded image</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-mono mr-2">DELETE</span>
                  <code className="text-blue-400 font-mono">/api/faces/{id}</code>
                </div>
                <p className="text-sm text-gray-300">Delete a specific criminal record</p>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="px-4 lg:px-8 py-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">Help & Guide</h1>
              <p className="text-gray-300">Comprehensive documentation and support for the Face Recognition System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-6">
            {helpSections.map((section, index) => {
              const Icon = section.icon;
              const isExpanded = expandedSections[section.id];
              
              return (
                <div key={section.id || index} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Icon className="h-6 w-6 text-blue-400 mr-3" />
                      <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gray-700/50">
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 border border-blue-500/30">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Need More Help?</h3>
              <p className="text-gray-300 mb-6">
                If you can't find what you're looking for, our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Contact Support
                </button>
                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
