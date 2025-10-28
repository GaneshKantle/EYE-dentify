import { Shield, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/badge';

const Header = () => {
  const { user } = useAuthStore();

  return (
    <>
      {/* Hero Section with Full-Width Header Image */}
      <div className="relative w-full">
        {/* Full-Width Header Image - Super Responsive */}
        <div className="w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh] xl:h-[75vh] 2xl:h-[80vh] flex items-center justify-center overflow-hidden">
          <img 
            src="https://res.cloudinary.com/dqkhdusc4/image/upload/v1761245722/1761245640400_1_p2stqx.png"
            alt="Forensic Investigation Header"
            className="w-full h-full object-cover object-center"
            style={{
              minHeight: '300px',
              maxHeight: '100vh'
            }}
          />
        </div>
        
        {/* Content Section - Centered and Responsive */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-8 sm:py-12 lg:py-16 xl:py-20 2xl:py-24">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
            {/* Professional Header */}
            <div className="inline-flex items-center space-x-3 bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-yellow-50/90 backdrop-blur-sm border border-amber-200 rounded-lg px-6 py-3 mb-6 shadow-sm">
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-gray-700 font-medium">Forensic Investigation System</span>
              <Badge variant="outline" className="border-red-300 text-red-600">v2.0</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold mb-4 sm:mb-6 text-gray-800 leading-tight">
              Forensic
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-gray-600 mb-6 sm:mb-8 tracking-wide">
              Investigation Center
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-gray-500 mb-6 sm:mb-8">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="text-sm sm:text-base">Officer: {user?.username || 'Unknown'}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-400 rounded-full" />
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm sm:text-base">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl sm:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto leading-relaxed px-4">
              Advanced forensic face recognition and sketch creation tools for law enforcement professionals. 
              Access cutting-edge technology to solve cases faster and more accurately.
            </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Header;