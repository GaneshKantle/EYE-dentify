import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  shortLabel: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse }) => {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { path: '/', icon: '🏠', label: 'Dashboard', shortLabel: '🏠' },
    { path: '/add-face', icon: '👤', label: 'Add Suspect', shortLabel: '👤' },
    { path: '/recognize', icon: '🔍', label: 'Recognize', shortLabel: '🔍' },
    { path: '/gallery', icon: '📋', label: 'Gallery', shortLabel: '📋' },
    { path: '/sketch', icon: '✏️', label: 'Create Sketch', shortLabel: '✏️' },
    { path: '/about', icon: 'ℹ️', label: 'About', shortLabel: 'ℹ️' }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-slate-200 z-50 transition-all duration-300 ease-in-out ${
      isCollapsed 
        ? 'w-16 lg:w-20' 
        : 'w-64 lg:w-72 xl:w-80'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className={`font-bold text-lg transition-all duration-300 ${
            isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isCollapsed ? '👁️' : "EYE'dentify"}
            </span>
          </div>
          <button 
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-600 hover:text-slate-900"
            onClick={toggleCollapse}
          >
            <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${
              location.pathname === item.path 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            } ${isCollapsed ? 'justify-center' : 'justify-start'}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className={`text-xl ${isCollapsed ? '' : 'mr-3'}`}>{item.icon}</span>
            <span className={`font-medium transition-all duration-300 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>
              {isCollapsed ? item.shortLabel : item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className={`text-center p-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium transition-all duration-300 ${
          isCollapsed ? 'text-xs' : ''
        }`}>
          {isCollapsed ? '🔬' : 'Forensic Lab'}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
