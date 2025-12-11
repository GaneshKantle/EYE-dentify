/*eslint-disable*/
import { useNavigate, useLocation } from 'react-router-dom';
import { Scan, PenTool, Database, ArrowRight, Shield, FileText, UserPlus, Target, Zap, Brain, Search, Cloud, Lock, Users, ChevronRight, Clock, TrendingUp, Activity, CheckCircle, AlertCircle, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import Header from './pages/dashboard/Header';
import { Footer } from './pages/dashboard/Footer';
import { useEffect, useState, useMemo, memo } from 'react';
import { apiClient } from './lib/api';
import { useAuthStore } from './store/authStore';
import { WelcomeModal } from './components/WelcomeModal';

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
      description: 'Upload sketches or photos to search our criminal database instantly',
      icon: Scan,
      path: '/recognize',
      color: 'primary',
    },
    {
      id: 'make-sketch',
      title: 'Create Sketch',
      description: 'Build detailed composite sketches using our digital forensic tools',
      icon: PenTool,
      path: '/sketch',
      color: 'secondary',
    },
    {
      id: 'add-criminal',
      title: 'Add Suspect',
      description: 'Record new suspect information and facial data to the database',
      icon: UserPlus,
      path: '/add',
      color: 'warning',
    },
    {
      id: 'criminal-database',
      title: 'Criminal Database',
      description: 'Browse, search, and manage all criminal records and cases',
      icon: Database,
      path: '/gallery',
      color: 'success',
    },
  ];

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [faces, setFaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [recentSketches, setRecentSketches] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await apiClient.directGet<{faces: any[]}>('/gallery');
        if (!isMounted) return;
        setFaces(res?.faces || []);
      } catch (e) {
        console.error('Failed to load gallery:', e);
      }
      try {
        const assetsRes = await apiClient.directGet<any[]>('/assets');
        if (!isMounted) return;
        setTotalAssets(Array.isArray(assetsRes) ? assetsRes.length : 0);
      } catch (e) {
        console.error('Failed to load assets:', e);
      }
      try {
        const sketchesRes = await apiClient.directGet<{sketches: any[]}>('/sketches');
        if (!isMounted) return;
        const sketches = sketchesRes?.sketches || [];
        const sorted = sketches.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
          const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setRecentSketches(sorted.slice(0, 5));
      } catch (e) {
        console.error('Failed to load sketches:', e);
      }
      if (isMounted) setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const locationState = location.state as { showWelcome?: boolean } | null;
    if (locationState?.showWelcome && user?.username) {
      const hasShown = localStorage.getItem('welcomeShown');
      if (!hasShown) {
        setShowWelcome(true);
      }
    }
  }, [location.state, user]);

  const totalRecords = useMemo(() => faces.length, [faces.length]);
  const totalImages = useMemo(() => faces.reduce((sum, f) => sum + (f.image_urls?.length || 0), 0), [faces]);
  const uniqueCrimes = useMemo(() => Array.from(new Set((faces || []).map((f) => (f.crime || '').trim()).filter(Boolean))).length, [faces]);

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-gray-800 relative overflow-hidden"
    >
      {user?.username && (
        <WelcomeModal
          open={showWelcome}
          onOpenChange={setShowWelcome}
          username={user.username}
        />
      )}

      {/* Background Pattern - Subtle Investigation Board Effect */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,69,19,0.03)_0%,transparent_50%),linear-gradient(45deg,transparent_40%,rgba(239,68,68,0.02)_50%,transparent_60%)] bg-[length:100%_100%,100%_100%,200px_200px]" />
      </div>

      {/* Subtle Border Accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-10" />

      {/* Header Component */}
      <Header />

      {/* Informational Section */}
      <div className="relative z-10 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2 xs:py-2.5 sm:py-3 md:py-4 lg:py-5 xl:py-6 2xl:py-7">
        <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90rem] mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch gap-2 xs:gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4 xl:gap-5">
            {/* What We Are */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="flex-1"
            >
              <Card className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-slate-50 border-2 border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-300 rounded-2xl xs:rounded-3xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 h-full relative overflow-hidden group">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="p-1.5 xs:p-2 sm:p-2.5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg xs:rounded-xl sm:rounded-xl shadow-sm"
                    >
                      <Target className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                    </motion.div>
                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800">What We Are</h3>
                </div>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed xs:leading-relaxed sm:leading-relaxed">
                A complete forensic identification platform designed for law enforcement. Create composite sketches, run facial searches, and manage suspect records — all in one place.
              </p>
                </div>
            </Card>
            </motion.div>

            {/* Flow Arrow 1 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center justify-center sm:flex-col sm:justify-center py-1.5 xs:py-2 sm:py-0 sm:px-0"
            >
              <motion.div
                animate={{ x: [0, 4, 0], y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-slate-400 rotate-90 sm:rotate-0" />
              </motion.div>
            </motion.div>

            {/* Problem We Solve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="flex-1"
            >
              <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-slate-50 border-2 border-emerald-200/60 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/50 transition-all duration-300 rounded-2xl xs:rounded-3xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 h-full relative overflow-hidden group">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="p-1.5 xs:p-2 sm:p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg xs:rounded-xl sm:rounded-xl shadow-sm"
                    >
                      <Zap className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                    </motion.div>
                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800">Problem We Solve</h3>
                </div>
                  <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed xs:leading-relaxed sm:leading-relaxed">
                Traditional identification methods are slow and error-prone. Our system reduces suspect identification time from days to minutes using automated facial recognition technology.
              </p>
                </div>
            </Card>
            </motion.div>

            {/* Flow Arrow 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center justify-center sm:flex-col sm:justify-center py-1.5 xs:py-2 sm:py-0 sm:px-0"
            >
              <motion.div
                animate={{ x: [0, 4, 0], y: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-slate-400 rotate-90 sm:rotate-0" />
              </motion.div>
            </motion.div>

            {/* What We Provide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="flex-1"
            >
              <Card className="bg-gradient-to-br from-indigo-50 via-indigo-50/80 to-slate-50 border-2 border-indigo-200/60 shadow-lg hover:shadow-2xl hover:shadow-indigo-200/50 transition-all duration-300 rounded-2xl xs:rounded-3xl sm:rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 h-full relative overflow-hidden group">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="p-1.5 xs:p-2 sm:p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg xs:rounded-xl sm:rounded-xl shadow-sm"
                    >
                      <Shield className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600" />
                    </motion.div>
                    <h3 className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800">What We Provide</h3>
                </div>
                  <div className="space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-2.5">
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5"
                    >
                      <Search className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600">Facial recognition across criminal databases</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5"
                    >
                      <PenTool className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600">Digital composite sketch creation tools</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5"
                    >
                      <Cloud className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-indigo-600 flex-shrink-0" />
                      <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600">Cloud-based case management system</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5"
                    >
                      <Brain className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-600 flex-shrink-0" />
                      <span className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-slate-600">Machine learning powered matching engine</span>
                    </motion.div>
                </div>
              </div>
            </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-2 sm:px-3 md:px-5 lg:px-7 xl:px-9 2xl:px-12 3xl:px-14 py-3 sm:py-5 md:py-8 lg:py-10 xl:py-12 2xl:py-14 3xl:py-16">
        <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-7xl 3xl:max-w-[120rem] mx-auto">
          {/* Stats Overview Section - Moved First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-5 xs:mb-7 sm:mb-9 md:mb-11 lg:mb-12 xl:mb-14"
          >
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">System Statistics</h3>
              <div className="w-14 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-red-500 mx-auto rounded-full" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 3xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-7 2xl:gap-8 3xl:gap-10"
            >
              {/* Total Records */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5 group cursor-default">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 xs:mb-2 group-hover:scale-110 transition-transform duration-300"
                  >
                    {loading ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto bg-slate-200 rounded animate-pulse" />
                    ) : (
                      totalRecords
                    )}
                  </motion.div>
                  <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Total Records</div>
                </Card>
              </motion.div>

              {/* Total Images */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300 rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5 group cursor-default">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-600 mb-1 xs:mb-2 group-hover:scale-110 transition-transform duration-300"
                  >
                    {loading ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto bg-slate-200 rounded animate-pulse" />
                    ) : (
                      totalImages
                    )}
                  </motion.div>
                  <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Total Images</div>
                </Card>
              </motion.div>

              {/* Crime Categories */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5 group cursor-default">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-1 xs:mb-2 group-hover:scale-110 transition-transform duration-300"
                  >
                    {loading ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto bg-slate-200 rounded animate-pulse" />
                    ) : (
                      uniqueCrimes
                    )}
                  </motion.div>
                  <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Crime Categories</div>
                </Card>
              </motion.div>

              {/* Total Assets */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300 rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5 group cursor-default">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600 mb-1 xs:mb-2 group-hover:scale-110 transition-transform duration-300"
                  >
                    {loading ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto bg-slate-200 rounded animate-pulse" />
                    ) : (
                      totalAssets
                    )}
                  </motion.div>
                  <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">Total Assets</div>
                </Card>
              </motion.div>

              {/* System Uptime */}
              <motion.div variants={itemVariants}>
                <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 rounded-xl xs:rounded-2xl sm:rounded-2xl text-center p-2 xs:p-3 sm:p-4 md:p-5 lg:p-5 group cursor-default">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-600 mb-1 xs:mb-2 group-hover:scale-110 transition-transform duration-300"
                  >
                    {loading ? (
                      <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 mx-auto bg-slate-200 rounded animate-pulse" />
                    ) : (
                      '99.9%'
                    )}
                  </motion.div>
                  <div className="text-xs xs:text-sm sm:text-base text-gray-600 font-medium">System Uptime</div>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Main Tools Section - 2x2 Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-5 xs:mb-7 sm:mb-9 md:mb-11 lg:mb-12 xl:mb-14"
          >
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">Investigation Tools</h3>
              <div className="w-14 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-red-500 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10 3xl:gap-12 px-0 xs:px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 2xl:px-10 3xl:px-12">
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
                    <motion.div
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Card 
                        className="bg-white backdrop-blur-sm border-amber-100 hover:border-red-300 transition-all duration-300 cursor-pointer h-full shadow-sm hover:shadow-xl rounded-xl xs:rounded-2xl sm:rounded-2xl max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-3xl mx-auto relative overflow-hidden group"
                        onClick={() => handleFeatureClick(feature.path)}
                      >
                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        
                        {/* Investigation Board Pin Effect */}
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 180 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-2 xs:top-3 sm:top-4 right-2 xs:right-3 sm:right-4 w-1.5 xs:w-2 h-1.5 xs:h-2 bg-red-500 rounded-full shadow-sm z-10"
                        />
                      
                      <CardContent className="p-2 xs:p-3 sm:p-4 md:p-5">
                        <div className="flex flex-col h-full">
                          {/* Icon with Professional Style */}
                          <div className="mb-3 xs:mb-3 sm:mb-4 md:mb-5">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 10 }}
                              className={`
                                w-9 xs:w-10 sm:w-12 md:w-14 h-9 xs:h-10 sm:h-12 md:h-14 rounded-full flex items-center justify-center text-white mb-2 xs:mb-2 sm:mb-3 relative
                                ${feature.color === 'primary' ? 'bg-gradient-to-br from-red-500 to-red-600' : ''}
                                ${feature.color === 'secondary' ? 'bg-gradient-to-br from-amber-500 to-amber-600' : ''}
                                ${feature.color === 'success' ? 'bg-gradient-to-br from-green-500 to-green-600' : ''}
                                ${feature.color === 'info' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : ''}
                                ${feature.color === 'warning' ? 'bg-gradient-to-br from-orange-500 to-orange-600' : ''}
                                group-hover:shadow-xl transition-all duration-300
                              `}
                            >
                              <Icon className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7" />
                            </motion.div>
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
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Workflow Guide Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-5 xs:mb-7 sm:mb-9 md:mb-11 lg:mb-12 xl:mb-14"
          >
            <div className="text-center mb-4 xs:mb-5 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">How It Works</h3>
              <div className="w-14 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-red-500 mx-auto rounded-full" />
            </div>

            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
              {/* Mobile/Tablet: Vertical Flow */}
              <div className="lg:hidden space-y-3 xs:space-y-4 sm:space-y-5">
                {/* Step 1: Create Sketch */}
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="flex items-start gap-3 xs:gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg shadow-md">
                    1
                  </div>
                  <div className="flex-1 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 xs:gap-3 mb-2">
                      <div className="p-1.5 xs:p-2 bg-blue-100 rounded-lg">
                        <PenTool className="w-4 h-4 xs:w-5 xs:h-5 text-blue-600" />
                      </div>
                      <h4 className="text-xs xs:text-sm sm:text-base font-bold text-gray-800">Create Sketch</h4>
                    </div>
                    <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Build composite sketch from witness description. Save to database for future searches.
                    </p>
                  </div>
                  </motion.div>

                {/* Arrow Down */}
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 xs:w-6 xs:h-6 text-slate-400" />
                </div>

                {/* Step 2: Search Database */}
                  <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-start gap-3 xs:gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg shadow-md">
                    2
                  </div>
                  <div className="flex-1 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-red-100">
                    <div className="flex items-center gap-2 xs:gap-3 mb-2">
                      <div className="p-1.5 xs:p-2 bg-red-100 rounded-lg">
                        <Scan className="w-4 h-4 xs:w-5 xs:h-5 text-red-600" />
                      </div>
                      <h4 className="text-xs xs:text-sm sm:text-base font-bold text-gray-800">Search Database</h4>
                    </div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Upload sketch or photo. AI extracts facial features and compares against criminal database.
                  </p>
                  </div>
                </motion.div>

                {/* Arrow Down */}
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 xs:w-6 xs:h-6 text-slate-400" />
                </div>

                {/* Conditional Branch */}
                <div className="space-y-3 xs:space-y-4">
                  {/* Match Found Path */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="flex items-start gap-3 xs:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg shadow-md">
                      ✓
                    </div>
                    <div className="flex-1 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-emerald-100">
                      <div className="flex items-center gap-2 xs:gap-3 mb-2">
                        <div className="p-1.5 xs:p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600" />
                        </div>
                        <h4 className="text-xs xs:text-sm sm:text-base font-bold text-gray-800">Match Found</h4>
                      </div>
                      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Review suspect details, similarity score, and case information.
                      </p>
                    </div>
                  </motion.div>

                  {/* No Match Path */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="flex items-start gap-3 xs:gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg shadow-md">
                      ✗
                    </div>
                    <div className="flex-1 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-amber-100">
                      <div className="flex items-center gap-2 xs:gap-3 mb-2">
                        <div className="p-1.5 xs:p-2 bg-amber-100 rounded-lg">
                          <AlertCircle className="w-4 h-4 xs:w-5 xs:h-5 text-amber-600" />
                        </div>
                        <h4 className="text-xs xs:text-sm sm:text-base font-bold text-gray-800">No Match</h4>
                      </div>
                      <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-relaxed">
                        Add new suspect to database with photo and case details.
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-5 h-5 xs:w-6 xs:h-6 text-slate-400" />
                </div>

                {/* Step 4: View in Database */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                  className="flex items-start gap-3 xs:gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm xs:text-base sm:text-lg shadow-md">
                    4
                  </div>
                  <div className="flex-1 bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 shadow-sm border border-indigo-100">
                    <div className="flex items-center gap-2 xs:gap-3 mb-2">
                      <div className="p-1.5 xs:p-2 bg-indigo-100 rounded-lg">
                        <Database className="w-4 h-4 xs:w-5 xs:h-5 text-indigo-600" />
                      </div>
                      <h4 className="text-xs xs:text-sm sm:text-base font-bold text-gray-800">View in Database</h4>
                    </div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Access, search, and manage all criminal records and cases.
                  </p>
                  </div>
                </motion.div>
              </div>

              {/* Desktop: Horizontal Flow with Conditional Branch */}
              <div className="hidden lg:block">
                <div className="flex flex-col items-center space-y-6 xl:space-y-8">
                  {/* Steps 1-2: Sequential */}
                  <div className="flex items-center gap-4 xl:gap-6 w-full max-w-5xl">
                    {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="flex-1 bg-white rounded-xl xl:rounded-2xl p-4 xl:p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-md">
                          1
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <PenTool className="w-5 h-5 xl:w-6 xl:h-6 text-blue-600" />
                        </div>
                        <h4 className="text-sm xl:text-base font-bold text-gray-800">Create Sketch</h4>
                      </div>
                      <p className="text-xs xl:text-sm text-gray-600 leading-relaxed">
                        Build composite sketch from witness description. Save to database for future searches.
                  </p>
                </motion.div>

                    {/* Arrow */}
                    <ChevronRight className="w-6 h-6 xl:w-8 xl:h-8 text-slate-400 flex-shrink-0" />

                    {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="flex-1 bg-white rounded-xl xl:rounded-2xl p-4 xl:p-5 shadow-sm border border-red-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-md">
                          2
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Scan className="w-5 h-5 xl:w-6 xl:h-6 text-red-600" />
                        </div>
                        <h4 className="text-sm xl:text-base font-bold text-gray-800">Search Database</h4>
                      </div>
                      <p className="text-xs xl:text-sm text-gray-600 leading-relaxed">
                        Upload sketch or photo. AI extracts facial features and compares against criminal database.
                      </p>
                  </motion.div>
                  </div>

                  {/* Arrow Down */}
                  <ArrowDown className="w-6 h-6 xl:w-8 xl:h-8 text-slate-400" />

                  {/* Conditional Branch: Match Found vs No Match */}
                  <div className="flex items-start gap-4 xl:gap-6 w-full max-w-5xl">
                    {/* Match Found Path */}
                <motion.div
                      initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      className="flex-1 bg-white rounded-xl xl:rounded-2xl p-4 xl:p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-md">
                          ✓
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 xl:w-6 xl:h-6 text-emerald-600" />
                        </div>
                        <h4 className="text-sm xl:text-base font-bold text-gray-800">Match Found</h4>
                      </div>
                      <p className="text-xs xl:text-sm text-gray-600 leading-relaxed">
                        Review suspect details, similarity score, and case information.
                      </p>
                </motion.div>

                    {/* Divider */}
                    <div className="text-slate-400 text-sm xl:text-base font-medium py-4">OR</div>

                    {/* No Match Path */}
                <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 }}
                      className="flex-1 bg-white rounded-xl xl:rounded-2xl p-4 xl:p-5 shadow-sm border border-amber-100 hover:shadow-md transition-shadow"
                >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-md">
                          ✗
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <AlertCircle className="w-5 h-5 xl:w-6 xl:h-6 text-amber-600" />
                        </div>
                        <h4 className="text-sm xl:text-base font-bold text-gray-800">No Match</h4>
                      </div>
                      <p className="text-xs xl:text-sm text-gray-600 leading-relaxed">
                        Add new suspect to database with photo and case details.
                      </p>
                  </motion.div>
                  </div>

                  {/* Arrow Down */}
                  <ArrowDown className="w-6 h-6 xl:w-8 xl:h-8 text-slate-400" />

                  {/* Step 4: Final Step */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="w-full max-w-md bg-white rounded-xl xl:rounded-2xl p-4 xl:p-5 shadow-sm border border-indigo-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base xl:text-lg shadow-md">
                        4
                      </div>
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Database className="w-5 h-5 xl:w-6 xl:h-6 text-indigo-600" />
                      </div>
                      <h4 className="text-sm xl:text-base font-bold text-gray-800">View in Database</h4>
                    </div>
                    <p className="text-xs xl:text-sm text-gray-600 leading-relaxed">
                      Access, search, and manage all criminal records and cases.
                  </p>
                </motion.div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity & System Overview Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16 mb-5 xs:mb-7 sm:mb-9 md:mb-11 lg:mb-12 xl:mb-14 w-full"
          >
            {/* Recent Activity */}
            <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl lg:col-span-1 w-full h-full flex flex-col">
              <CardHeader className="p-3 xs:p-4 sm:p-5 md:p-6">
                <CardTitle className="text-gray-800 flex items-center space-x-2 text-sm xs:text-base sm:text-lg">
                  <Activity className="w-4 xs:w-5 h-4 xs:h-5 text-blue-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 pt-0">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : recentSketches.length === 0 ? (
                  <div className="text-center py-4">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs xs:text-sm text-slate-500">No recent activity</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2 xs:space-y-3"
                  >
                    {recentSketches.map((sketch, idx) => (
                      <motion.div
                        key={sketch._id || idx}
                        variants={itemVariants}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/sketch?id=${sketch._id}`)}
                        className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-200 hover:shadow-sm"
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-8 h-8 xs:w-10 xs:h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0"
                        >
                          <PenTool className="w-4 h-4 xs:w-5 xs:h-5 text-amber-600" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs xs:text-sm font-semibold text-gray-800 truncate">{sketch.name || 'Untitled Sketch'}</p>
                          <p className="text-[10px] xs:text-xs text-gray-500">
                            {sketch.updated_at 
                              ? new Date(sketch.updated_at).toLocaleDateString()
                              : sketch.created_at
                              ? new Date(sketch.created_at).toLocaleDateString()
                              : 'Recently'}
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <ArrowRight className="w-3 h-3 xs:w-4 xs:h-4 text-slate-400 flex-shrink-0" />
                        </motion.div>
                      </motion.div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full mt-3 xs:mt-4 text-xs xs:text-sm h-8 xs:h-9 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                      onClick={() => navigate('/sketches/recent')}
                    >
                      View All Activity
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* System Overview Section - Now 2 columns */}
            <div className="lg:col-span-2 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-2 4xl:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12">
            {/* System Status */}
            <Card className="bg-white backdrop-blur-sm border-amber-100 shadow-sm rounded-xl xs:rounded-2xl sm:rounded-2xl w-full h-full flex flex-col min-w-0">
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
                    <motion.div
                      key={system.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700 text-xs xs:text-sm sm:text-base">{system.name}</span>
                      <div className="flex items-center space-x-1 xs:space-x-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                          className="w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full bg-green-500"
                        />
                        <span className="text-green-600 text-xs xs:text-sm font-medium">{system.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <Separator className="my-2 xs:my-3 sm:my-4" />
                
                <div className="text-center">
                  <p className="text-green-600 font-semibold text-xs xs:text-sm sm:text-base">All Systems Operational</p>
                  <p className="text-gray-500 text-xs xs:text-sm">Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
              </CardContent>
            </Card>
        
            </div>
          </motion.div>

          {/* Footer Component */}
          <Footer />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;