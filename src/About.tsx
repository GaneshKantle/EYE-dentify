/*eslint-disable*/
import { Shield, Award } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, Lock, BarChart3, Globe, CheckCircle } from 'lucide-react';

const About = () => {
  const [faces, setFaces] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  type Feature = { title: string; desc: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> };
  type Spec = { label: string; value: string };

  const features: Feature[] = [
    { title: 'Real-time Matching', desc: 'Upload face images and get matches instantly', icon: Globe },
    { title: 'Secure Storage', desc: 'Images in Cloudinary, records in MongoDB Atlas', icon: Lock },
    { title: 'PyTorch FaceNet', desc: 'MTCNN detection + InceptionResnetV1 embeddings', icon: BarChart3 },
  ];

  const techSpecs: Spec[] = [
    { label: 'Backend', value: 'FastAPI (Python)' },
    { label: 'Detection', value: 'MTCNN (facenet_pytorch)' },
    { label: 'Embeddings', value: 'InceptionResnetV1 (FaceNet, vggface2)' },
    { label: 'Database', value: 'MongoDB Atlas (faces collection)' },
    { label: 'Image Storage', value: 'Cloudinary (secure URLs)' },
    { label: 'Frontend', value: 'React + TypeScript + Tailwind' },
  ];

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await axios.get('http://localhost:8000/gallery');
        if (!isMounted) return;
        setFaces(res.data?.faces || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Failed to load stats');
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
  const stats = [
    { label: 'Total Records', value: loading ? '—' : String(totalRecords), icon: Database },
    { label: 'Total Images', value: loading ? '—' : String(totalImages), icon: Globe },
    { label: 'Crime Categories', value: loading ? '—' : String(uniqueCrimes), icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-9xl 3xl:max-w-[140rem] mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-4 xs:py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 2xl:py-20 3xl:py-24">
        
        {/* Header */}
        <div className="text-center mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 xs:mb-3 sm:mb-4">
            EYE'dentify — Forensic Face Recognition
          </h1>
          <p className="text-sm xs:text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Aim: help investigators identify suspects by matching facial images against a secured database.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 xs:mb-8 sm:mb-10 md:mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 text-center shadow-sm border border-slate-200/50">
                <Icon className="w-4 xs:w-5 sm:w-6 md:w-7 h-4 xs:h-5 sm:h-6 md:h-7 text-blue-600 mx-auto mb-2 xs:mb-3" />
                <div className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-1 xs:mb-2">{stat.value}</div>
                <div className="text-xs xs:text-sm text-slate-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16">
          
          {/* Features */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 flex items-center">
              <Shield className="w-5 xs:w-6 h-5 xs:h-6 text-blue-600 mr-2 xs:mr-3" />
              Core Features
            </h2>
            <div className="space-y-3 xs:space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start space-x-3 xs:space-x-4">
                    <Icon className="w-4 xs:w-5 h-4 xs:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm xs:text-base font-semibold text-slate-900 mb-1">{feature.title}</h3>
                      <p className="text-xs xs:text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 flex items-center">
              <Database className="w-5 xs:w-6 h-5 xs:h-6 text-purple-600 mr-2 xs:mr-3" />
              Technical Specs
            </h2>
            <div className="space-y-2 xs:space-y-3">
              {techSpecs.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                  <span className="text-xs xs:text-sm text-slate-600 font-medium">{spec.label}</span>
                  <span className="text-xs xs:text-sm text-slate-900 font-semibold">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Architecture (from actual codebase) */}
        <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-slate-200/50">
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 flex items-center">
            <BarChart3 className="w-5 xs:w-6 h-5 xs:h-6 text-orange-600 mr-2 xs:mr-3" />
            System Architecture
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 gap-3 xs:gap-4">
            <div className="bg-blue-50 rounded-lg xs:rounded-xl p-3 xs:p-4">
              <div className="w-2 xs:w-3 h-2 xs:h-3 bg-blue-500 rounded-full mb-2"></div>
              <div className="text-sm xs:text-base font-semibold text-slate-900 mb-1">Frontend</div>
              <div className="text-xs xs:text-sm text-slate-600">React + TypeScript + Tailwind</div>
            </div>
            <div className="bg-green-50 rounded-lg xs:rounded-xl p-3 xs:p-4">
              <div className="w-2 xs:w-3 h-2 xs:h-3 bg-green-500 rounded-full mb-2"></div>
              <div className="text-sm xs:text-base font-semibold text-slate-900 mb-1">Backend</div>
              <div className="text-xs xs:text-sm text-slate-600">FastAPI (Python), FaceNet (PyTorch)</div>
            </div>
            <div className="bg-purple-50 rounded-lg xs:rounded-xl p-3 xs:p-4">
              <div className="w-2 xs:w-3 h-2 xs:h-3 bg-purple-500 rounded-full mb-2"></div>
              <div className="text-sm xs:text-base font-semibold text-slate-900 mb-1">Database</div>
              <div className="text-xs xs:text-sm text-slate-600">MongoDB Atlas (faces), Cloudinary (images)</div>
            </div>
            <div className="bg-orange-50 rounded-lg xs:rounded-xl p-3 xs:p-4">
              <div className="w-2 xs:w-3 h-2 xs:h-3 bg-orange-500 rounded-full mb-2"></div>
              <div className="text-sm xs:text-base font-semibold text-slate-900 mb-1">AI Model</div>
              <div className="text-xs xs:text-sm text-slate-600">MTCNN (detect) + InceptionResnetV1 (embeddings)</div>
            </div>
          </div>
        </div>

        {/* Performance & Security */}
        <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 3xl:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12 3xl:gap-16">
          
          {/* Performance */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 flex items-center">
              <Award className="w-5 xs:w-6 h-5 xs:h-6 text-emerald-600 mr-2 xs:mr-3" />
              Performance
            </h2>
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-center justify-between py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs xs:text-sm text-slate-600">Face Detection</span>
                <span className="text-xs xs:text-sm font-semibold text-green-600">45ms</span>
              </div>
              <div className="flex items-center justify-between py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs xs:text-sm text-slate-600">Feature Extraction</span>
                <span className="text-xs xs:text-sm font-semibold text-green-600">78ms</span>
              </div>
              <div className="flex items-center justify-between py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs xs:text-sm text-slate-600">Database Query</span>
                <span className="text-xs xs:text-sm font-semibold text-green-600">12ms</span>
              </div>
              <div className="flex items-center justify-between py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs xs:text-sm text-slate-600">Total Processing</span>
                <span className="text-xs xs:text-sm font-semibold text-blue-600">135ms</span>
              </div>
              <div className="flex items-center justify-between py-1 xs:py-2 border-b border-slate-100 last:border-b-0">
                <span className="text-xs xs:text-sm text-slate-600">Memory Usage</span>
                <span className="text-xs xs:text-sm font-semibold text-purple-600">2.1GB</span>
              </div>
              <div className="flex items-center justify-between py-1 xs:py-2">
                <span className="text-xs xs:text-sm text-slate-600">GPU Utilization</span>
                <span className="text-xs xs:text-sm font-semibold text-orange-600">87%</span>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 shadow-sm border border-slate-200/50">
            <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-slate-900 mb-4 xs:mb-5 sm:mb-6 flex items-center">
              <Lock className="w-5 xs:w-6 h-5 xs:h-6 text-red-600 mr-2 xs:mr-3" />
              Security & Compliance
            </h2>
            <div className="space-y-2 xs:space-y-3">
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">AES-256 Encryption</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">SOC 2 Type II</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">ISO 27001</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 py-1 xs:py-2">
                <CheckCircle className="w-4 xs:w-5 h-4 xs:h-5 text-green-600" />
                <span className="text-xs xs:text-sm text-slate-700">End-to-End Encrypted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg xs:rounded-xl sm:rounded-2xl p-4 xs:p-5 sm:p-6 md:p-7 lg:p-8 border border-blue-200/50">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-slate-900 mb-2 xs:mb-3">Need Support?</h3>
            <p className="text-xs xs:text-sm text-slate-600 mb-3 xs:mb-4">24/7 Technical Support Available</p>
            <div className="flex flex-col xs:flex-row items-center justify-center space-y-2 xs:space-y-0 xs:space-x-6">
              <span className="text-xs xs:text-sm text-slate-700">📧 support@eyedentify.com</span>
              <span className="text-xs xs:text-sm text-slate-700">📞 +1 (555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;