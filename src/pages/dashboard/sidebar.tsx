/*eslint-disable*/
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Scan, 
  PenTool, 
  Database, 
  Home, 
  User, 
  UserPlus,
  Shield,
  BarChart3,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayout } from '../../components/layout/Layout';
import { apiClient } from '../../lib/api';
import { useState, useEffect } from 'react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  matchPaths?: string[];
}

const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    path: '/', 
    icon: Home, 
    description: 'Overview & Analytics' 
  },
  { 
    name: 'Face Recognition', 
    path: '/recognize', 
    icon: Scan, 
    description: 'Identify suspects' 
  },
  { 
    name: 'Make Sketch', 
    path: '/sketches/recent', 
    icon: PenTool, 
    description: 'Create facial sketches',
    matchPaths: ['/sketches/recent', '/sketch']
  },
  { 
    name: 'Criminal Database', 
    path: '/gallery', 
    icon: Database, 
    description: 'Manage records' 
  },
  { 
    name: 'Add Criminals', 
    path: '/add', 
    icon: User, 
    description: 'Add new criminals' 
  },
  { 
    name: 'About', 
    path: '/about', 
    icon: Shield, 
    description: 'System information' 
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isSidebarOpen, setIsSidebarOpen } = useLayout();
  const [faces, setFaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch faces data for stats
  useEffect(() => {
    const fetchFaces = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.directGet<{faces: any[]}>('/gallery');
          setFaces(data.faces || []);
      } catch (error) {
        console.log('Could not fetch faces data');
        // Set default data for demo
        setFaces([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFaces();
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  // Refresh data when sidebar opens
  useEffect(() => {
    if (isSidebarOpen) {
      const fetchFaces = async () => {
        setIsLoading(true);
        try {
          const data = await apiClient.directGet<{faces: any[]}>('/gallery');
            setFaces(data.faces || []);
        } catch (error) {
          console.log('Could not fetch faces data');
          setFaces([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchFaces();
    }
  }, [isSidebarOpen]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gradient-to-br from-amber-50/95 via-orange-50/95 to-yellow-50/95 backdrop-blur-sm border-r border-amber-200/50 shadow-lg z-50 overflow-y-auto"
          >
            <div className="p-4">
              {/* Header Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-2.5 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-800">Investigation</h2>
                    <p className="text-xs text-gray-600">Navigation Center</p>
                  </div>
                </div>
                <div className="w-14 h-[3px] bg-gradient-to-r from-red-500 to-amber-500 rounded-full" />
              </div>
              
              {/* Navigation Items */}
              <nav className="space-y-1.5 mb-6">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const matches = item.matchPaths && item.matchPaths.length > 0
                    ? item.matchPaths
                    : [item.path];
                  const isActive = matches.includes(location.pathname);
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 text-left group ${
                        isActive
                          ? 'bg-gradient-to-r from-red-100/80 to-amber-100/80 text-red-700 border border-red-200/50 shadow-lg transform scale-[1.02]'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-100/50 hover:to-orange-100/50 hover:text-red-600 hover:border hover:border-amber-200/50 hover:shadow-md hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                          : 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:from-red-500 group-hover:to-red-600 group-hover:text-white group-hover:shadow-lg'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs mb-0.5">{item.name}</p>
                        <p className="text-[11px] text-gray-500 group-hover:text-gray-600">{item.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </nav>


              {/* User Profile Section */}
              {/* <div className="pt-6 border-t border-amber-200/50">
                <div className="flex items-center space-x-3 px-4 py-4 bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-xl border border-amber-200/50 shadow-sm">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate mb-1">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user?.email}
                    </p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      <span className="text-xs text-green-600 font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
