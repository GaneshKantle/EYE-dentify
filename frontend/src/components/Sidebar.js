/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { Camera, UserPlus, Users, Database, Menu, X, Home, LogOut, User, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, faces, user, onLogout, isCollapsed, setIsCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Auto-collapse on mobile, auto-expand on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsCollapsed]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, count: null },
    { id: 'register', label: 'Register Face', icon: UserPlus, count: null },
    { id: 'recognize', label: 'Recognize Face', icon: Camera, count: null },
    { id: 'manage', label: 'Manage Faces', icon: Users, count: faces.length },
    { id: 'database', label: 'Criminal Database', icon: Database, count: null },
    { id: 'help', label: 'Help & Guide', icon: HelpCircle, count: null }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-full bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-3' : ''}`}>
            {!isCollapsed ? (
              <>
                <h1 className="text-xl font-bold text-gray-900">Face Recognition</h1>
                <p className="text-sm text-gray-600">Criminal Database System</p>
              </>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FR</span>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button - Desktop Only */}
          <div className="hidden lg:block border-b border-gray-200">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 p-4 space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center rounded-lg text-left transition-all duration-200
                    ${isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-4 py-3'}
                    ${activeTab === item.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  title={isCollapsed ? item.label : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.count !== null && (
                    <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
            {!isCollapsed ? (
              <>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.full_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center px-2 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
            {!isCollapsed ? (
              <div className="text-xs text-gray-500 text-center">
                Face Recognition System v1.0
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">v1</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
