/*eslint-disable*/
import { useNavigate } from 'react-router-dom';
import { Scan, PenTool, Database, ArrowRight, Shield, FileText, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import Header from './pages/dashboard/Header';
import { Footer } from './pages/dashboard/Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
  color: string;
}

  const features: FeatureCard[] = [
    {
      id: 'face-recognition',
      title: 'Face Recognition',
      description: 'Upload a sketch or photo to find matches in our database',
    icon: Scan,
      path: '/recognize',
    color: 'primary',
    },
    {
      id: 'make-sketch',
      title: 'Make Sketch',
      description: 'Create detailed facial sketches using our digital tools',
    icon: PenTool,
      path: '/sketch',
    color: 'secondary',
  },
  // {
  //   id: 'criminal-database',
  //   title: 'Criminal Database',
  //   description: 'Manage criminal records and facial data',
  //   icon: Database,
  //   path: '/gallery',
  //   color: 'success',
  // },
  // {
  //   id: 'about-system',
  //   title: 'About System',
  //   description: 'Learn about our forensic investigation technology',
  //   icon: Shield,
  //   path: '/about',
  //   color: 'info',
  // },
  {
    id: 'add-criminal',
    title: 'Add Criminals',
    description: 'Add new suspects to the forensic database',
    icon: UserPlus,
    path: '/add',
    color: 'warning',
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [faces, setFaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get('http://localhost:8000/gallery');
        if (!isMounted) return;
        setFaces(res.data?.faces || []);
      } catch (e) {
        console.error('Failed to load stats:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalRecords = faces.length;
  const totalImages = faces.reduce((sum, f) => sum + (f.image_urls?.length || 0), 0);
  const uniqueCrimes = Array.from(new Set((faces || []).map((f) => (f.crime || '').trim()).filter(Boolean))).length;

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 relative overflow-hidden">

      {/* Background Pattern - Subtle Investigation Board Effect */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,69,19,0.03)_0%,transparent_50%),linear-gradient(45deg,transparent_40%,rgba(239,68,68,0.02)_50%,transparent_60%)] bg-[length:100%_100%,100%_100%,200px_200px]" />
      </div>

      {/* Subtle Border Accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-10" />

      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <div className="relative z-10 px-2 sm:px-3 md:px-5 lg:px-7 xl:px-9 2xl:px-12 3xl:px-14 py-3 sm:py-5 md:py-8 lg:py-10 xl:py-12 2xl:py-14 3xl:py-16">
        <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl 3xl:max-w-[120rem] mx-auto">
          {/* Main Tools Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-5 xs:mb-7 sm:mb-9 md:mb-11 lg:mb-12 xl:mb-14"
          >
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Investigation Tools</h3>
              <div className="w-14 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-red-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10 px-0 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10 3xl:px-12">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="group"
                  >
                    <Card 
                      className="bg-white backdrop-blur-sm border-amber-100 hover:border-red-300 transition-all duration-300 cursor-pointer group-hover:scale-[1.02] h-full shadow-sm hover:shadow-md rounded-xl xs:rounded-2xl sm:rounded-2xl max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-3xl mx-auto"
                      onClick={() => handleFeatureClick(feature.path)}
                    >
                      {/* Investigation Board Pin Effect */}
                      <div className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 w-1.5 xs:w-2 h-1.5 xs:h-2 bg-red-500 rounded-full shadow-sm" />
                      
                      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5">
                        <div className="flex flex-col h-full">
                          {/* Icon with Professional Style */}
                          <div className="mb-3 xs:mb-3 sm:mb-4 md:mb-5">
                            <div className={`
                              w-9 xs:w-10 sm:w-12 md:w-14 h-9 xs:h-10 sm:h-12 md:h-14 rounded-full flex items-center justify-center text-white mb-2 xs:mb-2 sm:mb-3 relative
                              ${feature.color === 'primary' ? 'bg-gradient-to-br from-red-500 to-red-600' : ''}
                              ${feature.color === 'secondary' ? 'bg-gradient-to-br from-amber-500 to-amber-600' : ''}
                              ${feature.color === 'success' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                              ${feature.color === 'info' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                              ${feature.color === 'warning' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : ''}
                              group-hover:shadow-lg transition-shadow
                            `}>
                              <Icon className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7" />
              </div>
            </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-sm xs:text-base sm:text-lg md:text-lg font-bold text-gray-800 mb-2 xs:mb-2 group-hover:text-red-600 transition-colors">
                              {feature.title}
                            </h3>
                            <p className="text-xs xs:text-sm sm:text-sm text-gray-600 mb-3 xs:mb-3 sm:mb-4 md:mb-5 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between pt-2 xs:pt-3 sm:pt-3 border-t border-amber-200">
                            <Button
                              variant="ghost"
                              className="p-0 h-auto text-red-600 hover:text-red-700 hover:bg-transparent transition-colors group-hover:translate-x-1 text-xs xs:text-sm"
                            >
                              Access Tool
                              <ArrowRight className="w-3 xs:w-4 h-3 xs:h-4 ml-1 xs:ml-1" />
                            </Button>
                            <Badge variant="outline" className="border-amber-300 text-amber-700 text-[10px] xs:text-xs">
                              Available
                            </Badge>
              </div>
            </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Stats Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-5 xs:mb-7 sm:mb-9 md:mb-10 lg:mb-12 xl:mb-14"
          >
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">System Statistics</h3>
              <div className="w-14 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-red-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-6 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10">
              {/* Total Records */}
              <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5">
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 xs:mb-2">
                  {loading ? '—' : totalRecords}
                </div>
                <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Total Records</div>
              </Card>

              {/* Total Images */}
              <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5">
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 mb-1 xs:mb-2">
                  {loading ? '—' : totalImages}
                </div>
                <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Total Images</div>
              </Card>

              {/* Crime Categories */}
              <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5">
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-1 xs:mb-2">
                  {loading ? '—' : uniqueCrimes}
                </div>
                <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Crime Categories</div>
              </Card>

              {/* Database Status */}
              <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5">
                <div className="text-lg xs:text-xl sm:text-1xl md:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 xs:mb-2">
                  {loading ? '—' : 'Online'}
                </div>
                <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Database Status</div>
              </Card>

              {/* System Uptime */}
              <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5">
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 xs:mb-2">
                  {loading ? '—' : '99.9%'}
                </div>
                <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">System Uptime</div>
              </Card>
              
            </div>
          </motion.div>

          {/* System Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16"
          >
            {/* System Status */}
            <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl">
              <CardHeader className="p-3 xs:p-4 sm:p-5 md:p-6">
                <CardTitle className="text-gray-800 flex items-center space-x-2 text-sm xs:text-base sm:text-lg">
                  <Shield className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 pt-0">
                <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                  {[
                    { name: 'Face Recognition Engine', status: 'Online' },
                    { name: 'Database Connection', status: 'Online' },
                    { name: 'Sketch Builder', status: 'Online' },
                    { name: 'Backup Systems', status: 'Online' }
                  ].map((system, index) => (
                    <div key={system.name} className="flex items-center justify-between">
                      <span className="text-gray-700 text-xs xs:text-sm sm:text-base">{system.name}</span>
                      <div className="flex items-center space-x-1 xs:space-x-2">
                        <div className="w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full bg-green-500" />
                        <span className="text-green-600 text-xs xs:text-sm font-medium">{system.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-2 xs:my-3 sm:my-4" />
                
                <div className="text-center">
                  <p className="text-green-600 font-semibold text-xs xs:text-sm sm:text-base">All Systems Operational</p>
                  <p className="text-gray-500 text-xs xs:text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl">
              <CardHeader className="p-3 xs:p-4 sm:p-5 md:p-6">
                <CardTitle className="text-gray-800 flex items-center space-x-2 text-sm xs:text-base sm:text-lg">
                  <FileText className="w-4 xs:w-5 h-4 xs:h-5 text-amber-600" />
                  <span>Quick Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 pt-0">
                <div className="space-y-2 xs:space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-black-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-amber-50 text-xs xs:text-sm h-8 xs:h-9 sm:h-10"
                    onClick={() => navigate('/recognize')}
                  >
                    <Scan className="w-3 xs:w-4 h-3 xs:h-4 mr-1 xs:mr-2" />
                    Start Face Recognition
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-black-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-amber-50 text-xs xs:text-sm h-8 xs:h-9 sm:h-10"
                    onClick={() => navigate('/sketch')}
                  >
                    <PenTool className="w-3 xs:w-4 h-3 xs:h-4 mr-1 xs:mr-2" />
                    Create New Sketch
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-black-200 text-gray-700 hover:border-red-300 hover:text-red-600 hover:bg-amber-50 text-xs xs:text-sm h-8 xs:h-9 sm:h-10"
                    onClick={() => navigate('/gallery')}
                  >
                    <Database className="w-3 xs:w-4 h-3 xs:h-4 mr-1 xs:mr-2" />
                    View Database
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer Component */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;